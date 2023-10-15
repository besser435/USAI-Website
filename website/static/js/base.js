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
        const chatLink = document.getElementById("players-link");
        chatLink.classList.add("active");
        break;
    case "/bug_bounty":
        const bbLink = document.getElementById("bb-link");
        bbLink.classList.add("active");
        break;
}

// Now just passing the last commit in the base template.
// This might be better eventually, idk.
// // Show the site version in the footer
// const apiUrl = `https://api.github.com/repos/besser435/USA-Industries-Website/commits?per_page=1`;
// fetch(apiUrl)
//     .then(response => response.json())
//     .then(data => {
//         const commitDate = new Date(data[0].commit.author.date);
//         const formattedDate = commitDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
//         document.getElementById("site-version").textContent = `Updated ${formattedDate}`;
//     })
//     .catch(error => {
//         console.error("Error fetching data from GitHub API:", error);
//     });