$(document).ready(function () {
    function initialize() {
        widgetSlide();
        widgetSlideInterval();
        eventHandler();
    }

    function eventHandler() {
        $(document).on('click', function (e) {
            if ($(e.target).hasClass('prev-btn')) {
                widgetSlide(currentIndex - 1, -1);
            } else if ($(e.target).hasClass('next-btn')) {
                widgetSlide(currentIndex + 1, 1);

            }
        });
    }

    let currentIndex = 0;
    const $dashboardContainer = $(document).find(".dashboard");
    const $widgetContainers = $dashboardContainer.find(".widgetContainer");
    const totalContainers = $widgetContainers.length;
    function widgetSlide(targetIndex, slideDirection) {
        console.log(targetIndex)
        console.log(currentIndex)
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

    let slideIntervaId;
    let isWidgetSliding = false;
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