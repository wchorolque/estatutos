var cloud_words = [],
    dir_prefix = '../',
    estatuto_oruro = dir_prefix + 'data/estatuto_oruro.json',
    estatuto_potosi = dir_prefix + 'data/estatuto_potosi.json',
    estatuto_cochabamba = dir_prefix + 'data/estatuto_cochabamba.json',
    estatuto_lapaz = dir_prefix + 'data/estatuto_lapaz.json',
    estatuto_chuquisaca = dir_prefix + 'data/estatuto_chuquisaca.json',

    ruta_articulos_oruro = dir_prefix + 'oruro/articulos/',
    ruta_articulos_potosi = dir_prefix + 'potosi/articulos/',
    ruta_articulos_cochabamba = dir_prefix + 'cochabamba/articulos/',
    ruta_articulos_lapaz = dir_prefix + 'lapaz/articulos/',
    ruta_articulos_chuquisaca = dir_prefix + 'chuquisaca/articulos/',

    cache_oruro = [],
    cache_potosi = [],
    cache_lapaz = [],
    cache_cochabamba = [],
    cache_chuquisaca = [];


var articulos_oruro = [],
    articulos_potosi = [],
    articulos_lapaz = [],
    articulos_cochabamba = [],
    articulos_chuquisaca = [],
    total_articulos_encontrados = 0;

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
                        link: '#resultados_busqueda',
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
    total_articulos_encontrados = 0;
    d3.json(estatuto_oruro, function (data) {
        buscar_articulos(cache_oruro, data, word, 'div#oruro', ruta_articulos_oruro);
    });
    d3.json(estatuto_lapaz, function (data) {
        buscar_articulos(cache_lapaz, data, word, 'div#lapaz', ruta_articulos_lapaz);
    });
    d3.json(estatuto_potosi, function (data) {
        buscar_articulos(cache_potosi, data, word, 'div#potosi', ruta_articulos_potosi);
    });
    d3.json(estatuto_cochabamba, function (data) {
        buscar_articulos(cache_cochabamba, data, word, 'div#cochabamba', ruta_articulos_cochabamba);
    });
    d3.json(estatuto_chuquisaca, function (data) {
        buscar_articulos(cache_chuquisaca, data, word, 'div#chuquisaca', ruta_articulos_chuquisaca);
    })
};

buscar_articulos = function (cache_data, data, word, target, ruta_articulos) {
    d3.select(target).html("");
    var results = []
    data.forEach(function (d) {
        if (d.tags.indexOf(word) >= 0) {
            results.push(d);
        }
    });

    imprimir_resultados(cache_data, results, target, ruta_articulos);
    total_articulos_encontrados += results.length;
    var msg = 'Total Art\u00edculos encontrados que contienen "<b>' + word + '</b>" : <b>' + total_articulos_encontrados + '</b>&nbsp;&nbsp;&nbsp;';
    $('div#resultado_nube_palabras span').html(msg);
};

