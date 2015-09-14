var cloud_words = [];

var contar_palabras = function (data) {
    data.forEach(function (record) {
        var tags = record.tags.split(" ");
        tags.forEach(function (d) {
            var r = cloud_words.filter(function (tag) {
                return tag.text == d;
            });
            if (0 === r.length) {
                cloud_words.push({
                    text: d,
                    weight: 1,
                    handlers: {
                        click: function () {
                            mostrar_articulos(d);
                        }
                    }
                }
                );
            } else {
                cloud_words.forEach(function (tag) {
                    if (tag.text === d) {
                        tag.weight += 1;
                    }
                })
            }
        })
    });
};

mostrar_articulos = function (word) {
    d3.json('../../data/estatuto_oruro', function (data) {
        buscar_articulos(data, word, 'div#oruro', '../../oruro/articulos/');
    });
    d3.json('../../data/estatuto_lapaz', function (data) {
        buscar_articulos(data, word, 'div#lapaz', '../../lapaz/articulos/');
    });
    d3.json('../../data/estatuto_potosi', function (data) {
        buscar_articulos(data, word, 'div#potosi', '../../potosi/articulos/');
    });
    d3.json('../../data/estatuto_cochabamba', function (data) {
        buscar_articulos(data, word, 'div#cochabamba', '../../cochabamba/articulos/');
    });
};

buscar_articulos = function(data, word, target, articulos) {
    d3.select(target).html("");
    data.forEach(function (d) {
        var tags = d.tags.split(" ");
        tags.forEach(function (word_tag) {
            if (word == word_tag) {
                var prefix = "";
                if (d.numero_articulo > 0 && d.numero_articulo < 10) {
                    prefix = "00";
                } else if (d.numero_articulo >= 10 && d.numero_articulo < 100) {
                    prefix = "0";
                }
                console.log(target + ":" + d.numero_articulo);
                d3.text(articulos + prefix + d.numero_articulo + '.html', function (error, data) {
                    var aux = ("<div><p>" + d.level_1 +"</p></div>")+
                    ("<div><p>" + d.level_2 +"</p></div>")+
                    ("<div><p>" + d.level_3 +"</p></div>")+
                    ("<div><p>" + d.level_4 +"</p></div>")+
                    ("<div><p> Artí­culo " + d.numero_articulo + "." + d.articulo+"</span></div>");
                    $(target).append('<br/>');
                    if (error === null) {
                        aux+=("<div>" + data +"</div>");
                    }
                    //Seccion agregada para convertir el articulo en un Acordion
                    var nuevo ="<article>"+
                    "<span class='titulo'> ArtÃ­culo "+d.numero_articulo+": "+d.articulo+"</span>"+
                    "<div class='block'>"+aux+"</div>"+
                    "</article>";
                    $(target).append(nuevo);
                });
            }
        });

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

    $('#palabras').jQCloud(cloud_words, {shape: 'rectangular'});
};

$(document).ready(function (event) {
    queue()
    .defer(d3.json, '../../data/estatuto_oruro.json')
    .defer(d3.json, '../../data/estatuto_potosi.json')
    .defer(d3.json, '../../data/estatuto_cochabamba.json')
    .defer(d3.json, '../../data/estatuto_lapaz.json')
    .await(analyze);
});
