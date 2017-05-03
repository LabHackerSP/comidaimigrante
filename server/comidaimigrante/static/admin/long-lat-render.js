$(document).ready(function() {


    $("#id_lat").attr('readonly','readonly');
    $("#id_long").attr('readonly','readonly');
    $('#id_endereco').parent().append("<div id='map_canvas' style='width:380px; height:200px; margin: 20px; margin-left: 105px;' ></div>");

    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    
    var map = new google.maps.Map(document.getElementById("map_canvas"),  myOptions);
 

    $('#id_endereco').change(function() {
      updateMapPosition(map);
    });

    // on load update map if address is not empty 
    if ($('#id_endereco').val()) {
      updateMapPosition(map);
    }
    
});


 
function updateMapPosition(map) {
  var geocoder = new google.maps.Geocoder();
  var position = geocoder.geocode({'address': $('#id_endereco').val()} ,
    function(results,status) { 
      if (status == google.maps.GeocoderStatus.OK) {
        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
          $("#id_lat").val(results[0].geometry.location.lat().toFixed(6));
          $("#id_long").val(results[0].geometry.location.lng().toFixed(6));
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({map:map, position:results[0].geometry.location});

        }
      }
      else {
        alert("Endereço invalido ou não encontrado.");
      }
    }
  );
}