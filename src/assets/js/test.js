
var width = 960,
    height = 500,
    radius = 220,
    sensitivity = 0.25,
    offsetX = width / 2,
    offsetY = height / 2,
    maxElevation = 65,
    initRotation = [0, -30],
    scaleExtent = [1, 8],
    flyerAltitude = 70;

var projection = d3
    .geoOrthographic()
    .scale(radius)
    .rotate(initRotation)
    .translate([offsetX, offsetY])
    .clipAngle(90);

var skyProjection = d3
    .geoOrthographic()
    .scale(radius + flyerAltitude)
    .rotate(initRotation)
    .translate([offsetX, offsetY])
    .clipAngle(90);

var path = d3
    .geoPath()
    .projection(projection)
    .pointRadius(1.5);