/*
 * Comida Imigrante
 * 2016 Labhacker
 */

SERVER = "http://comidaimigrante.labhacker.org.br"

// Initialize your app
var Frm7 = new Framework7({
   //swipePanel: 'left'
   fastClicks: false,
   modalTemplate: $('#popover-template').html(),
   template7Pages: true,
   material: true,
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
  searchFilters: Template7.compile($$('#search-name-filters-template').html()),
  searchName: Template7.compile($$('#search-name-results-template').html()),
  popover: Template7.compile($$('#popover-template').html()),

  // hoje true = aberto/fechado hoje
  // hoje false = lista de parágrafos com horários
  formataHorario: function(horarios, hoje) {
    var nhorarios = horarios.length;
    var agora = new moment();
    var hora = "";
    if(hoje) {
      for(var i = 0; i < nhorarios; i++) {
        if(horarios[i].weekday == agora.isoWeekday()) {
          var abre = new moment(horarios[i].from_hour, "HH:mm:ss");
          var fecha = new moment(horarios[i].to_hour, "HH:mm:ss");
          var hora = ": " + abre.format("HH:mm") + " - " + fecha.format("HH:mm");
          if(abre < agora && agora < fecha) return "Aberto hoje" + hora;
        }
      }
      return "Fechado hoje" + hora;
    } else {
      var html = '';
      for(var i = 0; i < nhorarios; i++) {
        if(horarios[i].weekday != agora.isoWeekday()) {
          var abre = new moment(horarios[i].from_hour, "HH:mm:ss");
          var fecha = new moment(horarios[i].to_hour, "HH:mm:ss");
          html += "<p>" +
                  moment(horarios[i].weekday, 'E').format('dddd') +
                  ": " +
                  abre.format("HH:mm") + " - " + fecha.format("HH:mm") +
                  "</p>";
        }
      }
      return html;
    }
  },

  formataPreco: function(preco) {
    return Array(preco + 1).join('$');
  },

  formataTelefone: function(phone) {
    var formatted = '(' + phone.substr(0, 2) + ') ';
    if(phone.length < 11) {
      formatted += phone.substr(2, 4) + '-' + phone.substr(6,4);
    } else {
      formatted += phone.substr(2, 5) + '-' + phone.substr(7,4);
    }
    return formatted;
  },
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
    document.addEventListener('backbutton', app.onBackKeyDown, false);
    if (cordova.platformId == 'android') {
      StatusBar.backgroundColorByHexString("#1C81CE");
      //StatusBar.backgroundColorByHexString("#1C81CE");
    }
  },

  onDocumentReady: function() {
    map.init();
    moment.locale('pt-br');
  },

  onBackKeyDown: function() {
    // fecha modais se abertos
    if($$('.modal-in').length > 0) {
      Frm7.closeModal();
      return false;
    // fecha paineis se abertos
    } else if($$('.panel.active').length > 0) {
      Frm7.closePanel();
      return false;
    // fecha aplicativo se página é index
    } else if(mainView.activePage.name == 'index') {
      navigator.Backbutton.goBack();
      return false;
    // volta para index
    } else {
      mainView.router.back();
    }
    return true;
  },

  // opens picker modal with restaurant info
  loadRestaurant: function(uuid) {
    var obj = data.objects[uuid];
    //map.panTo(obj.lat, obj.long);
    //var html = templates.picker(obj);
    //$("#picker-info").html(html);
    //Frm7.pickerModal("#picker-info");
    console.log(obj);
    mainView.router.load({
      url: 'restaurante.html',
      context: obj,
    });
  },

  loadRestaurantPopover: function(uuid) {
    var obj = data.list[uuid];
    map.panTo(obj.lat, obj.long);
    var html = templates.popover(obj);
    var popover = Frm7.popover(html, $$('#popover-center'));
    console.log(popover);
  }
};

// botão gps
var GPSButton = L.Control.extend({
  onAdd: function(m) {
    var a = L.DomUtil.create('a');
    a.href = '#';
    a.classList = 'floating-button map-top-button gps-button';

    var i = document.createElement('i');
    i.classList = 'material-icons'
    i.appendChild(document.createTextNode('gps_fixed'));
    a.appendChild(i);
    L.DomEvent.addListener(a, 'click', map.centerOnGPS);

    return a;
  },

  onRemove: function(m) {
    // Nothing to do here
  }
});

// botão busca
var SearchButton = L.Control.extend({
  onAdd: function(m) {
    var a = L.DomUtil.create('a');
    a.href = '#';
    a.id = 'map-search-button';
    a.classList = 'map-top-button button-fill search-button search-button-hide';

    a.appendChild(document.createTextNode('Buscar nesse local'));
    L.DomEvent.addListener(a, 'click', data.download);

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
      minZoom: 14,
      maxZoom: 17,
      attribution: "<a href='https://www.openstreetmap.org/'>OSM</a>",
    };
  	var layer = new L.TileLayer(url, opt);

    // botão gps
    var gpsbutton = new GPSButton({position:'bottomright'});
    gpsbutton.addTo(map.object);

    // botão busca
    var searchbutton = new SearchButton({position:'bottomleft'});
    searchbutton.addTo(map.object);

  	map.object.addLayer(layer);
    map.dot = L.marker([0, 0]).addTo(map.object);
    // geopos de são paulo
  	map.object.setView(new L.LatLng(-23.5, -46.6),50);

    map.centerOnGPS();

    map.object.on('moveend', function(e) {
      map.showSearchButton();
    });
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
    //app.loadRestaurant(e.target.id);
    app.loadRestaurantPopover(e.target.id);
  },

  panTo: function(lat, lng) {
    var latlng = L.latLng(lat, lng);
    map.object.panTo(latlng);
  },

  showSearchButton: function() {
    $('#map-search-button').removeClass('search-button-hide');
  },

  hideSearchButton: function() {
    $("#map-search-button").addClass('search-button-hide');
  }
};

var data = {
  // json is stored and used to populate list
  list: {},
  objects: {},
  meta: {},

  // function to receive json and add markers to map
  parseList: function(json) {
    // add to objects if not already loaded
    for(var k in json.objects) {
      var obj = json.objects[k];
      if(!(obj.id in data.list)) {
        obj.marker = L.marker([obj.lat, obj.long]).addTo(map.object);
        obj.marker.on('click', map.clickMarker);
        obj.marker.id = obj.id;
        data.list[obj.id] = obj;
      }
    }

    $$('.leaflet-marker-icon').on('click', function() {
      console.log(this);
    });

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
    data.meta = json;
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
      if(!(obj.id in data.list)) {
        obj.marker = L.marker([obj.lat, obj.long]).addTo(map.object);
        obj.marker.on('click', map.clickMarker);
        obj.marker.id = obj.id;
        data.list[obj.id] = obj;
      }
    }

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
    map.hideSearchButton();
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
    $.getJSON(url, data.parseList, data.fail);
  },

  // fetch from server - "view more" downloads full detail
  downloadSingle: function(id) {
    // if we already have the restaurant detail don't download it
    if(id in data.objects) {
      app.loadRestaurant(id);
    } else {
      Frm7.showIndicator();
      var api = "/api/restaurante/" + id + "/?format=json";
      var url = SERVER + api;
      $.getJSON(url, data.parseSingle, data.fail);
    }
  },

  // fetch metadata
  downloadMeta: function() {
    if($.isEmptyObject(data.meta)) {
      Frm7.showIndicator();
      var api = "/api/meta";
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
};

app.initialize();
