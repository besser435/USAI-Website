import requests
from usai_secrets import API_KEY as API_KEY

jackpot = 7500
USAI_bonus = 7500
ticket_price = 800
draw_date = "???"


def update_lotto_request():
    request = requests.post("https://usa-industries.net/update_lottery", data={
        "jackpot": jackpot,
        "USAI_bonus": USAI_bonus,
        "ticket_price": ticket_price,
        "draw_date": draw_date
    }, headers={
        "API_key": API_KEY
    })

    print(request.status_code)
update_lotto_request()
