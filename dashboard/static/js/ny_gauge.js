// am4core.ready는 amCharts 4의 코드 초기화 진입점입니다. 모든 차트 설정 및 렌더링 작업은 이 함수 내부에서 실행됩니다.
am4core.ready(function() {

    // Apply theme
    // 애니메이션 테마를 차트에 적용합니다. 이로 인해 차트 요소가 부드럽게 나타나는 애니메이션 효과를 가지게 됩니다.
    am4core.useTheme(am4themes_animated);
  
    // Create chart
    // am4charts.GaugeChart를 생성하여 HTML의 id="chartdiv"인 요소에 렌더링합니다.
    var chart = am4core.create("chartdiv", am4charts.GaugeChart);
    
    // acchart 배너 로고 제거
    if(chart.logo){
        chart.logo.disabled=true;
    }
    
    // innerRadius를 음수 값으로 설정하여 원형 차트의 중심을 바깥쪽으로 확장합니다.
    chart.radius = 120; // Adjust inner radius
    chart.innerRadius = -30; // Adjust inner radius

    // **원형 크기 조절**: 각도 설정
    chart.startAngle = 180; // 게이지 시작 각도 (180도 = 반원)
    chart.endAngle = 360;   // 게이지 끝 각도 (360도 = 전체 원)
  
    // Create axis
    // ValueAxis를 추가하여 게이지의 축을 정의합니다
    var axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = 0;  // 축의 최소값
    axis.max = 300;  // 축의 최대값
    axis.strictMinMax = true;  // 설정된 최소/최대 값을 강제로 사용하도록 지정합니다.
  
    // Add ranges
    // 범위(Range)는 게이지의 각 구역을 나타내며, 각 구역에 색상과 이름을 추가합니다.
    // startValue와 endValue: 범위의 시작과 끝 값.
    var bandsData = [
      { title: "", color: "#ee1f25", startValue: 0, endValue: 60 },
      { title: "", color: "#f04922", startValue: 60, endValue: 120 },
      { title: "", color: "#fdae19", startValue: 120, endValue: 180 },
      { title: "", color: "#f3eb0c", startValue: 180, endValue: 240 },
      { title: "", color: "#0f9747", startValue: 240, endValue: 300 }
    ];
  
    bandsData.forEach(function(data) {
      var range = axis.axisRanges.create();
      range.value = data.startValue;
      range.endValue = data.endValue;
      range.axisFill.fill = am4core.color(data.color);  // axisFill.fill: 범위의 색상
      range.axisFill.fillOpacity = 1.0;
      range.label.text = data.title;  // label.text: 범위에 표시할 이름.
      range.label.inside = true;  // label.inside: 범위 내부에 레이블 배치.
      range.label.location = 0.5; // label.location: 레이블의 위치 비율(0.5로 중앙에 위치).
      range.label.radius = 50;  // label.radius: 레이블의 반지름.
      range.label.fill = am4core.color("#ffffff");
    });
  
    // 축의 숫자 레이블 설정
    // 축 레이블 템플릿에 adapter를 사용하여 표시할 텍스트를 조정합니다.
    // bandsData의 startValue 또는 endValue에 해당하는 값만 텍스트로 표시하고, 나머지는 빈 문자열("")을 반환하여 숨깁니다.
    axis.renderer.labels.template.adapter.add("text", function(text, target) {
        // 축의 시작값과 끝값만 반환
        const value = target.dataItem.value;
        return bandsData.some(band => band.startValue === value || band.endValue === value) 
          ? text 
          : "";
      });
    
    // Add a hand (needle)
    // 게이지의 바늘을 추가하여 현재 값을 나타냅니다.
    var hand = chart.hands.push(new am4charts.ClockHand());
    hand.value = 50;  // value: 바늘이 처음 가리킬 값(50).
    hand.pin.radius = 25;  // pin.radius: 바늘의 중심 핀 크기.
    hand.radius = am4core.percent(85);  // radius: 바늘의 길이(게이지의 90%).
    hand.innerRadius = am4core.percent(23);  // radius: 바늘의 길이(게이지의 90%).
    hand.startWidth = 10;  // startWidth: 바늘의 시작 폭.
    hand.fill = am4core.color("#000000"); // 바늘의 색상
    hand.pin.fill = am4core.color("#000000"); // 핀의 색상

    // Add label for current value at needle's center
    var valueLabel = chart.radarContainer.createChild(am4core.Label);
    valueLabel.text = hand.value.toString(); // Set initial value
    valueLabel.horizontalCenter = "middle";
    valueLabel.verticalCenter = "middle";
    valueLabel.fontSize = 20;
    valueLabel.fill = am4core.color("#ffffff");
    valueLabel.padding(10, 10, 10, 10);
  
    // Animate the hand and update value label
    setInterval(function() {
        var targetValue = Math.random() * 300;
        hand.showValue(targetValue, 1000, am4core.ease.cubicOut);
        
        // Smoothly update the label during the animation
        var animation = hand.animate(
            { property: "value", to: targetValue },
            1000,
            am4core.ease.cubicOut
        );

        animation.events.on("animationprogress", function() {
            valueLabel.text = Math.round(hand.value).toString();
        });
        
        animation.events.on("animationended", function() {
            valueLabel.text = Math.round(targetValue).toString();
        });
    }, 2000);
  
  }); // end am4core.ready()