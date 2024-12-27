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
                widgetSlidePage(currentIndex - 1, -1);
            } else if ($(e.target).hasClass('next-btn')) {
                widgetSlidePage(currentIndex + 1, 1);

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

        // 새로운 슬라이드 위치로 이동
        const $current = $($widgetContainers[currentIndex]);
        const $target = $($widgetContainers[targetIndex]);


        // 현재 컨테이너와 타겟 컨테이너의 상태 초기화
        if (slideDirection === 1) {
            $target
                .removeClass("slideLeft slideRight active")
                .addClass("slideRight")
            // .css('transform', 'translateX(100%)');
        } else {
            $target
                .removeClass("slideLeft slideRight active")
                .addClass("slideLeft")
            // .css('transform', 'translateX(-100%)');
        }

        // 애니메이션 적용
        setTimeout(() => {
            $current.removeClass("active").addClass(slideDirection === 1 ? "slideLeft" : "slideRight");
            $target.removeClass(slideDirection === 1 ? "slideRight" : "slideLeft").addClass("active");

            // 애니메이션 완료 처리
            isWidgetSliding = false;
        }, 10);

        currentIndex = targetIndex; // 현재 인덱스 업데이트

        // 타겟 컨테이너를 강제로 등장 위치로 설정
        if (slideDirection === 1) {
            // $target.addClass("slideRight").css("transform", "translateX(100%)");
        } else {
            // $target.addClass("slideLeft").css("transform", "translateX(-100%)");
        }

        // 현재 컨테이너에 사라지는 애니메이션 적용
        if (slideDirection === 1) {
            $current.removeClass("active").addClass("slideLeft");
            $target.removeClass("slideRight").addClass("active");
        } else {
            $current.removeClass("active").addClass("slideRight");
            $target.removeClass("slideLeft").addClass("active");
        }

        // 애니메이션 종료 후 초기화
        setTimeout(() => {
            // $current.removeClass("slideOutLeft slideOutRight");
            // $target.removeClass("slideInLeft slideInRight").css("transform", "");
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