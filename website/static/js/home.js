function startCounterWhenInView() {
    const counterElement = document.getElementById("counter");
    let count = 0;

    function updateCounter() {
        counterElement.innerText = count;
        count++;

        if (count <= 4) {
            setTimeout(updateCounter, 100);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            updateCounter();
        } else {
            count = 0;
        }
    }, {
        threshold: 0.8
    });

    observer.observe(counterElement);
}
document.addEventListener("DOMContentLoaded", startCounterWhenInView);


function chooseAlternateImage() {   // chance for sussy femboy amogus image
    const randomNumber = Math.floor(Math.random() * 30) + 1;
    if (randomNumber === 1) {
        document.getElementById("topImg").src = "/static/imgs/amogus_femboy.png";
    }
}
chooseAlternateImage();
