var nodes = {};
var lookingfor;
testcase = "350 U.S. 568" // replace with user input

queue()
    .defer(d3.json, "../data/citations/1956.json")
    .await(ready);

function ready(error, year) {
links = [];
// get all cases that a given case, testcase, cites
  for(key in year[testcase]){
    if(year[testcase][key] != 1){
      continue;
    } else {
        var temp = {}
        temp["source"] = testcase
        temp["target"] = year["Unnamed: 0"][key]
        temp["type"] = "suit"
        if(temp["source"] != temp["target"]){       //no case cites itself!!
          links.push(temp)
        } else {
          continue;
        }
      }
    }

// get all cases that cite a given case, testcase
  for(thiscase in year){
    for(cited in year[thiscase]) {
      if(year[thiscase][cited] == 1 && year["Unnamed: 0"][cited] == testcase){
        var temp = {}
        temp["source"] = year["Unnamed: 0"][cited]
        temp["target"] = testcase
        temp["type"] = "licensing"
        if(temp["source"] != temp["target"]){       //no case cites itself!!
          links.push(temp)
        } else {
          continue;
        }
      }
    }
  }

  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });

  var width = 960,
      height = 500;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(150)
      .charge(-300)
      .on("tick", tick)
      .start();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll("path")
      .data(force.links())
    .enter().append("path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
var base = "http://caselaw.lp.findlaw.com/scripts/getcase.pl?court=us&vol=";
var regg = /\d+/gi;
  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter().append("circle")
      .attr("r", 6)
      .call(force.drag)
            .on("click", function(d) { 
        var mystr = d.name;
        var numlist = mystr.match(regg);
        console.log(numlist)
        var url = base + numlist[0] + "&invol=" + numlist[1];
        window.open(url); });

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
    .enter().append("text")
      .attr("x", 8)
      .attr("y", ".31em")
      .text(function(d) { 
        return d.name
      });


  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }
}