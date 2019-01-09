var b = false;
$(document).ready(function(){
    $("#but").click(function(){
        b = !b;
        $.get( "/set?node=1&da=" + Number(b), function( data ) {
            $("#message").append("<p>" + data +"</p>");
          });
    });

});
