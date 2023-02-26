// References: 
// http://bl.ocks.org/dwtkns/4686432
// http://bl.ocks.org/dwtkns/4973620
// http://bl.ocks.org/KoGor/5994804
// https://medium.com/@xiaoyangzhao/drawing-curves-on-webgl-globe-using-three-js-and-d3-draft-7e782ffd7ab
// https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json


var width = 960,
    height = 500,
    radius = 220,
    sensitivity = 0.25,
    offsetX = width / 2,
    offsetY = height / 2,
    maxElevation = 65,
    initRotation = [0, -30],
    scaleExtent = [1, 8],
    flyerAltitude = 30;

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

var swoosh = d3.line()
    .x(function (d) { return d[0] })
    .y(function (d) { return d[1] })
    .curve(d3.curveBasis);

var graticule = d3.geoGraticule();

var svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform-origin", offsetX + "px " + offsetY + "px")
    .call(
        d3
            .drag()
            .subject(function () {
                var r = projection.rotate();
                return { x: r[0] / sensitivity, y: -r[1] / sensitivity };
            })
            .on("drag", dragged)
    )
    .call(
        d3
            .zoom()
            .scaleExtent(scaleExtent)
            .on("zoom", zoomed)
    )
    .on("dblclick.zoom", null);

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json")
    .defer(d3.json, "places.json")
    .defer(d3.json, "links.json")
    .await(ready);

function ready(error, world, places, links) {
    svg
        .append("ellipse")
        .attr("cx", offsetX - 40)
        .attr("cy", offsetY + radius - 20)
        .attr("rx", projection.scale() * 0.9)
        .attr("ry", projection.scale() * 0.25)
        .attr("class", "noclicks")
        .style("fill", "url(#drop_shadow)");

    svg
        .append("circle")
        .attr("cx", offsetX)
        .attr("cy", offsetY)
        .attr("r", projection.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#ocean_fill)");

    svg
        .append("path")
        .datum(topojson.feature(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg
        .append("path")
        .datum(graticule)
        .attr("class", "graticule noclicks")
        .attr("d", path);

    svg
        .append("circle")
        .attr("cx", offsetX)
        .attr("cy", offsetY)
        .attr("r", projection.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#globe_highlight)");

    svg
        .append("circle")
        .attr("cx", offsetX)
        .attr("cy", offsetY)
        .attr("r", projection.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#globe_shading)");

    svg
        .append("g")
        .attr("class", "points")
        .selectAll(".point")
        .data(places.features)
        .enter()
        .append("path")
        .attr("class", "point")
        .attr("d", path)
        .on("click", (path) => {
            console.log(path)
            // d3.selectAll("[d=" + path +"]").style("fill", "green")        
        });

    svg
        .append("g")
        .attr("class", "labels")
        .selectAll(".label")
        .data(places.features)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(d => d.properties.name);

    svg
        .append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topojson.feature(world, world.objects.countries).features)
        .enter()
        .append("path")
        .attr("d", path);

    position_labels();

    svg.append("g").attr("class", "arcs")
        .selectAll("path").data(links.features)
        .enter().append("path")
        .attr("class", "arc")
        .attr("d", path)
        .attr("opacity", function (d) {
            return fade_at_edge(d)
        });

    svg.append("g").attr("class", "flyers")
        .selectAll("path").data(links.features)
        .enter().append("path")
        .attr("class", "flyer")
        .attr("d", function (d) { return swoosh(flying_arc(d)) })
        .attr("stroke", d => d.properties.transport === "plane" ? "blue" : "red")
        .attr("opacity", function (d) {
            return fade_at_edge(d)
        });
}

function position_labels() {
    var centerPos = projection.invert([offsetX, offsetY]);

    svg
        .selectAll(".label")
        .attr("text-anchor", function (d) {
            var x = projection(d.geometry.coordinates)[0];
            return x < offsetX - 20 ? "end" : x < offsetX + 20 ? "middle" : "start";
        })
        .attr("transform", function (d) {
            var loc = projection(d.geometry.coordinates),
                x = loc[0],
                y = loc[1];
            var offset = x < offsetX ? -5 : 5;
            return "translate(" + (x + offset) + "," + (y - 2) + ")";
        })
        .style("display", function (d) {
            var d = d3.geoDistance(d.geometry.coordinates, centerPos);
            return d > 1.57 ? "none" : "inline";
        });
}

function flying_arc(pts) {
    var source = pts.geometry.coordinates[0],
        target = pts.geometry.coordinates[1];

    var mid1 = location_along_arc(source, target, .333);
    var mid2 = location_along_arc(source, target, .667);
    var result = [projection(source),
    skyProjection(mid1),
    skyProjection(mid2),
    projection(target)]

    // console.log(result);
    return result;
}

function fade_at_edge(d) {
    var centerPos = projection.invert([offsetX, offsetY]);

    start = d.geometry.coordinates[0];
    end = d.geometry.coordinates[1];

    var start_dist = 1.57 - d3.geoDistance(start, centerPos),
        end_dist = 1.57 - d3.geoDistance(end, centerPos);

    var fade = d3.scaleLinear().domain([-.1, 0]).range([0, .1])
    var dist = start_dist < end_dist ? start_dist : end_dist;

    return fade(dist)
}

function location_along_arc(start, end, loc) {
    var interpolator = d3.geoInterpolate(start, end);
    return interpolator(loc)
}

function dragged() {
    var o1 = [d3.event.x * sensitivity, -d3.event.y * sensitivity];
    o1[1] =
        o1[1] > maxElevation
            ? maxElevation
            : o1[1] < -maxElevation
                ? -maxElevation
                : o1[1];
    projection.rotate(o1);
    skyProjection.rotate(o1);
    refresh();
}

function zoomed() {
    if (d3.event) {
        svg.attr("transform", "scale(" + d3.event.transform.k + ")");
    }
}

function refresh() {
    svg.selectAll(".land").attr("d", path);
    svg.selectAll(".countries path").attr("d", path);
    svg.selectAll(".graticule").attr("d", path);
    refreshLandmarks();
    refreshFlyers();
}

function refreshLandmarks() {
    svg.selectAll(".point").attr("d", path);
    position_labels();
}

function refreshFlyers() {
    svg.selectAll(".arc").attr("d", path)
        .attr("opacity", function (d) {
            return fade_at_edge(d)
        });

    svg.selectAll(".flyer")
        .attr("d", function (d) { return swoosh(flying_arc(d)) })
        .attr("opacity", function (d) {
            return fade_at_edge(d)
        });
}