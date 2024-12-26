$(document).ready(function () {
    let currentSlide = 0;
    const widgetContainer = document.querySelector('.widgetContainer');
    const totalWidgets = document.querySelectorAll('.widget').length;
    const widgetWidth = document.querySelector('.widget').offsetWidth + 20; // widget width + gap

    function goToSlide(slideIndex) {
        if (slideIndex < 0) {
            currentSlide = totalWidgets - 1;
        } else if (slideIndex >= totalWidgets) {
            currentSlide = 0;
        } else {
            currentSlide = slideIndex;
        }

        const offset = -currentSlide * widgetWidth;
        widgetContainer.style.transform = `translateX(${offset}px)`;
    }

    document.getElementById('prev-btn').addEventListener('click', () => {
        goToSlide(currentSlide - 1);
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        goToSlide(currentSlide + 1);
    });

    setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 5000); // 5초마다 자동 슬라이드
});