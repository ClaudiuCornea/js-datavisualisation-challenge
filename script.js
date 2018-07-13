function extract_data (rows){
    let data = [];
    for (let i = 0; i < rows.length; i ++){
        let cells = rows[i].cells;
        let row_data = [];
        for (let j = 0; j < cells.length; j++){
            if (j == 1 && rows[i].cells[j].innerHTML !== ""){
                if (rows[i].cells[j].innerHTML.indexOf("(") !== -1){
                    let _pays = rows[i].cells[j].innerHTML;
                    _pays = _pays.slice(0,_pays.indexOf("("));
                    row_data.push(_pays);
                }else{
                row_data.push(rows[i].cells[j].innerHTML);
                }
            }else if (!(isNaN(parseInt(rows[i].cells[j].innerHTML)))){
                row_data.push(rows[i].cells[j].innerHTML.replace(",","."));
            }
        }
        data.push(row_data);
    }
    return(data);
}

function create_d3_data(data_array,key_1,key_2,key_3){
    let d3_data = [];
    for (let i = 1; i < data_array.length; i++){
        for (let j = 1; j < data_array[i].length; j++){
            let data = {};
            data_array[i][0] = data_array[i][0].replace(/()/,"");
            data[key_1] = data_array[i][0];
            data[key_2] = data_array[0][j];
            data[key_3] = data_array[i][j];
            d3_data.push(data);
        }
    }
    return(d3_data);
}

let table_1_rows = document.getElementById("table1").rows;
let table_1 = extract_data(table_1_rows);
table_1[0] = table_1[0].concat(table_1[1]);
table_1.splice(1,1);
let table_1_data = create_d3_data(table_1,"pays","year","crime");
let table_1_div = document.createElement("div");
table_1_div.setAttribute("id","graph_table_1");
let table_1_html = document.getElementById("table1");
table_1_html.parentNode.insertBefore(table_1_div,table_1_html);

let _width = 800,
    _height = 800,
    _margin ={
        "top" : 50,
        "right" : 100,
        "bottom" : 50,
        "left" : 50
    };

let svg_1 = d3.select("#graph_table_1")
            .append("svg")
            .attr("width", _width + "px")
            .attr("height", _height + "px");

let parseTime = d3.timeParse("%Y"),
    formatTime = d3.timeFormat("%Y");
table_1_data.forEach(function(d){
    d.year = parseTime(d.year);
});

let x_scale_1 = d3.scaleTime()
                .range([_margin.left, _width - _margin.right])
                .domain(d3.extent(table_1_data, function(d){return(d.year);}));
let x_axis_1 = d3.axisBottom(x_scale_1);
svg_1.append("g")
    .attr("transform", "translate(0," + (_height - _margin.bottom) + ")")
    .call(x_axis_1);

let y_scale_1 = d3.scaleLinear()
                .range([_height - _margin.top, _margin.bottom])
                .domain([d3.min(table_1_data, function(d){return(Math.floor(d.crime));}),
                        d3.max(table_1_data, function(d){return(Math.ceil(d.crime));})]);
let y_axis_1 = d3.axisLeft(y_scale_1);
svg_1.append("g")
    .attr("transform", "translate(" + _margin.left + ",0)")
    .call(y_axis_1);
svg_1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - _height / 2)
    .attr("y", 10 )
    .style("text-anchor", "middle")
    .text("Crimes et délits");

let line_1 = d3.line()
                .x(function(d){
                    return(x_scale_1(d.year));
                })
                .y(function(d){
                    return(y_scale_1(d.crime));
                });

let data_group_pays_1 = d3.nest()
                        .key(function(d){return(d.pays);})
                        .entries(table_1_data);

data_group_pays_1.forEach(function(d, i){
    let _color = Math.random() * 360;
    svg_1.append("path")
        .attr("class", "line")
        .attr("id", "line_" + d.key)
        .attr("d", line_1(d.values, x_scale_1, y_scale_1))
        .attr("stroke", function(d ,i){
            return("hsl(" + _color + ",100%, 50%");
        })
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .on("mouseover", function(){
            d3.selectAll(".line")
                .style("opacity", 0.3);
            d3.select(this)
                .style("stroke-width", 4)
                .style("opacity", 1);
        })
        .on("mouseout", function(){
            d3.selectAll(".line")
                .style("opacity", 1);
            d3.select(this)
                .style("stroke-width", 2);
        });
    let legend_space = _width / data_group_pays_1.length;
    svg_1.append("text")
        .attr("x", _height - _margin.right + 25)
        .attr("y", (legend_space / 2 ) + i * legend_space)
        .style("fill", function()
            {return("hsl(" + _color + ",100%, 50%");})
        .text(d.key)
        .attr("id",(d.key))
        .attr("class", "legend")
        .on("mouseover", function(){
            d3.selectAll(".legend")
                .style("opacity", 0.3);
            d3.selectAll(".line")
                .style("opacity", 0.3);
            d3.select(this)
                .style("opacity", 1);
            d3.select("#line_" + d.key)
                .style("opacity", 1)
                .style("stroke-width", 4);
        })
        .on("mouseout", function(){
            d3.selectAll(".legend")
                .style("opacity", 1);
            d3.selectAll(".line")
                .style("stroke-width", 2)
                .style("opacity", 1);
        });
});

let tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 1);
svg_1.selectAll("dot")
    .data(table_1_data)
    .enter()
    .append("circle")
    .attr("r", 15)
    .attr("cx", function(d){return(x_scale_1(d.year));})
    .attr("cy", function(d){return(y_scale_1(d.crime));})
    .style("opacity", 0)
    .on("mouseover", function(d){
        tooltip.transition()
            .style("opacity", 1);
        tooltip.html(formatTime(d.year) + "<br/>" + d.crime)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");
    })
    .on("mouseout", function(d){
        tooltip.transition()
            .style("opacity", 0);
    });
    
let table_2_rows = document.getElementById("table2").rows;
let table_2 = extract_data(table_2_rows);
let table_2_data = create_d3_data(table_2,"pays","date","population");
let table_2_div = document.createElement("div");
table_2_div.setAttribute("id","graph_table_2");
let table_2_html = document.getElementById("table2");
table_2_html.parentNode.insertBefore(table_2_div,table_2_html);

let svg_2 = d3.select("#graph_table_2")
            .append("svg")
            .attr("width", _width + "px")
            .attr("height", _height + "px");

let x_scale_2 = d3.scaleBand()
                    .rangeRound([_margin.left, _width - _margin.right])
                    .domain(table_2_data.map(function(d){return(d.pays);}));
                    
let x_axis_2 = d3.axisBottom(x_scale_2);
svg_2.append("g")
    .attr("transform", "translate(0, " + (_height - _margin.bottom) + ")")
    .call(x_axis_2)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx","-0.5em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-90)");

let y_scale_2 = d3.scaleLinear()
                .range([_height - _margin.top, _margin.bottom])
                .domain([d3.min(table_2_data, function(d){return(Math.floor(d.population));}),
                        d3.max(table_2_data, function(d){return(Math.ceil(d.population));})]);
let y_axis_2 = d3.axisLeft(y_scale_2);
svg_2.append("g")
    .attr("transform", "translate(" + _margin.left + ",0)")
    .call(y_axis_2);

let barPadding = 1;

let _color = Math.random() * 360;

let data_group_date_2 = d3.nest()
                        .key(function(d){return(d.date);})
                        .entries(table_2_data);

data_group_date_2.forEach(function(d, i){
svg_2.selectAll("rect")
        .data(table_2_data)
        .enter()
        .append("rect")
        .attr("class", "rect")
        .attr("id", "rect_" + d.key)
        .attr("x", function(d){return(x_scale_2(d.pays))})
        .attr("y", function(d){return(y_scale_2(d.population));})
        .attr("height", function(d){return(_height - _margin.bottom - y_scale_2(d.population));})
        .attr("width", ((x_scale_2.bandwidth())))
        .attr("fill", function(d ,i){
            return("hsl(" + _color + ",100%, 50%)");})
        .on("mouseover", function(){
            d3.selectAll(".rect")
                .style("opacity", 0.3);
            d3.select(this)
                .style("opacity", 1);
        })
        .on("mouseout", function(){
            d3.selectAll(".rect")
                .style("opacity", 1);
        });
})                

let data = [];   
function get_data() {
    let swing = data.length;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let result_array = (JSON.parse(this.responseText));
            for (let j = 0; j < result_array.length; j++){
                let obj = {};
                obj.x = result_array[j][0] + swing;
                obj.y = result_array[j][1];
                data.push(obj);
            }
        }
    }
  xhttp.open("GET", "https://inside.becode.org/api/v1/data/random.json",true);
  xhttp.send(); 
  setTimeout(() => get_data(),1000);
}

get_data();

let table_0_div = document.createElement("div");
table_0_div.setAttribute("id","graph_table_0");
document.getElementById("firstHeading").appendChild(table_0_div);
let svg_0 = d3.select("#graph_table_0")
            .append("svg")
            .attr("width", _width + "px")
            .attr("height", _height + "px");


function draw_line(){

let svg_remove = d3.select("#svg_0");
                svg_0.selectAll("*").remove();
let x_scale_0 = d3.scaleLinear()
                .range([_height - _margin.top, _margin.bottom])
                .domain([d3.max(data, function(d){return(d.x);}),
                        d3.min(data, function(d){return(d.x);})]);
let x_axis_0 = d3.axisBottom(x_scale_0);
svg_0.append("g")
    .attr("transform", "translate(0," + (_height - _margin.bottom) + ")")
    .call(x_axis_0);

let y_scale_0 = d3.scaleLinear()
                .range([_height - _margin.top, _margin.bottom])
                .domain([d3.min(data, function(d){return(d.y);}),
                        d3.max(data, function(d){return(d.y);})]);
let y_axis_0 = d3.axisLeft(y_scale_0);
svg_0.append("g")
    .attr("transform", "translate(" + _margin.left + ",0)")
    .call(y_axis_0);

let line_0 = d3.line()
                .x(function(d){
                    return(x_scale_0(d.x));
                })
                .y(function(d){
                    return(y_scale_0(d.y));
                });

svg_0.append("path")
        .attr("class", "line")
        .attr("d", line_0(data))
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        
setTimeout(() => draw_line(),1000);
}

draw_line();