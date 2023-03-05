export default class Maps{
    constructor(svg){
        svg.attr("width", "auto")
            .attr("align-item", "center")

        this.svg = svg;
        this.divisions = this.svg.append("g");
      }

      addHistoricData(visitedDivs, livedDivs){
        this.visitedDivs = visitedDivs;
        this.livedDivs = livedDivs;
        return this;
      }

      addProjection(projection){
        this.projection = projection;
        return this;
      }

      addPath(path){
        this.path = path;
        this.path.projection(this.projection)
        return this;
      }

      addData(data){
        if (!data[0].properties.hasOwnProperty("code")) {
            for (let row of data) {
                row.properties["code"] = row.properties["CODE"];
                row.properties["nom"] = row.properties["NAME"];
            }
        }
        this.data = data;
        return this;
      }

      drawData(){
        this.divisions.selectAll("path")
        .data(this.data)
        .enter()
        .append("path")
        .attr("id", div => "div" + div.properties.code)
        .attr("d", this.path)
        .style("fill", divBis => this.visitedDivs.includes(divBis.properties.code) ?
            "var(--visited-color)" : this.livedDivs.includes(divBis.properties.code) ?
                "var(--lived-color)" : "var(--rest-color)")
        .on("mouseover", div => {
            this.svg.selectAll("#div" + div.properties.code)
                .style("fill", "rgb(60, 60, 60)");
        })
        .on("mouseout", div => {
            this.svg.selectAll("#div" + div.properties.code)
                .style("fill", divBis => this.visitedDivs.includes(divBis.properties.code) ?
                    "var(--visited-color)" : this.livedDivs.includes(divBis.properties.code) ?
                        "var(--lived-color)" : "var(--rest-color)")
        });
      }

      drawPoints(keyword, places){
        this.svg.append("g")
        .attr("class", "points")
        .selectAll(".point")
        .data(places)
        .enter()
        .filter(d => d.properties.note.includes(keyword))
        .append("path")
        .attr("id", d => "p" + keyword[0] + d.properties.name)
        .attr("class", "point")
        .attr("d", this.path)
        .on("mouseover", pt => {
            this.svg.selectAll("#p" + keyword[0] + pt.properties.name)
                .style("fill", "blue")
        });
      }
    }