var cloud_words = [];

var contar_palabras = function(data) {
    data.forEach(function (d) {
        var tags = d.tags.split(" ");
        tags.forEach(function (d) {
            var r = cloud_words.filter(function (tag) {
                return tag.text == d;
            });
            if (0 === r.length) {
                cloud_words.push({
                        text: d,
                        weight: 1,
                        link: '#'
                    }
                );
            } else {
                cloud_words.forEach(function(tag) {
                    if (tag.text === d) {
                        tag.weight += 1;
                    }
                })
            }
        })
    });
};

function analyze(error, oruro, potosi, cochabamba, lapaz) {
    if (error) {
        console.log(error);
    }
    contar_palabras(oruro);
    contar_palabras(potosi);
    contar_palabras(cochabamba);
    contar_palabras(lapaz);

    cloud_words.forEach(function(d) {
        console.log(d.text);
    });

    console.log(cloud_words.length);

    $('#palabras').jQCloud(cloud_words, { shape: 'rectangular'});
};

$(document).ready(function (event) {
    queue()
        .defer(d3.json, '../../data/estatuto_oruro.json')
        .defer(d3.json, '../../data/estatuto_potosi.json')
        .defer(d3.json, '../../data/estatuto_cochabamba.json')
        .defer(d3.json, '../../data/estatuto_lapaz.json')
        .await(analyze);
});