imprimir_resultados = function (cache_data, results, target, ruta_articulos) {
    var r = /\\u([\d\w]{4})/gi;
    results.forEach(function (d) {
        var prefix = "";
        if (d.numero_articulo > 0 && d.numero_articulo < 10) {
            prefix = "00";
        } else if (d.numero_articulo >= 10 && d.numero_articulo < 100) {
            prefix = "0";
        }

        var aux = ("<div><p>" + d.level_1 + "</p></div>") +
            ("<div><p>" + d.level_2 + "</p></div>") +
            ("<div><p>" + d.level_3 + "</p></div>") +
            ("<div><p>" + d.level_4 + "</p></div>") +
            ("<div><p> Art&iacute;culo " + d.numero_articulo + ". " + d.articulo + "</span></div>");

        var existe_en_cache = false;
        if (cache_data) {
            for (var index = 0; index < cache_data.length; index++) {
                var cc = cache_data[index];
                if (cc.numero == d.numero_articulo) {
                    var data = cc.articulo.replace(r, function (match, grp) {
                        return String.fromCharCode(parseInt(grp, 16));
                    });
                    var decode_data = '';
                    try {
                        decode_data = decodeURI(data);
                    } catch (e) {
                        decode_data = data;
                    }

                    aux += "<div>" + decode_data + " </div>";
                    var nuevo = "<article>" +
                        "<span class='titulo' id='" + d.numero_articulo + "'> Art&iacute;culo " // este id se puede repetir corregir
                        + d.numero_articulo + ": " + d.articulo + " <span></span>" + "</span>" +
                        "<div class='block block_" + d.numero_articulo + "'>" + aux + "</div>" +
                        "</article>";

                    $(target).append(nuevo);
                    existe_en_cache = true;
                    break;
                }
            }
        }

        if (false == existe_en_cache) {

            d3.text(ruta_articulos + prefix + d.numero_articulo + '.html', function (error, data) {
                if (error === null) {
                    aux += ("<div>" + data + "</div>");
                }
                //Seccion agregada para convertir el articulo en un Acordion
                var nuevo = "<article>" +
                    "<span class='titulo' id='" + d.numero_articulo + "'> Art&iacute;culo "
                    + d.numero_articulo + ": " + d.articulo + " <span></span>" + "</span>" +
                    "<div class='block block_" + d.numero_articulo + "'>" + aux + "</div>" +
                    "</article>";

                $(target).append(nuevo);
            });
        }
    });
}

function analyze(error, oruro, potosi, cochabamba, lapaz, chuquisaca) {
    if (error) {
        console.log(error);
    }

    articulos_oruro = oruro;
    articulos_potosi = potosi;
    articulos_cochabamba = cochabamba;
    articulos_lapaz = lapaz;
    articulos_chuquisaca = chuquisaca;

    contar_palabras(articulos_oruro);
    contar_palabras(articulos_potosi);
    contar_palabras(articulos_cochabamba);
    contar_palabras(articulos_lapaz);
    contar_palabras(articulos_chuquisaca);

    var cloud_colors = [
        "#1F77B4",// "#5687d1",
        "#FF7F0E", // "#D20001",
        "#2CA02C", //"#F79E37",
        "#D62728",  //"#FE6612",
        "#9467BD", // "#a173d1",
        "#8C564B", //"#E80C7A",
        "#E377C2", // "#fc5050",
        "#7F7F7F",// "#009dff",
        "#ff7f0e", // "#efd051",
        "#22b266",// "#00e9ff",
        "#90BCDA", //"#3af2c7",
        "#979ea3"
    ];
    $('#palabras').jQCloud(cloud_words, {shape: 'rectangular', steps: 10, colors: cloud_colors });
};

