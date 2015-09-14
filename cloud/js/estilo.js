$(function () {

    var changed = $("#oruro, #lapaz, #potosi, #cochabamba");
    changed.on('DOMSubtreeModified', function (e) {
        $('.block').hide();
        $('.accordion .titulo').on('click', function () {
            // if($(this).next().is(':visible')){
            // 	$(this).next().slideUp();
            // }
            if ($(this).next().is(':hidden')) {
                $('.accordion .titulo').next().slideUp();
                $(this).next().slideDown();
            }
        });
        $("#oruro_titulo").text($("#oruro").find('article').length);
        $("#lapaz_titulo").text($("#lapaz").find('article').length);
        $("#potosi_titulo").text($("#potosi").find('article').length);
        $("#cochabamba_titulo").text($("#cochabamba").find('article').length);
    });
});