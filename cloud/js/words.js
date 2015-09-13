$(document).ready(function(event){
    d3.csv('data/cities.csv', function(data){
        console.log(data[0]);
        data.forEach(function(d){
            d.population = +d.population;
            d["land area"] = +d["land area"];
        });
        console.log(data[0]);
    });

    d3.tsv('data/animals.tsv', function(data){
        console.log(data[0]);
    });

    var psv = d3.dsv("|", "text/plain");

    psv("data/animals_piped.txt", function(data){
        console.log(data[1]);
        data.forEach(function(d){
            console.log(d);
        });
    });

    d3.json("data/employes.json", function(data){
        console.log(data[0]);
    });

    queue()
        .defer(d3.csv, "data/cities.csv")
        .defer(d3.csv, "data/animals.tsv")
        .await(analyze);

    function analyze(error, cities, animals) {
        if (error) {
            console.log(error);
        }

        console.log(cities[0]);
        console.log(animals[0]);
    }
});
