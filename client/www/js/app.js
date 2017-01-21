/*
 * Comida Imigrante
 * 2016 Labhacker
 */

SERVER = "http://comidaimigrante.labhacker.org.br"

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
    domCache: true, // enable inline pages
});

// Callbacks to run specific code for specific pages, for example for About page:
Frm7.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    /*$$('.create-page').on('click', function () {
        createContentPage();
    });*/
});

var templates = {
  picker: Template7.compile($$('#picker-template').html()),
  searchFilters: Template7.compile($$('#search-name-filters-template').html()),
  searchName: Template7.compile($$('#search-name-results-template').html()),
  searchAddress: Template7.compile($$('#search-addr-results-template').html()),
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
    var obj = data.objects[uuid];
    map.panTo(obj.lat, obj.long);
    var html = templates.picker(obj);
    $("#picker-info").html(html);
    Frm7.pickerModal("#picker-info");
  }
};

// botão gps
var GPSButton = L.Control.extend({
  onAdd: function(m) {
    var a = L.DomUtil.create('a');
    a.href = '#';
    a.classList = 'floating-button gps-button';

    var i = document.createElement('i');
    i.classList = 'f7-icons'
    i.appendChild(document.createTextNode('compass_fill'));
    a.appendChild(i);
    L.DomEvent.addListener(a, 'click', map.centerOnGPS);

    return a;
  },

  onRemove: function(m) {
    // Nothing to do here
  }
});

var map = {
  object: null,
  dot: null,

  init: function() {
    var opt = {
      zoomControl: false,
    };
    map.object = new L.Map('map', opt);

  	var url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  	opt = {
      minZoom: 15,
      maxZoom: 17,
      attribution: "<a href='https://www.openstreetmap.org/'>OSM</a>",
    };
  	var layer = new L.TileLayer(url, opt);

    // botão gps
    var button = new GPSButton({position:'topright'});
    button.addTo(map.object);

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
    // open picker modal with restaurant info
    app.loadRestaurant(e.target.id);
  },

  panTo: function(lat, lng) {
    var latlng = L.latLng(lat, lng);
    map.object.panTo(latlng);
  }
};

var data = {
  // json is stored and used to populate list
  objects: {},
  meta: {},

  // function to receive json and add markers to map
  parseObjects: function(json) {
    // add to objects if not already loaded
    for(var k in json.objects) {
      var obj = json.objects[k];
      if(!(obj.id in data.objects)) {
        obj.marker = L.marker([obj.lat, obj.long]).addTo(map.object);
        obj.marker.on('click', map.clickMarker);
        obj.marker.id = obj.id;
        data.objects[obj.id] = obj;
      }
    }

    Frm7.hideIndicator();
  },

  // function to receive json and add markers to map
  parseSingle: function(json) {
    // add to objects if not already loaded
    var obj = json;
    if(!(obj.id in data.objects)) {
      obj.marker = L.marker([obj.lat, obj.long]).addTo(map.object);
      obj.marker.on('click', map.clickMarker);
      obj.marker.id = obj.id;
      data.objects[obj.id] = obj;
    }
    //close search, show restaurant info
    app.loadRestaurant(obj.id);

    Frm7.hideIndicator();
  },

  // parser metadados
  parseMeta: function(json) {
    data.meta.origem = json.objects;
    var html = templates.searchFilters(data.meta);
    $("#search-name-filters").html(html);

    mainView.router.loadPage('#busca-nome');
    Frm7.hideIndicator();
  },

  // busca por nome
  parseSearchName: function(json) {
    var html = templates.searchName(json);
    $("#search-name-results").html(html);

    // add to objects if not already loaded
    for(var k in json.objects) {
      var obj = json.objects[k];
      if(!(obj.id in data.objects)) {
        obj.marker = L.marker([obj.lat, obj.long]).addTo(map.object);
        obj.marker.on('click', map.clickMarker);
        obj.marker.id = obj.id;
        data.objects[obj.id] = obj;
      }
    }

    Frm7.hideIndicator();
  },

  // busca por endereço
  parseSearchAddress: function(json) {
    var obj = {};
    obj.meta = {
      total_count: json.length,
    };
    obj.objects = json;
    var html = templates.searchAddress(obj);
    $("#search-addr-results").html(html);

    Frm7.hideIndicator();
  },

  // fetch failed
  fail: function(e) {
    console.log(e);
    Frm7.hideIndicator();
    alert("Não foi possível estabelecer conexão com o servidor.");
  },

  // fetch from server - uses leaflet view to limit results
  download: function() {
    // call to api with lat and long looking for restaurants in certain radius
    Frm7.showIndicator();
    var api = "/api/restaurante/?format=json";
    var bounds = map.object.getBounds();
    var lattop = bounds._southWest.lat;
    var longtop = bounds._southWest.lng;
    var latbottom = bounds._northEast.lat;
    var longbottom = bounds._northEast.lng;
    var query = "&lat__gte=" + lattop + "&long__gte=" + longtop + "&lat__lte=" + latbottom + "&long_lte=" + longbottom;
    var url = SERVER + api + query;
    $.getJSON(url, data.parseObjects, data.fail);
  },

  // fetch from server - single result from search
  downloadSingle: function(id) {
    Frm7.showIndicator();
    var api = "/api/restaurante/" + id + "/?format=json";
    var url = SERVER + api;
    $.getJSON(url, data.parseSingle, data.fail);
  },

  // fetch metadata
  downloadMeta: function() {
    if($.isEmptyObject(data.meta)) {
      Frm7.showIndicator();
      // por enquanto só pega a lista de origens -- fazer api com todos metadados depois..
      var api = "/api/origem/?format=json";
      var url = SERVER + api;
      $.getJSON(url, data.parseMeta, data.fail);
    } else {
      mainView.router.loadPage('#busca-nome');
    }
  },

  // busca por nome e atributos
  searchName: function() {
    Frm7.showIndicator();
    var api = "/api/restaurante/?format=json";
    var nome = $("#search-name-input").val();
    var origem = $("#search-filter-origem").val();
    var query = "";
    if(nome != "") query += "&nome__contains=" + nome;
    if(origem != "----") query += "&origem=" + origem;
    var url = SERVER + api + query;
    $.getJSON(url, data.parseSearchName, data.fail);
  },

  // busca por endereço
  searchAddress: function() {
    Frm7.showIndicator();
    var api = "http://open.mapquestapi.com/nominatim/v1/search.php?format=json";
    var key = "&key=dH7TjIg1f9jP1Q2Ckom19sp8dOfWW1KD";
    var search = $("#search-addr-input").val();
    var query = "&osm_type=way&q=" + search;
    var url = api + key + query;
    $.getJSON(url, data.parseSearchAddress, data.fail);
  }
};

app.initialize();
