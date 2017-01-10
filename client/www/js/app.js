/*
 * Comida Imigrante
 * 2016 Labhacker
 */

// Initialize your app
var Frm7 = new Framework7({
   //swipePanel: 'left'
});
// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = Frm7.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    //dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
Frm7.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    /*$$('.create-page').on('click', function () {
        createContentPage();
    });*/
});

var templates = {
  picker: Template7.compile($$('#picker-template').html())
};

var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    $(document).ready(this.onDocumentReady);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    //app.receivedEvent('deviceready');
    if (cordova.platformId == 'android') {
      StatusBar.backgroundColorByHexString("#1C81CE");
      //StatusBar.backgroundColorByHexString("#1C81CE");
    }
  },

  onDocumentReady: function() {
    map.init();
  },

  // opens picker modal with restaurant info
  loadRestaurant: function(uuid) {
    var html = templates.picker(data.objects[uuid]);
    $("#picker-info").html(html);
    Frm7.pickerModal("#picker-info");
  }
};

var map = {
  object: null,
  dot: null,

  init: function() {
    map.object = new L.Map('map');

  	url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  	opt = {attribution: "<a href='https://www.openstreetmap.org/'>OSM</a>"};
  	var layer = new L.TileLayer(url, opt);

  	map.object.addLayer(layer);
    map.dot = L.marker([0, 0]).addTo(map.object);
    // geopos de são paulo
  	map.object.setView(new L.LatLng(-23.5, -46.6),50);

    map.centerOnGPS();
  },

  // finds gps, sets marker and pans camera to it
  centerOnGPS: function() {
    map.object.locate({
      enableHighAccuracy:true,
      setView:true
    });
    map.object.on('locationfound', map.updateDot);
  },

  // callback function to set marker
  updateDot: function(e) {
    map.dot.setLatLng(e.latlng)
    map.dot.update();

    // fetch closest restaurants when location is found
    data.download();
  },

  clickMarker: function(e) {
    map.object.panTo(e.latlng);
    console.log(e.target.uuid);

    // open picker modal with restaurant info
    app.loadRestaurant(e.target.uuid);
  }
};

var data = {
  // json is stored and used to populate list
  objects: {},

  // function to receive json and add markers to map
  parse: function(json) {
    // add to objects if not already loaded
    for(var k in json.objects) {
      var obj = json.objects[k];
      if(!(obj.uuid in data.objects)) {
        obj.marker = L.marker([obj.geopos.lat, obj.geopos.lon]).addTo(map.object);
        obj.marker.on('click', map.clickMarker);
        obj.marker.uuid = obj.uuid;
        data.objects[obj.uuid] = obj;
      }
    }

    Frm7.hideIndicator();
  },

  // fetch from server
  download: function() {
    // call to api with lat and long looking for restaurants in certain radius
    Frm7.showIndicator();
    $.getJSON("teste.json", data.parse);
  }
};

app.initialize();
