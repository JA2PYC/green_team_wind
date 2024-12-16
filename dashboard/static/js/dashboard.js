$(document).ready(() => {
    function initialize() {
        callData();
        eventHandler();
    }

    function eventHandler() {
        $('#testButton').click(function () {
            $('#output').text('jQuery file is working!');
        });
    }



    function callData() {
        fetch('/data')
            .then(response => response.json())
            .then(data => {
                const ctx = document.getElementById('chart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Sample Data',
                            data: data.values,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            });
    }

    initialize();

});