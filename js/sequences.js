    var width = (document.body.clientWidth/2)-((document.body.clientWidth)/100);
    var height = width;
    var maxRadius = width/2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
    w: width, h: 30, s: 3, t: 10
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var theta = d3.scale.linear()
.range([0, 2 * Math.PI]);

var radius = d3.scale.sqrt()
.range([0, maxRadius]);

var vis = d3.select("#chart").append("svg:svg")
.attr("width", width)
.attr("height", height)
.append("svg:g")
.attr("id", "container")
.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-20, 50])
.html(function (d) {
    return d.name;
});

vis.call(tip);

var partition = d3.layout.partition()
.sort(null)
    //.size([2 * Math.PI, maxRadius * maxRadius])
    .value(function (d) {
        return d.size;
    });

    var arc = d3.svg.arc()
    .startAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, theta(d.x)));
    })
    .endAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, theta(d.x + d.dx)));
    })
    .innerRadius(function(d) {
        return Math.max(0, radius(d.y));
    })
    .outerRadius(function(d) {
        return Math.max(0, radius(d.y + d.dy));
    });

// Use d3.text and d3.csv.parseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
d3.text(csv_filename, function (text) {
    var csv = d3.csv.parseRows(text);
    var json = buildHierarchy(csv);
    createVisualization(json);
});


// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {
    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select("#togglelegend").on("click", toggleLegend);

    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition.nodes(json)
    .filter(function (d) {
            return (d.dx > 0.0001); // 0.005 radians = 0.29 degrees
        });

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
    .attr("r", maxRadius)
    .style("opacity", 0);

    var color_scale = function (d) {
        var local_colors;
        if ("articulo" == d.class_name) {
            return colors[d.class_name];
        }

        if (!d.parent) {
            local_colors = d3.scale.category10();
            d.color = "#fff";
        } else if (d.children) {
            var startColor = d3.hcl(d.color),
            endColor = d3.hcl(d.color)
            .brighter();
            if (d.parent) {
                var p = d.parent;
                if (p.children && p.children.length > 1 && d.numero_nodo > p.children.length) {
                    endColor = p.children[d.numero_nodo];
                }
            }

            local_colors = d3.scale.linear()
            .interpolate(d3.interpolateHcl)
            .range([
                startColor.toString(),
                endColor.toString()
                ])
            .domain([0, d.children.length]);
        }

        if (d.children) {
            d.children.map(function (child, i) {
                return {value: child.numero_articulo, idx: i};
            })
            .forEach(function (child, i) {
                d.children[child.idx].color = local_colors(i);
            });
        }

        return d.color;
    };

    var path = vis.data([json]).selectAll("path")
    .data(nodes)
    .enter().append("svg:path")
    .attr("d", arc)
    .attr("fill-rule", "evenodd")
    .style("fill", color_scale)
    .style("opacity", 1)
    .on("click", handleClick)
    .on("mouseover", mouseover)
    .on("mouseout", tip.hide);

    function handleClick(datum) {
        path.transition()
        .duration(750)
        .attrTween("d", arcTween(datum));
    };

    function arcTween(datum) {
        var xd = d3.interpolate(theta.domain(), [datum.x, datum.x + datum.dx]),
        yd = d3.interpolate(radius.domain(), [datum.y, 1]),
        yr = d3.interpolate(radius.range(), [datum.y ? 20 : 0, maxRadius]);
        return function (d, i) {
            return i ?
            function (t) {
                return arc(d);
            } :
            function (t) {
                theta.domain(xd(t));
                radius.domain(yd(t)).range(yr(t));
                return arc(d);
            };
        };
    }
    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
    tip.show(d);
    d3.select('div#nivel1 > span').text("");
    d3.select('div#nivel2 > span').text("");
    d3.select('div#nivel3 > span').text("");
    d3.select('div#nivel4 > span').text("");
    d3.select('div#contenido_articulo').text("");
    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if (percentage < 0.1) {
        percentageString = "< 0.1%";
    }

    if (d.numero_articulo) {
        d3.select("#percentage").text("Art\u00edculo " + d.numero_articulo);
    } else {
        var total_articulos = Math.round(d.value / 0.8772)
        d3.select("#percentage").text("Total Art\u00edculos: " + total_articulos + "\n" + percentageString);
    }

    d3.select("#explanation")
    .style({
        "visibility": "",
        "position": "absolute",
            "top": ((height / 4) + (height / 6)) + "px", //(document.body.clientWidth/4-document.body.clientWidth/32)+"px",
            "left": ((width / 4) + (width / 9)) + "px", // (document.body.clientWidth/4-document.body.clientWidth/16)+"px",
            "width": (document.body.clientWidth / 8) + "px",
            "font-size": (document.body.clientWidth / 48) + "px",
            "text-align": "center"
        });
    var sequenceArray = getAncestors(d);
    for (var i = 0; i < sequenceArray.length; i++) {
        var data_level = sequenceArray[i];
        if (data_level.numero_articulo) {
            var prefix = "";
            if (data_level.numero_articulo > 0 && data_level.numero_articulo < 10) {
                prefix = "00";
            } else if (data_level.numero_articulo >= 10 && data_level.numero_articulo < 100) {
                prefix = "0";
            }
            d3.select('div#nivel4 > span').text(data_level.name);
            d3.text('articulos/' + prefix + data_level.numero_articulo + '.html', function (error, data) {
                if (error === null) {
                    d3.select('div#nivel4 div#contenido_articulo').html(data);
                }
                else {
                    d3.select('div#nivel4 div#contenido_articulo').html("");
                }
            });
        } else {
            d3.select('div#nivel' + data_level.depth + ' > span').text(data_level.name);
        }
    }

    //updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    d3.selectAll("path")
    .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
    .filter(function (node) {
        return (sequenceArray.indexOf(node) >= 0);
    })
    .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
    // Hide the breadcrumb trail
    d3.select("#trail")
    .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
    .transition()
    .duration(500)
    .style("opacity", 1)
    .each("end", function () {
        d3.select(this).on("mouseover", mouseover);
    });

    /*
     d3.select("#explanation")
     .style("visibility", "hidden");
     */
 }

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
    var path = [];
    var current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
    .attr("width", width)
    .attr("height", 50)
    .attr("id", "trail");
    // Add the label at the end, for the percentage.
    trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
}
return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {
    // Data join; key function combines name and depth (= position in sequence).
    var g = d3.select("#trail")
    .selectAll("g")
    .data(nodeArray, function (d) {
        return d.name + d.depth;
    });

    // Add breadcrumb and label for entering nodes.
    var entering = g.enter().append("svg:g");

    entering.append("svg:polygon")
    .attr("points", breadcrumbPoints)
    .style("fill", function (d) {
        return colors[d.name];
    });

    entering.append("svg:text")
    .attr("x", (b.w + b.t) / 2)
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(function (d) {
        return d.name;
    });

    // Set position for entering and updating nodes.
    g.attr("transform", function (d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Remove exiting nodes.
    g.exit().remove();

    // Now move and update the percentage at the end.
    d3.select("#trail").select("#endlabel")
    .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "left")
    .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
    .style("visibility", "");

}

function drawLegend() {
    // Dimensions of legend item: width, height, spacing, maxRadius of rounded rect.
    var li = {
        w: 550, h: 30, s: 3, r: 3
    };

    var legend = d3.select("#legend").append("svg:svg")
    .attr("width", li.w)
    .attr("height", d3.keys(etiquetas).length * (li.h + li.s));

    var g = legend.selectAll("g")
    .data(d3.entries(etiquetas))
    .enter().append("svg:g")
    .attr("transform", function (d, i) {
        return "translate(0," + i * (li.h + li.s) + ")";
    });

    g.append("svg:rect")
    .attr("rx", li.r)
    .attr("ry", li.r)
    .attr("width", li.w)
    .attr("height", li.h)
    .style("fill", function (d) {
        return d.value;
    });

    g.append("svg:text")
    .attr("x", (li.w / 2) - ((li.w / 2) - 20))
    .attr("y", li.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "left")
    .text(function (d) {
        return d.key;
    });
}

function toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
        legend.style({
            "visibility": "",
            "height": "auto"
        });
    } else {
        legend.style({
            "visibility": "hidden",
            "height": "0"
        });
    }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how
// often that sequence occurred.
function buildHierarchy(csv) {
    var root = {"name": "inicio", "children": []};
    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i][0];
        var size = +csv[i][1];
        if (isNaN(size)) { // e.g. if this is a header row
            continue;
        }
        var parts = sequence.split(":::");
        var currentNode = root;
        for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var temp = parts[j].split(";;");
            var nodeName = temp[0].replace(/~/g, ",");
            var nodeClassName = temp[1];
            var childNode;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = {
                        "name": nodeName,
                        "children": [],
                        "class_name": nodeClassName,
                        "numero_nodo": k
                    };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = {
                    "name": nodeName,
                    "size": size,
                    "class_name": 'articulo',
                    "numero_articulo": (i + 1),
                    "numero_nodo": k
                };
                children.push(childNode);
            }
        }
    }

    return root;
};
