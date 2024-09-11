function drawGraph() {

    var chart = new Chartist.Line('.ct-chart', {
        series: [
        {
            name: 'series-1',
            data: [
            {x: new Date(143134652600), y: 53},
            {x: new Date(143234652600), y: 40},
            {x: new Date(143340052600), y: 45},
            {x: new Date(143366652600), y: 40},
            {x: new Date(143410652600), y: 20},
            {x: new Date(143508652600), y: 32},
            {x: new Date(143569652600), y: 18},
            {x: new Date(143579652600), y: 11}
            ]
        },
        ]
    }, {
        axisX: {
        type: Chartist.FixedScaleAxis,
        divisor: 5,
        labelInterpolationFnc: function(value) {
            return "foo" //moment(value).format('MMM D');
        }
        }
    });    
}
