import os
import time
import logging
import subprocess
import json
import datetime
import requests

from cachetools import TTLCache, cached

from flask import (Flask, redirect, render_template, request, abort,
                   send_from_directory, url_for, jsonify)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("logger")

last_commit_date = None
PLAYER_API = os.environ["PLAYER_API"]


# Run on startup
def on_start():
    global last_commit_date
    try:
        logger.info("Server started")

        commits_url = "https://api.github.com/repos/besser435/USAI-Website/commits?per_page=1"
        latest_commit = json.loads(requests.get(commits_url).text)[0]
        last_commit_date = datetime.datetime.strptime(latest_commit["commit"]["author"]["date"], "%Y-%m-%dT%H:%M:%SZ").strftime("%B %d, %Y")
        logger.info(f"Latest commit: {last_commit_date}")
    except Exception as e:
        last_commit_date = "Error fetching last update"
        logger.error(f"Error fetching last update: {e}")
on_start()



# NOTE Variables
jackpot = 0 
USAI_bonus = 0
ticket_price = 0
draw_date = ""



# NOTE Helper functions
def authenticate_api_request():
    api_key = request.headers.get("API_key")
    expected_key = os.environ["AUTHORIZED_API_key"]

    if api_key != expected_key:
        abort(401)  # Unauthorized



# NOTE Web pages
@app.context_processor  # Inject the last update date into the footer
def inject_lcd():
    return {"last_commit_date": last_commit_date}

@app.route("/")
def hello():    # Home page
   return render_template("home.html")

@app.route("/lottery")  # Lottery page
def lottery():

    f_jackpot = "{:,}".format(jackpot)
    f_bonus = "{:,}".format(USAI_bonus)
    f_ticket_price = "{:,}".format(ticket_price)

    return render_template(
        "lottery.html",
        f_jackpot=f_jackpot,
        f_bonus=f_bonus,
        f_ticket_price=f_ticket_price,
        draw_date=draw_date
    )

@app.route("/bug_bounty")   # Bug bounty page
def bug_bounty():
    return render_template("bug_bounty.html")

@app.route("/players")     # Chat page
def players():
    return render_template(
        "players.html",
        offline_users=get_player_data(),
    )

@app.route("/dynmap")   # Dynmap iframe page
def dynmap():
    return render_template("dynmap.html")

@app.errorhandler(404)  # 404 page
def page_not_found(error):
    with open("error_log.txt", "a") as f:
        f.write(f"Error {error} on URL: {request.url} at time: {int(time.time())}\n")
    return render_template("404.html"), 404

@app.route("/sign_in")  # Sign in page
def sign_in():
    return render_template("sign_in.html")



# NOTE API endpoints
cache = TTLCache(maxsize=1, ttl=15)

@cached(cache)
@app.route("/get_player_data", methods=["GET"])
def get_player_data():
    logging.info(f"Got request for /get_player_data")
    try:
        request = requests.get(PLAYER_API)
        if request.status_code == 200:
            all_players = request.json()
            return all_players
        else:
            logging.error(f"Internal (hop 1) error on get_player_data: {request.status_code}")
            return "Internal (hop 1) error on get_player_data", 500

    except Exception as e:
        logging.error(f"Internal error on get_player_data: {e}")
        return "Internal error on get_player_data", 500

@app.route("/update_lottery", methods=["POST"])
def update_lottery():
    authenticate_api_request()
    global jackpot, USAI_bonus, ticket_price, draw_date

    try:
        jackpot = int(request.form["jackpot"])
        USAI_bonus = int(request.form["USAI_bonus"])
        ticket_price = int(request.form["ticket_price"])
        draw_date = request.form["draw_date"]

        return "OK", 200
        #BUG something throws a typeError. Could it be this? Should it be: return "OK", 200"?
        

    except Exception as e:
        logging.error(f"Internal error on update_lottery: {e}")
        return "Internal error on update_lottery", 500



if __name__ == "__main__":
   app.run()
