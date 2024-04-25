import os
import time
import logging
import subprocess
import json
import datetime
import requests
import app_secrets
import csv

from cachetools import TTLCache, cached

from flask import (Flask, redirect, render_template, request, abort,
                   send_from_directory, url_for, jsonify)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("logger")

last_commit_date = None
PLAYER_API = app_secrets.PLAYER_API 
MISC_API = app_secrets.MISC_API
AUTHORIZED_API_KEY= app_secrets.AUTHORIZED_API_KEY
ONLINE_USERS_API = app_secrets.ONLINE_USERS_API
CHAT_PATH = app_secrets.CHAT_PATH


# NOTE Variables
jackpot = 0 
USAI_bonus = 0
ticket_price = 0
draw_date = "TBA"


# NOTE Helper functions
def authenticate_api_request():
    api_key = request.headers.get("API_key")

    if api_key != AUTHORIZED_API_KEY:
        abort(401)  # Unauthorized

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

@app.route("/players")  # Chat page
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
    #with open("error_log.txt", "a") as f:
        #f.write(f"Error {error} on URL: {request.url} at time: {int(time.time())}\n")
    return render_template("404.html"), 404

@app.route("/sign_in")  # Sign in page
def sign_in():
    return render_template("sign_in.html")

@app.route("/chat")  # Chat page
def chat():
    return render_template("chat.html")



# NOTE API stuff
#cache = TTLCache(maxsize=20, ttl=2) 
"""BUG cache throws I/O error. This didn't happen before, probably because the caches weren't
actually being applied to the function since the decorator was was above the flask route.
"""

@app.route("/get_player_data", methods=["GET"])
#@cached(cache)
def get_player_data():
    try:
        request = requests.get(PLAYER_API)
        if request.status_code == 200:
            all_players = request.json()
            return all_players  # TODO make returned data prettier json dump indent=4
        else:
            logging.error(f"Internal (hop 1) error on get_player_data: {request.status_code}")
            return "Internal (hop 1) error on get_player_data", 500
    except Exception as e:
        logging.error(f"Internal error on get_player_data: {e}")
        return "Internal error on get_player_data", 500

@app.route("/get_misc", methods=["GET"])
#@cached(cache)
def get_misc():
    try:
        request = requests.get(MISC_API)
        if request.status_code == 200:
            return request.json()
        else:
            logging.error(f"Internal (hop 1) error on get_misc: {request.status_code}")
            return "Internal (hop 1) error on get_misc", 500
    except Exception as e:
        logging.error(f"Internal error on get_misc: {e}")
        return "Internal error on get_misc", 500

@app.route("/get_skin", methods=["GET"])
#@cached(cache)
# TODO fix slowness. The first load after TTL expires is slow. return data, then refresh skins for the next request.
def get_skins():    
    if not os.path.exists("skins/"):
        os.makedirs("skins/")
        logging.info("Created skins directory")

    player = request.args.get("player")
    # Create skins for new players/give skins a TTL of 4 hours
    if not os.path.exists(f"skins/{player}.png")  or (time.time() - os.path.getmtime(f"skins/{player}.png")) > 14400:
        SKINS_URL = f"http://playteawbeta.apexmc.co:1848/tiles/faces/16x16/{player}.png"    # NOTE should be an envar
        response = requests.get(SKINS_URL)

        if response.status_code == 200:
            with open(f"skins/{player}.png", "wb") as f:
                f.write(response.content)
            logging.info(f"Downloaded skin for {player}")
            return send_from_directory("skins/", f"{player}.png")
        else:
            logging.error(f"Error downloading skin from Dynmap. {response.status_code}")

            # Fix for when the file is not on the remote Dynmap, but the player has been indexed before.
            # This happens after a backup was restored, but did not include the skins directory on the Dynmap.
            # Players would need to rejoin the server so the Dynmap can store their skin again so we can fetch it.
            try:
                return send_from_directory("skins/", f"{player}.png")
            except Exception as e:
                return "Skin not present on Dynmap or local disk", 500
    else:
        try:
            return send_from_directory("skins/", f"{player}.png")
        except Exception as e:
            logging.error(f"Error getting skin from local storage: {e}")
            return "Error getting skin from local storage", 500

@app.route("/get_online_users", methods=["GET"])
def get_online_users():
    try:
        request = requests.get(ONLINE_USERS_API)
        if request.status_code == 200:
            return request.json()
        else:
            logging.error(f"Internal (hop 1) error on get_misc: {request.status_code}")
            return "Internal (hop 1) error on get_misc", 500
    except Exception as e:
        logging.error(f"Internal error on get_misc: {e}")
        return "Internal error on get_misc", 500

@app.route("/get_new_messages", methods=["GET"])    # Update chat messages on /chat
def get_new_messages():
    messages = []
    last_timestamp = request.args.get("lastTimestamp", default="0")  # Get last timestamp from query parameter
    try:
        with open(CHAT_PATH, "r") as f:
            reader = csv.reader(f)
            next(reader)  # Skip the header line
            lines = list(reader)

            for line in lines[-1000:]:  # Get the last x messages from the end of the list
                timestamp, sender, message = line
                if timestamp > last_timestamp:  # Check if message is newer than the last displayed timestamp
                    messages.append({"timestamp": timestamp, "sender": sender, "message": message})
    except FileNotFoundError:
        print("Chat log file not found")
    return messages

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
    except Exception as e:
        logging.error(f"Internal error on update_lottery: {e}")
        return "Internal error on update_lottery", 500


if __name__ == "__main__":
   app.run()
