'use strict';

/* Directives */


angular.module('myApp.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]);

myApp.directive('donutChart', function () {
    function link(scope, el, attr) {
        var color = d3.scale.category10();
        var width = 200;
        var height = 200;
        var min = Math.min(width, height);
        var svg = d3.select(el[0]).append('svg');
        var pie = d3.layout.pie().sort(null);
        var arc = d3.svg.arc()
            .outerRadius(min / 2 * 0.9)
            .innerRadius(min / 2 * 0.5);

        svg.attr({ width: width, height: height });

        // center the donut chart
        var g = svg.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // add the <path>s for each arc slice
        var arcs = g.selectAll('path');

        scope.$watch('data', function (data) {
            if (!data) { return; }
            arcs = arcs.data(pie(data));
            arcs.exit().remove();
            arcs.enter().append('path')
                .style('stroke', 'white')
                .attr('fill', function (d, i) { return color(i) });
            // update all the arcs (not just the ones that might have been added)
            arcs.attr('d', arc);
        }, true);
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    };
});

// AJOUT
app.directive('linearChart', function ($parse, $window) {
    return {
        restrict: 'EA',
        template: "<svg width='850' height='200'></svg>",
        link: function (scope, elem, attrs) {
            var exp = $parse(attrs.chartData);

            var salesDataToPlot = exp(scope);
            var padding = 20;
            var pathClass = "path";
            var xScale, yScale, xAxisGen, yAxisGen, lineFun;

            var d3 = $window.d3;
            var rawSvg = elem.find('svg');
            var svg = d3.select(rawSvg[0]);

            scope.$watchCollection(exp, function (newVal, oldVal) {
                salesDataToPlot = newVal;
                redrawLineChart();
            });

            function setChartParameters() {

                xScale = d3.scale.linear()
                    .domain([salesDataToPlot[salesDataToPlot.length - 10].hour, salesDataToPlot[salesDataToPlot.length - 1].hour])
                    .range([padding + 5, rawSvg.attr("width") - padding]);

                yScale = d3.scale.linear()
                    .domain([0, d3.max(salesDataToPlot, function (d) {
                        return d.sales;
                    })])
                    .range([rawSvg.attr("height") - padding, 0]);

                xAxisGen = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(10);
                //.ticks(salesDataToPlot.length - 1);

                yAxisGen = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5);

                lineFun = d3.svg.line()
                    .x(function (d) {
                        return xScale(d.hour);
                    })
                    .y(function (d) {
                        return yScale(d.sales);
                    })
                    .interpolate("basis");
            }

            function drawLineChart() {

                setChartParameters();

                svg.append("svg:g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0,180)")
                    .call(xAxisGen);

                svg.append("svg:g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(20,0)")
                    .call(yAxisGen);

                svg.append("svg:path")
                    .attr({
                        d: lineFun(salesDataToPlot),
                        "stroke": "black",
                        "stroke-width": 1,
                        "fill": "none",
                        "class": pathClass
                    });
            }

            function redrawLineChart() {

                setChartParameters();

                svg.selectAll("g.y.axis").call(yAxisGen);

                svg.selectAll("g.x.axis").call(xAxisGen);

                svg.selectAll("." + pathClass)
                    .attr({
                        d: lineFun(salesDataToPlot)
                    });
            }

            drawLineChart();
        }
    };
});
//////