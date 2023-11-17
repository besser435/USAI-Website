function formatLastOnline(lastOnlineTimestamp) {
    const now = new Date();
    const lastOnline = new Date(parseInt(lastOnlineTimestamp) * 1000); // Convert to milliseconds
    const timeDiff = now - lastOnline;

    // Calculate time differences
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    let formattedTime = " last seen ";

    if (days > 0) {
        formattedTime += `${days} day${days > 1 ? "s" : ""}, `;
    }

    if (hours > 0) {
        formattedTime += `${hours} hour${hours > 1 ? "s" : ""}, `;
    }

    if (timeDiff < 15_000) { // effectively minutes. Must be the same as the interval in updatePlayerInfo()
        formattedTime = " is currently online";
    } else {
        formattedTime += `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    return formattedTime;
}


function createProfilePicture(player) {
    const profilePic = document.createElement("img");
    profilePic.className = "p-profile-pic";
    profilePic.src = `https://usa-industries.net/get_skin?player=${player.username}`;
    profilePic.alt = "Profile Picture";
    profilePic.setAttribute("data-username", player.username);

    return profilePic;
}


function updatePlayerInfo() {
    fetch("https://usa-industries.net/get_player_data")
        .then(response => response.json())
        .then(data => {
            const playerBox = document.querySelector(".player-box");
            playerBox.innerHTML = "";

            data.forEach(player => {
                const formattedLastOnline = formatLastOnline(player.last_on_time);
                const playerElement = document.createElement("div");
                playerElement.className = "username";

                // Profile picture
                const profilePic = createProfilePicture(player);
                playerElement.appendChild(profilePic);

                // Username and Last online span
                const usernameLastOnlineElement = document.createElement("span");
                usernameLastOnlineElement.innerHTML = `<strong>${player.username}</strong>${formattedLastOnline}`;
                usernameLastOnlineElement.setAttribute("data-last-online", player.last_on_time);

                // Append elements
                playerElement.appendChild(usernameLastOnlineElement);
                playerBox.appendChild(playerElement);
            });

            var notFoundElement = document.createElement("p");
            notFoundElement.setAttribute("id", "no-users-found")
            notFoundElement.style.display = "none";
            notFoundElement.textContent = "No players found with that username";
            playerBox.appendChild(notFoundElement);
        })
        .catch(error => {
            console.error("Error fetching player info:", error);
        });
}
updatePlayerInfo();
setInterval(updatePlayerInfo, 15_000);


document.addEventListener("DOMContentLoaded", function () {
    // Last online time formatter
    const lastOnlineElements = document.querySelectorAll("[data-last-online]");
    lastOnlineElements.forEach((element) => {
        const lastOnlineTimestamp = element.getAttribute("data-last-online");
        const formattedTime = formatLastOnline(lastOnlineTimestamp);
        element.textContent = formattedTime;
    });


    // Search for users in All Players
    const userSearchInput = document.getElementById("user-search");
    let currentSearchText = "";
    userSearchInput.addEventListener("input", function() {

        const searchText = userSearchInput.value.toLowerCase();
        currentSearchText = searchText;

        // NOTE search function, but without auto updates and the stupid reapplySearch function
        // const usernames = document.querySelectorAll(".username");   // Has to be here, not above event listener
        // let usersFound = false;
        
        // usernames.forEach(function(username) {
        //     const usernameText = username.querySelector("strong").innerText.toLowerCase(); // Fetch strong element as to only get username
        //     if (usernameText.includes(searchText)) {
        //         //username.style.display = "block";
        //         usersFound = true;
        //         console.log("found");
        //     } else {
        //         //username.style.display = "none";
        //     }
        // });
    
        // // Display "No players found" message if no users are found
        // if (!usersFound) {
        //     noUsersFoundMessage.style.display = "block";
        // } else {
        //     noUsersFoundMessage.style.display = "none";
        // }
    })


    function reapplySearch() {  // this is so stupid
        // maybe just pause updates while in a search
        // or just do this the right way and require the event listener on updates.
        
        userSearchInput.value = currentSearchText;

        const usernames = document.querySelectorAll(".username");
        let usersFound = false;

        usernames.forEach(function (username) {
            const usernameText = username.querySelector("strong").innerText.toLowerCase();
            if (usernameText.includes(currentSearchText)) {
                username.style.display = "flex";    // see CSS .username display: value
                usersFound = true;
            } else {
                username.style.display = "none";
            }
        });

        // Display "No players found" message if no users are found
        const noUsersFoundMessage = document.getElementById("no-users-found");
        if (!usersFound) {
            noUsersFoundMessage.style.display = "block";
        } else {
            noUsersFoundMessage.style.display = "none";
        }
    }
    setInterval(reapplySearch, 10);



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
