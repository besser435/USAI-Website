function formatLastOnline(lastOnlineTimestamp, playerPositionTimestamp) {
    const now = new Date();
    const lastOnline = new Date(parseInt(lastOnlineTimestamp) * 1000); // Convert to milliseconds
    const timeDiff = now - lastOnline;

    // Calculate time differences
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    const AFKTimeout = 180;
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeSinceLastMove = currentTime - playerPositionTimestamp;
    const isAFK = timeSinceLastMove > AFKTimeout && lastOnlineTimestamp > currentTime - 10;

    if (isAFK) {
        return "Currently AFK";
    }

    if (timeDiff < 10_000) { // Same as the online check interval
        return "Currently online";
    } else if (days > 0) {
        return `Online ${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
        return `Online ${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
        return `Online ${minutes} min${minutes !== 1 ? "s" : ""} ago`;
    }
}


// BUG does not show text when no players are found
function searchForPlayers(searchText) {
    const playerCards = document.querySelectorAll(".player-card");

    const noUsersFoundElement = document.getElementById("no-users-found");
    
    playerCards.forEach(card => {
        const username = card.getAttribute('data-username').toLowerCase();
        const town = card.getAttribute('data-town').toLowerCase();
        const nation = card.getAttribute('data-nation').toLowerCase();

        // Check if the card's data matches the search text
        if (username.includes(searchText) || town.includes(searchText) || nation.includes(searchText)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }

        if (document.querySelectorAll(".player-card[style='display: none;']").length === playerCards.length) {
            noUsersFoundElement.style.display = "";
        }
    });
}


// BUG setting the timezone manually on Chrome and Firefox will result in the last online time being wrong.


let onlinePlayerCount = 0;
let activePlayerCount = 0;
function updatePlayerInfo() {
    fetch("/get_smp_player_data")
        .then(response => response.json())
        .then(data => {
            const playerGridContainer = document.querySelector(".player-grid-container");
            playerGridContainer.innerHTML = ""; // Clear existing cards
            onlinePlayerCount = 0;
            activePlayerCount = 0;

            data.forEach(player => {

                // TODO: Doing this crap for each card, on every update is 
                // mega stupid. This should be fixed soon, and make it so
                // cards can be flipped, not show stupid tooltips or alerts.

                // Could maybe just keep a list of flipped cards on each update,
                // then re-flip them after an update comes in. Idk, I hate it here.

            
                // Create the card
                const playerCard = document.createElement("div");
                playerCard.className = "player-card";

                // Set data attributes
                playerCard.setAttribute('data-username', player.username);
                playerCard.setAttribute('data-town', player.town);
                playerCard.setAttribute('data-nation', player.nation);

                // Add the profile picture
                const profilePic = document.createElement("img");
                profilePic.className = "player-profile-pic";
                profilePic.src = `/get_smp_skin?uuid=${player.uuid}`;
                profilePic.alt = "Profile Picture";
                playerCard.appendChild(profilePic);

                const AFKTimeout = 180;
                const currentTime = Math.floor(Date.now() / 1000);
                const timeSinceLastMove = currentTime - player.position_timestamp;
                const isAFK = timeSinceLastMove > AFKTimeout && player.last_on_time > currentTime - 10;

                if (isAFK) {
                    profilePic.style.filter = "grayscale(100%)"; // Grey out the profile picture
                }
                
                // Add the username
                const username = document.createElement("p");
                username.className = "player-username";
                username.textContent = player.username;
                playerCard.appendChild(username);
                
                // Add the last online info
                const formattedLastOnline = formatLastOnline(player.last_on_time, player.position_timestamp);
                const lastOnline = document.createElement("p");
                lastOnline.className = "player-last-online";
                lastOnline.textContent = formattedLastOnline;
                playerCard.appendChild(lastOnline);

                // TODO: Redo everything to support card flipping
                playerCard.addEventListener('click', function(event) {
                    event.stopPropagation();
                    alert("Player: " + player.username + "\n" +
                    "Town: " + player.town + "\n" +
                    "Nation: " + player.nation + "\n" +
                    "In overworld: " + player.in_overworld + "\n");
                });


                playerGridContainer.appendChild(playerCard);
                // Check if player is online
                if (player.last_on_time > Math.floor(Date.now() / 1000) - 15) {
                    onlinePlayerCount++;
                }
                
                // Check if player is active
                const lastOnlineTime = parseInt(player.last_on_time);
                const activeDaysAgo = new Date().getTime() / 1000 - (14 * 24 * 60 * 60);
                if (lastOnlineTime >= activeDaysAgo) {
                    activePlayerCount++;
                }
            });


            updateMiscData(data);

            // Reapply search after updating cards
            const userSearchInput = document.getElementById("user-search");
            const searchText = userSearchInput.value.toLowerCase();
            searchForPlayers(searchText);


            var notFoundElement = document.createElement("p");
            notFoundElement.setAttribute("id", "no-users-found")
            notFoundElement.style.display = "none";
            notFoundElement.textContent = "No players found";
            playerGridContainer.appendChild(notFoundElement);
        })
        .catch(error => {
            console.error("Error fetching player info:", error);
        });
}
updatePlayerInfo();
setInterval(updatePlayerInfo, 10_000);


function updateMiscData(data) {
    const onlinePlayerCountElement = document.getElementById("online-player-count");
    if (onlinePlayerCountElement) {
        onlinePlayerCountElement.textContent = onlinePlayerCount;
    }

    const activePlayerCountElement = document.getElementById("total-active-count");
    if (activePlayerCountElement) {
        activePlayerCountElement.textContent = activePlayerCount;
    }

    const totalPlayerCountElement = document.getElementById("total-player-count");
    if (totalPlayerCountElement) {
        totalPlayerCountElement.textContent = `${document.querySelectorAll(".player-username").length}`;
    }




    const townCounts = {};
    const nationCounts = {};

    data.forEach(player => {
        // Only count players who are in a town and have a nation
        if (player.town !== "N/A" && player.nation !== "N/A") {
            townCounts[player.town] = (townCounts[player.town] || 0) + 1;
            nationCounts[player.nation] = (nationCounts[player.nation] || 0) + 1;
        }
    });

    let mostPopulousTown = { name: "", count: 0 };
    let mostPopulousNation = { name: "", count: 0 };

    for (const town in townCounts) {
        if (townCounts[town] > mostPopulousTown.count) {
            mostPopulousTown = { name: town, count: townCounts[town] };
        }
    }

    for (const nation in nationCounts) {
        if (nationCounts[nation] > mostPopulousNation.count) {
            mostPopulousNation = { name: nation, count: nationCounts[nation] };
        }
    }

    const populousTownElement = document.getElementById("most-populous-town");
    if (populousTownElement) {
        populousTownElement.textContent = `${mostPopulousTown.name} (${mostPopulousTown.count})`;
    }

    const populousNationElement = document.getElementById("most-populous-nation");
    if (populousNationElement) {
        populousNationElement.textContent = `${mostPopulousNation.name} (${mostPopulousNation.count})`;
    }


    fetch("/get_smp_misc")
    .then(response => response.json())
    .then(data => {
        const heartbeat = data.heartbeat;

        const date = new Date(heartbeat * 1000);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        
        const heartbeatElement = document.getElementById("heartbeat");
        heartbeatElement.textContent = formattedTime;
    })
    .catch(error => {
        console.error("Error fetching misc data:", error);
    });


    // fetch("/get_smp_misc")
    // .then(response => response.json())
    // .then(data => {
    //     // Formats the UTC -07:00 epoch to local time, then makes it human readable. This is to ensure the system is alive.
    //     const heartbeat = data.heartbeat;

    //     const utcOffset = -7 * 60;
    //     const localEpoch = heartbeat * 1000 + utcOffset * 60 * 1000;
    //     const date = new Date(localEpoch);

    //     const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    //     const heartbeatElement = document.getElementById("heartbeat");
    //     heartbeatElement.textContent = formattedTime;
    // })
    // .catch(error => {
    //     console.error("Error fetching misc data:", error);
    // });


}

document.addEventListener("DOMContentLoaded", function () {
    // Loading animation
    const playerGridContainer = document.querySelector(".player-grid-container");
    for (let i = 0; i < 200; i++) {
        const playerCard = document.createElement("div");
        playerCard.className = "player-card";
        playerGridContainer.appendChild(playerCard);
    }


    // Last online time formatter
    const lastOnlineElements = document.querySelectorAll("[data-last-online]");
    lastOnlineElements.forEach((element) => {
        const lastOnlineTimestamp = element.getAttribute("data-last-online");
        const formattedTime = formatLastOnline(lastOnlineTimestamp);
        element.textContent = formattedTime;
    });


    const userSearchInput = document.getElementById("user-search");
    userSearchInput.addEventListener("input", function() {
        const searchText = userSearchInput.value.toLowerCase();
        searchForPlayers(searchText);
    });


    // Modal
    var modal = document.getElementById("explainerModal");
    var helpButton = document.getElementById("help-button");
    var closeBtn = document.getElementsByClassName("close")[0];

    helpButton.onclick = function() {
        modal.style.display = "block";
    }

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });
});
