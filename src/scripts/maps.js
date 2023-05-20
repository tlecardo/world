export default class Maps {
    constructor(svg) {
        svg.attr("width", "auto")
            .attr("align-item", "center")

        this.svg = svg;
        this.divisions = this.svg.append("g");
    }

    extractX(path) {
        return path.split(",")[0].slice(1);
    }

    extractY(path) {
        return path.split(",")[1].split("m")[0];
    }

    addHistoricData(visitedDivs, livedDivs) {
        this.visitedDivs = visitedDivs;
        this.livedDivs = livedDivs;
        return this;
    }

    addProjection(projection) {
        this.projection = projection;
        return this;
    }

    addPath(path) {
        this.path = path;
        this.path.projection(this.projection)
        return this;
    }

    addData(data) {
        if (!data[0].properties.hasOwnProperty("code")) {
            for (let row of data) {
                row.properties["code"] = row.properties["CODE"];
                row.properties["nom"] = row.properties["NAME"];
            }
        }
        this.data = data;
        return this;
    }

    drawData() {
        let lived = this.livedDivs;
        let visited = this.visitedDivs;

        this.divisions.selectAll("path")
            .data(this.data)
            .enter()
            .append("path")
            .attr("id", div => "div" + div.properties.code)
            .attr("d", this.path)
            .style("fill", divBis => visited.includes(divBis.properties.code) ?
                "var(--visited-color)" : lived.includes(divBis.properties.code) ?
                    "var(--lived-color)" : "var(--rest-color)")
            .on("mouseover", function(){
                d3.select(this).style("fill", "rgb(60, 60, 60)");
            })
            .on("mouseout", function(){
                d3.select(this).style("fill", divBis => visited.includes(divBis.properties.code) ?
                        "var(--visited-color)" : lived.includes(divBis.properties.code) ?
                            "var(--lived-color)" : "var(--rest-color)")
            });
    }

    drawPoints(keyword, places, radius) {

        console.log("X ", this.extractX(this.path(this.data[0])))
        console.log("Y ", this.extractY(this.path(this.data[0])))

        let svg = this.svg

        svg.append("g")
            .attr("class", "points")
            .selectAll(".point")
            .data(places)
            .enter()
            .filter(d => d.properties.note.includes(keyword))
            .append("circle")
            .attr("cx", c => this.extractX(this.path(c)))
            .attr("cy", c => this.extractY(this.path(c)))
            .attr("r", radius)
            .attr("id", d => "p" + keyword[0] + d.properties.name)
            .attr("class", "point")
            .on("mouseover", function(e){

                const toolTipContent = 
                `<div class="tip city">${e.properties.name}</div>` +
                `<div class="tip region">${e.properties.adm1name}</div>`

                d3.select(this).style("fill", e.properties.note.includes("parc") ? "green": "blue");


                d3.select("#c" + keyword)
                    .append("text")
                    .attr("class", "tooltip")
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px')
                    .html(toolTipContent);

            })
            .on("mouseout", function(){
                d3.select(this).style("fill", null)

                d3.selectAll("#c" + keyword + " text").remove();;
            });
    }
}