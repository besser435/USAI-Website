function formatLastOnline(lastOnlineTimestamp) {
    const now = new Date();
    const lastOnline = new Date(parseInt(lastOnlineTimestamp) * 1000); // Convert to milliseconds

    const timeDiff = now - lastOnline;

    // Calculate time differences
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    let formattedTime = '';

    if (days > 0) {
        formattedTime += `${days} day${days > 1 ? 's' : ''}, `;
    }

    if (hours > 0) {
        formattedTime += `${hours} hour${hours > 1 ? 's' : ''}, `;
    }

    formattedTime += `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    // if (minutes == 0 && hours == 0) { // only show message if its only 0 minutes // can be buggy
    //     formattedTime += `right now`;
    // } else {
    //     formattedTime += `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    // }

    return formattedTime;
}


document.addEventListener("DOMContentLoaded", function () {
    // Last online time formatter
    const lastOnlineElements = document.querySelectorAll('[data-last-online]');
    lastOnlineElements.forEach((element) => {
        const lastOnlineTimestamp = element.getAttribute('data-last-online');
        const formattedTime = formatLastOnline(lastOnlineTimestamp);
        element.textContent = formattedTime;
    });


    // Search for users in All Players
    const userSearchInput = document.getElementById("user-search");
    const usernames = document.querySelectorAll(".username");
    const noUsersFoundMessage = document.getElementById("no-users-found");
    
    userSearchInput.addEventListener("input", function() {
        const searchText = userSearchInput.value.toLowerCase();
        let usersFound = false; // Track if any users are found
        
        usernames.forEach(function(username) {
            const usernameText = username.querySelector("strong").innerText.toLowerCase(); // Fetch strong element as to only get username
            if (usernameText.includes(searchText)) {
                username.style.display = "block";
                usersFound = true; // At least one user is found
            } else {
                username.style.display = "none";
            }
        });
    
        // Display "No players found" message if no users are found
        if (!usersFound) {
            noUsersFoundMessage.style.display = "block";
        } else {
            noUsersFoundMessage.style.display = "none";
        }
    })


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