$(document).ready(function (event) {
    queue()
        .defer(d3.json, estatuto_oruro)
        .defer(d3.json, estatuto_potosi)
        .defer(d3.json, estatuto_cochabamba)
        .defer(d3.json, estatuto_lapaz)
        .defer(d3.json, estatuto_chuquisaca)
        .await(analyze);

    d3.json('../data/html_articulos_cochabamba.json', function (data) {
        cache_cochabamba = data;
    });

    d3.json('../data/html_articulos_oruro.json', function (data) {
        cache_oruro = data;
    });

    d3.json('../data/html_articulos_potosi.json', function (data) {
        cache_potosi = data;
    });

    d3.json('../data/html_articulos_lapaz.json', function (data) {
        cache_lapaz = data;
    });

    d3.json('../data/html_articulos_chuquisaca.json', function (data) {
        cache_chuquisaca = data;
    });

    $('form#actualizar_nube').on('submit', function (event) {
        event.preventDefault();
        cloud_words = [];
        $(this).find('input:checked').each(function (index, object) {
            var departamento = object.name;
            console.log(departamento);

            switch (departamento) {
                case 'oruro':
                    // refactorizar y cambiar por cach�
                    $.ajax({
                        url: estatuto_oruro,
                        async: false,
                        dataType: 'json',
                        success: function (data) {
                            contar_palabras(data)
                        }
                    });
                    break;
                case 'potosi':
                    $.ajax({
                        url: estatuto_potosi,
                        async: false,
                        dataType: 'json',
                        success: function (data) {
                            contar_palabras(data)
                        }
                    });
                    break;
                case 'lapaz':
                    $.ajax({
                        url: estatuto_lapaz,
                        async: false,
                        dataType: 'json',
                        success: function (data) {
                            contar_palabras(data)
                        }
                    });
                    break;
                case 'cochabamba':
                    $.ajax({
                        url: estatuto_cochabamba,
                        async: false,
                        dataType: 'json',
                        success: function (data) {
                            contar_palabras(data)
                        }
                    });
                    break;
                case 'chuquisaca':
                    contar_palabras(articulos_chuquisaca);
                    break;
            }
        });

        console.log(cloud_words);
        $('#palabras').jQCloud('update', cloud_words, {shape: 'rectangular'});
    })

    $('form#buscar_palabra').on('submit', function (event) {
        event.preventDefault();
        cloud_words = [];
        var texto = $(this).find('input[name="palabra"]').val(),
            words = texto.toLowerCase().split(" "),
            resultados_oruro = [],
            resultados_potosi = [],
            resultados_lapaz = [],
            resultados_cochabamba = [],
            resultados_chuquisaca = [];

        articulos_oruro.forEach(function (articulo) {
            words.forEach(function (word) {
                if (articulo.articulo.toLowerCase().indexOf(word) >= 0) {
                    resultados_oruro.push(articulo);
                }
            })
        });

        d3.select('div#oruro').html("");
        imprimir_resultados(cache_oruro, resultados_oruro, 'div#oruro', ruta_articulos_oruro);

        articulos_potosi.forEach(function (articulo) {
            words.forEach(function (word) {
                if (articulo.articulo.toLowerCase().indexOf(word) >= 0) {
                    resultados_potosi.push(articulo);
                }
            })
        });

        d3.select('div#potosi').html("");
        imprimir_resultados(cache_potosi, resultados_potosi, 'div#potosi', ruta_articulos_potosi);

        articulos_lapaz.forEach(function (articulo) {
            words.forEach(function (word) {
                if (articulo.articulo.toLowerCase().indexOf(word) >= 0) {
                    resultados_lapaz.push(articulo);
                }
            })
        });

        d3.select('div#lapaz').html("");
        imprimir_resultados(cache_lapaz, resultados_lapaz, 'div#lapaz', ruta_articulos_lapaz);

        articulos_cochabamba.forEach(function (articulo) {
            words.forEach(function (word) {
                if (articulo.articulo.toLowerCase().indexOf(word) >= 0) {
                    resultados_cochabamba.push(articulo);
                }
            })
        });

        d3.select('div#cochabamba').html("");
        imprimir_resultados(cache_cochabamba, resultados_cochabamba, 'div#cochabamba', ruta_articulos_cochabamba);

        articulos_chuquisaca.forEach(function (articulo) {
            words.forEach(function (word) {
                if (articulo.articulo.toLowerCase().indexOf(word) >= 0) {
                    resultados_chuquisaca.push(articulo);
                }
            })
        });

        d3.select('div#chuquisaca').html("");
        imprimir_resultados(cache_chuquisaca, resultados_chuquisaca, 'div#chuquisaca', ruta_articulos_chuquisaca);

        total_articulos_encontrados = resultados_oruro.length
            + resultados_lapaz.length
            + resultados_cochabamba.length
            + resultados_potosi.length
            + resultados_chuquisaca.length;

        var msg = 'Total Art\u00edculos encontrados que contienen "<b>' + texto + '</b>" : <b>' + total_articulos_encontrados + '</b>';
        $('div#resultado_nube_palabras span').text('');
        $('div#resultados_busqueda span').html(msg);
    });
});
