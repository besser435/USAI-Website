// NOTE this has none of the actual chat functionality. I don't want paid code in the repo.

document.addEventListener("DOMContentLoaded", function () {
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
});
