import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  state = {
    company: "Apple",
    selectedMonth: "November",
    colors: {
      Open: "#b2df8a",
      Close: "#e41a1c"
    }
  };

  svgRef = React.createRef();
  tooltipRef = React.createRef();

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.company !== this.state.company ||
      prevState.selectedMonth !== this.state.selectedMonth ||
      prevProps.csv_data !== this.props.csv_data
    ) {
      this.drawChart();
    }
  }

  getMonthIndex = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(month);
  };

  drawChart = () => {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(this.svgRef.current).selectAll("*").remove();

    const filteredData = this.props.csv_data.filter(
      (d) =>
        d.Company === this.state.company &&
        d.Date.getMonth() === this.getMonthIndex(this.state.selectedMonth)
    );

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(filteredData, (d) => d.Date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => Math.min(d.Open, d.Close)),
        d3.max(filteredData, (d) => Math.max(d.Open, d.Close))
      ])
      .range([height, 0]);

    const svg = d3
      .select(this.svgRef.current)
      .attr("width", 700)
      .attr("height", 300)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);


svg.append("g")
  .attr("transform", `translate(0,${height+5})`)
  .call(d3.axisBottom(xScale))
  .selectAll("text")
  .style("text-anchor", "start") 
  .attr("dx", ".8em") 
  .attr("dy", ".15em") 
  .attr("transform", "rotate(45)"); 

    svg.append("g").attr("transform", "translate(-5, 0)").call(d3.axisLeft(yScale));

    
    ["Open", "Close"].forEach((metric) => {
      const line = d3
        .line()
        .x((d) => xScale(d.Date))
        .y((d) => yScale(d[metric]))
        .curve(d3.curveCardinal);

      svg
        .append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", this.state.colors[metric])
        .attr("stroke-width", 2)
        .attr("d", line);

    
      svg
        .selectAll(`circle-${metric}`)
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.Date))
        .attr("cy", (d) => yScale(d[metric]))
        .attr("r", 3.5)
        .attr("fill", this.state.colors[metric])
        .on("mouseover", (event, d) => {
          const tooltip = d3.select(this.tooltipRef.current);
          tooltip
            .style("display", "block")
            .style("left", `${event.pageX}px`)

            .style("top", `${event.pageY - 125}px`) 
            .html(
              `Date: ${d.Date.toLocaleDateString()}<br/>
              Open: $${d.Open.toFixed(2)}<br/>
              Close: $${d.Close.toFixed(2)}<br/>
              Difference: $${(d.Close - d.Open).toFixed(2)}`
            );
        })
        .on("mouseout", () => {
          d3.select(this.tooltipRef.current).style("display", "none");
        });
    });


const legend = svg.append("g")
  .attr("transform", `translate(${width + 20}, 20)`); 

["Open", "Close"].forEach((metric, i) => {
  const legendRow = legend.append("g")
    .attr("transform", `translate(0, ${i * 20})`);

  legendRow.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", this.state.colors[metric]);

  legendRow.append("text")
    .attr("x", 15) 
    .attr("y", 10)
    .text(metric)
    .style("font-size", "10px");
});
    
  };

  render() {
    const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    return (
      <div className="chart-container">
        <div className="controls">
          <div className="company-selector">
            Company:
            {options.map((company) => (
              <label key={company}>
                <input
                  type="radio"
                  value={company}
                  checked={this.state.company === company}
                  onChange={(e) => this.setState({ company: e.target.value })}
                />
                {company}
              </label>
            ))}
          </div>
          <br></br>
          <div> 
          Month:
          <select value={this.state.selectedMonth} onChange={(e) => this.setState({ selectedMonth: e.target.value })}>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          </div>

        </div>

        
        <svg className='chart-box' ref={this.svgRef}></svg>
        <div ref={this.tooltipRef} className="tooltip"></div>
      </div>
    );
  }
}

export default Child1;