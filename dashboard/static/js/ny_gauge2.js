am4core.ready(function () {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create("chartdiv2", am4charts.XYChart);

    // Remove logo
    if (chart.logo) {
      chart.logo.disabled = true;
    }

    chart.paddingRight = 30;

    // Add data
    var data = [
      { category: "20", value: 0, color: am4core.color("#ee1f25") },
      { category: "40", value: 0, color: am4core.color("#ee1f25") },
      { category: "60", value: 0, color: am4core.color("#ee1f25") },
      { category: "80", value: 0, color: am4core.color("#f04922") },
      { category: "100", value: 0, color: am4core.color("#f04922") },
      { category: "120", value: 0, color: am4core.color("#f04922") },
      { category: "140", value: 0, color: am4core.color("#fdae19") },
      { category: "160", value: 0, color: am4core.color("#fdae19") },
      { category: "180", value: 0, color: am4core.color("#fdae19") },
      { category: "200", value: 0, color: am4core.color("#f3eb0c") },
      { category: "220", value: 0, color: am4core.color("#f3eb0c") },
      { category: "240", value: 0, color: am4core.color("#f3eb0c") },
      { category: "260", value: 0, color: am4core.color("#0f9747") },
      { category: "280", value: 0, color: am4core.color("#0f9747") },
      { category: "300", value: 0, color: am4core.color("#0f9747") },
      // { category: "320", value: 100, color: am4core.color("#0f9747"), isMax: true }
    ];

    chart.data = data;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.labels.template.disabled = true;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 400;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "value";
    series.dataFields.categoryX = "category";
    series.columns.template.propertyFields.fill = "color";
    series.columns.template.propertyFields.stroke = "color";
    series.columns.template.strokeWidth = 2;
    series.columns.template.width = am4core.percent(80); // 컬럼 너비를 줄임
    series.columns.template.marginRight = 5; // 컬럼 사이 간격 추가


    // Add custom X-axis labels
    function addAxisLabel(category, text) {
      var range = categoryAxis.axisRanges.create();
      range.category = category;
      range.label.text = text;
      range.label.fill = am4core.color("#000");
      range.label.fontSize = 15;
      range.grid.strokeOpacity = 0;
    }

    // addAxisLabel("300", "300");
    // addAxisLabel("240", "240");
    // addAxisLabel("180", "180");
    // addAxisLabel("120", "120");
    // addAxisLabel("60", "60");

    // Add a dedicated container for labels
    let labelContainer = chart.createChild(am4core.Container);
    labelContainer.isMeasured = false;

    // Function to update chart for current value
    function highlightProgressively(currentValue) {
      let categories = chart.data.map((item) => item.category);
      let targetIndex = categories.indexOf(currentValue);
      if (targetIndex === -1) return;

      let stepDuration = 200; // Delay between steps
      for (let i = 0; i <= targetIndex; i++) {
        setTimeout(() => {
          chart.data[i].value = (i + 1) * (100 / (targetIndex + 1)); // Incremental height
          chart.invalidateRawData(); // Refresh chart data
        }, i * stepDuration);
      }

      // Add label to current value only after the highlight effect
      setTimeout(() => {
        // Clear existing labels from label container
        labelContainer.children.clear();

        // Create a label for the current value
        let label = labelContainer.createChild(am4core.Label);
        label.text = currentValue;
        label.fontSize = 20;
        label.fill = am4core.color("#000");
        label.horizontalCenter = "middle";
        label.verticalCenter = "bottom";
        label.dy = -10; // Slightly above the bar

        // Position the label at the target column
        let targetColumn = series.columns.getIndex(targetIndex);
        if (targetColumn) {
          label.x = targetColumn.pixelX + targetColumn.pixelWidth / 2; // Align with the column
          label.y = targetColumn.pixelY;
        }
      }, stepDuration * (targetIndex + 1)); // Ensure the label is added after the animation
    }

    // // Example: Set current value
    // var currentValue = "120"; // Change this value dynamically
    // highlightProgressively(currentValue);

    // Automatically update value periodically
    setInterval(function () {
        var randomValue = Math.floor(Math.random() * 15) * 20; // Random value between 0 and 300 (step 20)
        highlightProgressively(randomValue.toString());
    }, 2000);

    // Animate on load
    chart.appear(1000, 100);
  }); // end am4core.ready()