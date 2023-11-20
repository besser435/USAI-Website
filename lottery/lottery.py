import json
import datetime
import os
import random
import sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))

ENTRIES = 1
TICKET_PRICE = 850
DATE = datetime.datetime.now().strftime("%m-%d-%y %H:%M:%S")


def create_entry(username):
    entry = {
        "username": username,
        "entries": ENTRIES,
        "ticket_price": TICKET_PRICE,
        "total_cost": ENTRIES * TICKET_PRICE,
        "date": DATE
    }
    
    with open(f"{DATE}/entry_{username}.json", "w") as file:
        json.dump(entry, file, indent=4)

def pick_winner():
    entries = []
    for file in os.listdir(DATE):
        if file.startswith("entry_"):
            with open(os.path.join(DATE, file)) as f:
                data = json.load(f)
                entries.append(data)

    entries = [entry["username"] for entry in entries for _ in range(entry["entries"])]
    WINNER = random.choice(entries)

    with open(os.path.join(DATE, "winner.txt"), "w") as f:
        f.write(f"{WINNER} won the lottery on {DATE} with {ENTRIES} entries")

    print("Entries: " + (", ".join(entries)))
    print(f"Winner is: {WINNER}")


# NOTE lots of stupid hard coded directories
# this is way over engineered

if not os.path.exists(DATE):
    os.makedirs(DATE)
else:
    raise FileExistsError("Directory already exists")

# Check if there are command line arguments
if len(sys.argv) < 2:
    print("Usage: python3 lottery.py <username1> <username2> ...")
    sys.exit(1)
for username in sys.argv[1:]:
    create_entry(username)
pick_winner()
