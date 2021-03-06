/*
 * Comida Imigrante
 * 2016 Labhacker
 */

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
  },

  onDocumentReady: function() {
    $("[data-role=panel]").panel().enhanceWithin();
    map.init();
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};

var map = {
  object: null,

  init: function() {
    map.object = new L.Map('map');

  	url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  	opt = {attribution: "<a href='https://www.openstreetmap.org/'>OSM</a>"}
  	var layer = new L.TileLayer(url, opt);

  	map.object.addLayer(layer);
    // geopos de são paulo
  	map.object.setView(new L.LatLng(-23.5, -46.6),9);
  }
};

app.initialize();
