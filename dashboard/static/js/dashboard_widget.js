$(document).ready(function () {
    // Slide 관련 변수
    let currentIndex = 0;
    const $widgetWrapper = $(document).find(".widgetWrapper");
    const $widgetContainers = $widgetWrapper.find(".widgetContainer");
    const totalContainers = $widgetContainers.length;

    //  Interval 관련 변수
    let slideIntervaId;
    let isWidgetSliding = false;

    function initialize() {
        // widgetSlideInterval();
        eventHandler();
    }

    function eventHandler() {
        $(document).on('click', function (e) {
            console.log(e.target)
            console.log(currentIndex)
            if ($(e.target).hasClass('prev-btn')) {
                console.log(currentIndex)
                widgetSlide(currentIndex - 1, -1);
            } else if ($(e.target).hasClass('next-btn')) {
                console.log(currentIndex)
                widgetSlide(currentIndex + 1, 1);

            }
        });
    }

    function widgetSlide(targetIndex, slideDirection) {
        console.log(currentIndex)
        console.log(targetIndex)
        if (targetIndex < 0) {
            targetIndex = totalContainers - 1;
        } else if (targetIndex >= totalContainers) {
            targetIndex = 0;
        }

        const $current = $($widgetContainers[currentIndex]);
        const $target = $($widgetContainers[targetIndex]);

        // 위치 초기화
        $target.css("left", slideDirection === 1 ? "100%" : "-100%");

        // 방향에 따른 클래스 추가
        if (slideDirection === 1) {
            $current.removeClass("slideInLeft").addClass("slideOutLeft");
            $target.removeClass("slideOutRight").addClass("slideInLeft");
        } else {
            $current.removeClass("slideInRight").addClass("slideOutRight");
            $target.removeClass("slideOutLeft").addClass("slideInRight");
        }

        currentIndex = targetIndex;
    }

    function widgetSlideInterval() {
        if (isWidgetSliding) {
            clearInterval(slideIntervaId);
            isWidgetSliding = false;
        }

        isWidgetSliding = true;
        slideIntervaId = setInterval(() => {
            widgetSlide(currentIndex + 1, 1);
        }, 5000); // 5초마다 자동 슬라이드

    }

    initialize();
});