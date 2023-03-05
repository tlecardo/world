import params from './../assets/parameters.json';

export function points(svg, path, data) {
    svg.append("g")
        .attr("class", "points")
        .selectAll(".point")
        .data(data)
        .enter()
        .filter(d => d.properties.note.includes("france"))
        .append("path")
        .attr("id", d => "pf" + d.properties.name)
        .attr("class", "point")
        .attr("d", path)
        .on("mouseover", (d) => {

            d3.selectAll("#pf" + d.properties.name)
                .style("fill", 'blue')  // selon params


        });
}


export function create(data, path, division) {

    division.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("id", p => "dep" + p.properties.code)
        .attr("d", path)
        .style("fill", dep => params.visitedDepartements.includes(parseInt(dep.properties.code)) ?
            "var(--visited-color)" : params.livedDepartements.includes(parseInt(dep.properties.code)) ?
                "var(--lived-color)" : "var(--rest-color)")
        .on("mouseover", dep => {
            svg_f.selectAll("#dep" + dep.properties.code)
                .style("fill", "rgb(60, 60, 60)");
        })
        .on("mouseout", dep => {
            svg_f.selectAll("#dep" + dep.properties.code)
                .style("fill", dep => params.visitedDepartements.includes(parseInt(dep.properties.code)) ?
                    "var(--visited-color)" : params.livedDepartements.includes(parseInt(dep.properties.code)) ?
                        "var(--lived-color)" : "var(--rest-color)");
        });

}
