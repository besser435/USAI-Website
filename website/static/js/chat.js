

// NOTE when selling this, make sure people can't just do
// usa-industries.net/static/js/chatLogger.js and get the source code

// TODO: make favicon not look terrible, make the logic not stupid
let hasUnreadMessages = false;
const favicon = new Favico({
    animation: "none",
    bgColor: "#FF0000",
});


function getFocus(){    // Focus event listeners weren't consistent in some cases
    if (document.hasFocus()) {
        hasUnreadMessages = false;
        updateFavicon();
    }
}
setInterval(getFocus, 300);
// window.addEventListener('focus', function() {
//     hasUnreadMessages = false;
//     updateFavicon();
// });


function updateFavicon() {
    if (hasUnreadMessages) {
        favicon.badge("!");
    } else {
        favicon.reset();
    }
}


function isScrolledToBottom(element) {
    return element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
}


function updateButtonVisibility() {
    const messageWindow = document.getElementById("message-window");
    const scrollButton = document.getElementById("scroll-to-bottom");

    if (isScrolledToBottom(messageWindow)) {
        scrollButton.style.opacity = "0"; // Hide the button if scrolled to the bottom
    } else {
        scrollButton.style.opacity = "1"; // Show the button if not scrolled to the bottom
    }
}
setInterval(updateButtonVisibility, 200);


document.addEventListener("DOMContentLoaded", function () {
    window.onload = function () {
        // Set the default scroll position to the bottom
        // wait for the chat messages and CSS to load,
        // or else the scrollHeight will be incorrect (something with CSS margins loading later)
        const messageWindow = document.getElementById("message-window");
        if (messageWindow) {
            messageWindow.scrollTop = messageWindow.scrollHeight;
        }

        // Add a scroll event listener to the message window
        messageWindow.addEventListener("scroll", updateButtonVisibility);

        // Disable auto-scroll if the user manually scrolls up and vice versa
        const autoScrollCheckbox = document.getElementById("auto-scroll");
        messageWindow.addEventListener("scroll", function () {
            if (isScrolledToBottom(messageWindow)) {
                autoScrollCheckbox.checked = true;
            } else {
                autoScrollCheckbox.checked = false;
            }
            updateButtonVisibility();
        });
    };
});

let lastDisplayedTimestamp = 0; // Needs to be outside the function so it doesn't reset
function fetchNewMessages() {
    fetch(`/get_new_messages?lastTimestamp=${lastDisplayedTimestamp}`)
        .then((response) => response.json())
        .then((data) => {
            const messageWindow = document.getElementById("message-window");
            const autoScrollCheckbox = document.getElementById("auto-scroll");

            data.forEach((message) => {
                const messageContainer = document.createElement("div"); // Container for both image and text
                messageContainer.classList.add("message-container");

                const clProfilePic = document.createElement("img");
                clProfilePic.classList.add("cl-profile-pic");
                if (message.sender === "[SYSTEM]") {
                    clProfilePic.src = `/static/[SYSTEM].png`;
                }
                else if (message.sender.includes("[Discord]")) {
                    clProfilePic.src = `/static/imgs/discord.png`;
                }
                else {                
                    clProfilePic.src = `/get_skin?player=${message.sender}`;
                }

                const newMessage = document.createElement("p");
                const timestamp = new Date(parseInt(message.timestamp));
                const options = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
                const formattedTimestamp = timestamp.toLocaleDateString('en-US', options);

                newMessage.innerHTML = `(${formattedTimestamp}) <strong>${message.sender}</strong>: ${message.message}`;

                lastDisplayedTimestamp = message.timestamp;

                messageContainer.appendChild(clProfilePic);
                messageContainer.appendChild(newMessage);
                messageWindow.appendChild(messageContainer);

                hasUnreadMessages = true;
            });

            updateFavicon();

            if (isScrolledToBottom(messageWindow)) {
                messageWindow.scrollTop = messageWindow.scrollHeight;
            }

            if (autoScrollCheckbox.checked) {
                scrollToBottom();
            }
        })
        .catch((error) => {
            console.error("Error fetching new messages:", error);
        });
}
fetchNewMessages();
setInterval(fetchNewMessages, 2000);


function fetchMiscData() {
    fetch("/get_misc")
        .then((response) => response.json())
        .then((data) => {
            const messagesLogged = data.messages_logged;
            const messagesLoggedElement = document.getElementById("messages-logged");
            const formattedMessagesLogged = messagesLogged.toLocaleString();
            messagesLoggedElement.textContent = formattedMessagesLogged;
            
            const weather = data.weather;
            const weatherElement = document.getElementById("weather");
            weatherElement.textContent = weather;

            const heartbeat = data.heartbeat;
            const heartbeatElement = document.getElementById("heartbeat");
            heartbeatElement.textContent = heartbeat;
        }
    )
    .catch((error) => {
        console.error("Error fetching misc data:", error);
    });
}
fetchMiscData(); 
setInterval(fetchMiscData, 2000);


function updateOnlineUsers() {
    fetch("/get_online_users")
        .then((response) => response.json())
        .then((data) => {
            const onlineUserList = document.getElementById("online-user-window");
            
            if (data.length > 0) {
                onlineUserList.innerHTML = ""; // Clear previous content
                data.forEach((player) => {
                    const userElement = document.createElement("div");
                    userElement.classList.add("user-container");

                    const opProfilePic = document.createElement("img");
                    opProfilePic.src = `/get_skin?player=${player.username}`;
                    opProfilePic.alt = "Profile Picture";
                    opProfilePic.classList.add("op-profile-pic");

                    const usernameElement = document.createElement("p");
                    usernameElement.innerHTML = `<strong>${player.username}</strong>`;
                    usernameElement.classList.add("username");

                    userElement.appendChild(opProfilePic);
                    userElement.appendChild(usernameElement);

                    onlineUserList.appendChild(userElement);
                });
            } else {
                onlineUserList.innerHTML = "<p>No one is online</p>";
            }
        })
        .catch((error) => {
            console.error("Error fetching online users:", error);
        });
}
updateOnlineUsers();
setInterval(updateOnlineUsers, 2000);


function scrollToBottom() {
    const messageWindow = document.getElementById("message-window");
    messageWindow.scrollTop = messageWindow.scrollHeight;

    // Update the button visibility after manually scrolling to the bottom
    updateButtonVisibility();
}


function sendMessage() {
    const authorization = document.getElementById("authorization").value;
    const message = document.getElementById("message").value;

    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization,
        },
        body: JSON.stringify({ message: message }),
        
    })
    .then(response => {
        if (response.ok) {
            document.getElementById("message-status").innerHTML = "Sent!";
            document.getElementById("message-status").style.color = "#1cc51c";
            document.getElementById("message").value = "";
        } else {
            document.getElementById("message-status").innerHTML = "Error " + response.status;
            document.getElementById("message-status").style.color = "red";
        }
    })
}

// once loaded
    //Throws error and prevents favicon from updating
