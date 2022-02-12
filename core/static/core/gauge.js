Chart.defaults.gauge = Chart.defaults.doughnut;

var gauge = Chart.controllers.doughnut.extend({
    draw: function (ease) {
        Chart.controllers.doughnut.prototype.draw.call(this, ease);
        var meta = this.getMeta();
        var pt0 = meta.data[0];

        var ctx = this.chart.chart.ctx;
        ctx.save();

        var cx = pt0._view.x;
        var cy = pt0._view.y;
        var innerRadius = pt0._view.innerRadius;
        var outerRadius = pt0._view.outerRadius;
        var config = this.chart.chart.config;
        var current = config.data.current;
        var max = config.options.panel.max;
        var min = config.options.panel.min;
        var needle = config.options.needle;
        var panel = config.options.panel;
        if (current >= max) {
            current = max;
        }
        if (current <= min) {
            current = min;
        }
        var needleAngle = config.options.circumference * (current - min) / (max - min) + config.options.rotation;
        var radius = outerRadius * needle.lengthRadius / 100;
        var textRadius = outerRadius * panel.scaleTextRadius / 100;

        ctx.translate(cx, cy);
        ctx.font = "" + panel.scaleTextSize + "px, sans-serif";
        ctx.fillStyle = panel.scaleTextColor || 'rgba(255, 255, 255, 1)';
        panel.scales.forEach(function (value, index, arr) {
            var textWidth = ctx.measureText("" + value).width;
            var textAngle = config.options.circumference * index / (arr.length - 1) + config.options.rotation;
            var dy = textRadius * Math.sin(textAngle);
            var dx = textRadius * Math.cos(textAngle);
            ctx.fillText("" + value, dx - (textWidth / 2), dy);
            var oy = (outerRadius * panel.scaleOuterRadius / 100) * Math.sin(textAngle);
            var ox = (outerRadius * panel.scaleOuterRadius / 100) * Math.cos(textAngle);
            var iy = (outerRadius * panel.scaleInnerRadius / 100) * Math.sin(textAngle);
            var ix = (outerRadius * panel.scaleInnerRadius / 100) * Math.cos(textAngle);
            ctx.strokeStyle = panel.scaleColor || 'rgba(0, 0, 0, 1)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(ix, iy);
            ctx.lineTo(ox, oy);
            ctx.stroke();
        });
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = panel.tickColor || 'rgba(0, 0, 0, 1)';
        ctx.beginPath();
        this.chart.chart.config.data.datasets[0].values.forEach(function (value, index, arr) {
            var textWidth = ctx.measureText("" + value).width;
            var textAngle = config.options.circumference * (value - min) / (max - min) + config.options.rotation;
            var oy = (outerRadius * panel.tickOuterRadius / 100) * Math.sin(textAngle);
            var ox = (outerRadius * panel.tickOuterRadius / 100) * Math.cos(textAngle);
            var iy = (outerRadius * panel.tickInnerRadius / 100) * Math.sin(textAngle);
            var ix = (outerRadius * panel.tickInnerRadius / 100) * Math.cos(textAngle);
            ctx.moveTo(ix, iy);
            ctx.lineTo(ox, oy);
        });
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(needleAngle);
        ctx.beginPath();
        ctx.moveTo(0, -needle.width);
        ctx.lineTo(radius, 0);
        ctx.lineTo(0, needle.width);
        ctx.fillStyle = needle.color || 'rgba(180, 0, 0, 0.8)';
        ctx.fill();
        ctx.rotate(-needleAngle);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.fillStyle = needle.circleColor || 'rgba(188, 188, 188, 1)';
        ctx.arc(cx, cy, needle.circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    initialize: function (chart, datasetIndex) {
        var panel = chart.chart.config.options.panel;
        var data = [100];
        var backgroundColor = [panel.scaleBackgroundColor || "rgb(120, 120, 120)"];
        var hoverBackgroundColor = [panel.scaleBackgroundColor || "rgb(120, 120, 120)"];

        var values = [];
        for (var v = panel.min; v <= panel.max; v += panel.tickInterval) {
            values.push(v);
        }

        chart.chart.config.data.datasets[0].data = data;
        chart.chart.config.data.datasets[0].backgroundColor = backgroundColor;
        chart.chart.config.data.datasets[0].hoverBackgroundColor = hoverBackgroundColor;
        chart.chart.config.data.datasets[0].values = values;

        Chart.controllers.doughnut.prototype.initialize.call(this, chart, datasetIndex);
    }
});

Chart.controllers.gauge = gauge;
