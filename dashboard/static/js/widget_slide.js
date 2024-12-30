$(document).ready(function () {
    // Slide 관련 변수
    let currentIndex = 0;
    let isWidgetSliding = false;
    const $widgetWrapper = $(document).find(".widgetWrapper");
    const $widgetContainers = $widgetWrapper.find(".widgetContainer");
    const totalContainers = $widgetContainers.length;

    //  Interval 관련 변수
    let slideIntervaId;
    let isWidgetInterval = false;

    function initialize() {
        // widgetSlideInterval();
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

    function widgetSlidePage(targetIndex, slideDirection) {
        // 슬라이딩 중이면 중단
        if (isWidgetSliding) {
            console.log("슬라이딩 중입니다.");
            return;
        }

        // 슬라이드 진행 상태 설정
        isWidgetSliding = true;

        // 슬라이드 실패 애니메이션 적용
        if (targetIndex < 0 || targetIndex >= totalContainers) {
            $($widgetContainers[currentIndex]).addClass("slideFail");
            // slideFail 애니메이션 시간과 동일
            setTimeout(() => {
                $($widgetContainers[currentIndex]).removeClass("slideFail");
                isWidgetSliding = false;
            }, 300);
            return;
        }

        $widgetContainers[currentIndex].classList.remove("active");
        $widgetContainers[targetIndex].classList.add("active");

        currentIndex = targetIndex; // 현재 인덱스 업데이트
        isWidgetSliding = false; // 슬라이딩 상태 해제
    }



    function widgetSlide(targetIndex, slideDirection) {
        // 슬라이딩 중이면 중단
        if (isWidgetSliding) {
            console.log("슬라이딩 중입니다.");
            return;
        }

        // 슬라이드 진행 상태 설정
        isWidgetSliding = true;

        // 슬라이드 실패 애니메이션 적용
        if (targetIndex < 0 || targetIndex >= totalContainers) {
            $($widgetContainers[currentIndex]).addClass("slideFail");
            // slideFail 애니메이션 시간과 동일
            setTimeout(() => {
                $($widgetContainers[currentIndex]).removeClass("slideFail");
                isWidgetSliding = false;
            }, 300);
            return;
        }

        $widgetContainers.each((index, element) => {
            const $element = $(element);

            if (index < targetIndex - 1) {
                $element.removeClass("active leftOut slideLeft rightOut slideRight slideHide").addClass("leftOut slideHide");
            } else if (index === targetIndex - 1) {
                // 이전 컨테이너
                $element.removeClass("active leftOut slideLeft rightOut slideRight slideHide").addClass("slideLeft");
            } else if (index === targetIndex) {
                // 타겟 컨테이너
                $element.removeClass("active leftOut slideLeft rightOut slideRight slideHide").addClass("active");
            } else if (index === targetIndex + 1) {
                // 다음 컨테이너
                $element.removeClass("active leftOut slideLeft rightOut slideRight slideHide").addClass("slideRight");
            } else if (index > targetIndex + 1) {
                $element.removeClass("active leftOut slideLeft rightOut slideRight slideHide").addClass("rightOut slideHide");
            } else {
                // 그 외 숨기기
                $element.removeClass("active slideLeft slideRight").addClass("slideHide");
            }

        });

        // 애니메이션 종료 후 초기화
        setTimeout(() => {
            currentIndex = targetIndex; // 현재 인덱스 갱신
            isWidgetSliding = false; // 슬라이딩 상태 해제
        }, 500); // 애니메이션 시간과 일치
    }


    function widgetContainerSlide(targetIndex, slideDirection) {
        // 슬라이딩 중이면 중단
        if (isWidgetSliding) {
            console.log("슬라이딩 중입니다.");
            return;
        }

        // 슬라이드 진행 상태 설정
        isWidgetSliding = true;

        // 슬라이드 실패 애니메이션 적용
        if (targetIndex < 0 || targetIndex >= totalContainers) {
            $($widgetContainers[currentIndex]).addClass("slideFail");
            // slideFail 애니메이션 시간과 동일
            setTimeout(() => {
                $($widgetContainers[currentIndex]).removeClass("slideFail");
                isWidgetSliding = false;
            }, 300);
            return;
        }

        // 새로운 슬라이드 위치로 이동
        const translateX = -targetIndex * 100; // 슬라이드 위치 계산
        $widgetWrapper.css("transform", `translateX(${translateX}%)`);
        currentIndex = targetIndex; // 현재 인덱스 업데이트
        isWidgetSliding = false;

    }

    function widgetSlideInterval() {
        if (isWidgetInterval) {
            clearInterval(slideIntervaId);
            isWidgetInterval = false;
        }

        isWidgetInterval = true;
        slideIntervaId = setInterval(() => {
            widgetSlide(currentIndex + 1, 1);
        }, 5000); // 5초마다 자동 슬라이드

    }

    initialize();
});