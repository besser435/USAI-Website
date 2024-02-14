// Navbar
const currentPath = window.location.pathname;
switch (currentPath) {
    case "/":
        const homeLink = document.getElementById("home-link");
        homeLink.classList.add("active");
        break;
    case "/lottery":
        const lotteryLink = document.getElementById("lottery-link");
        lotteryLink.classList.add("active");
        break;
    case "/players":
        const playersLink = document.getElementById("players-link");
        playersLink.classList.add("active");
        break;
    case "/chat":
        const chatLink = document.getElementById("chat-link");
        chatLink.classList.add("active");
        break;
    case "/bug_bounty":
        const bbLink = document.getElementById("bb-link");
        bbLink.classList.add("active");
        break;
}
