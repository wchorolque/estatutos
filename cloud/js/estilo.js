$(function () {

    var changed=$("#oruro, #lapaz, #potosi, #cochabamba");
    changed.on('DOMSubtreeModified',function(e){
        //$('.block').hide(); 
        $('.accordion').on('click','.titulo',function(){
            if($(this).next().is(':hidden')){           
                var aux=$(this).attr('id');
                $(".block_"+aux).slideDown();
            }
        });
        $("#oruro_titulo").text($("#oruro").find('article').length);
        $("#lapaz_titulo").text($("#lapaz").find('article').length);
        $("#potosi_titulo").text($("#potosi").find('article').length);
        $("#cochabamba_titulo").text($("#cochabamba").find('article').length);
        $("#chuquisaca_titulo").text($("#chuquisaca").find('article').length);
    });

    $('.accordion').on('click','.titulo',function(){
        if($(this).next().is(':visible')){          
            var aux=$(this).attr('id');
            $(".block_"+aux).slideUp();
        }
    });
});