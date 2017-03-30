/*
 * Comida de (I)migrante
 * 2016 Labhacker
 */
// Initialize your app
var Frm7 = new Framework7({
   //swipePanel: 'left'
   fastClicks: false,
   modalTemplate: $('#popover-template').html(),
   template7Pages: true,
   material: true,
   smartSelectOpenIn: 'popup',
});
// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = Frm7.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    //dynamicNavbar: true
    domCache: true, // enable inline pages
});

// carrega scripts de outras páginas
$$(document).on('pageInit', function(e) {
  var page = e.detail.page;
  $$(page.container).find("script").each(function(el) {
      if ($(this).attr('src')) {
          jQuery.getScript($(this).attr('src'));
      } else {
          eval($(this).text());
      }
  });
});

var templates = {
  searchFilters: Template7.compile($$('#search-name-filters-template').html()),
  searchName: Template7.compile($$('#search-name-results-template').html()),
  popover: Template7.compile($$('#popover-template').html()),
  leftPanel: Template7.compile($$('#left-panel-template').html()),

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
          if(abre < agora && agora < fecha) return "Aberto agora" + hora;
        }
      }
      return "Fechado agora" + hora;
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

  temPreco: function(preco_min, preco_max) {
    if(!preco_min && !preco_max) return false;
    return true;
  },

  formataPreco: function(preco_min, preco_max) {
    if(!preco_min) return "R$" + preco_max.toFixed(2);
    if(!preco_max) return "R$" + preco_min.toFixed(2);
    return "R$" + preco_min.toFixed(2) + " - R$" + preco_max.toFixed(2);
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

  bandeira: function(bandeira) {
    var file = 'css/images/flags/'+bandeira+'.png';
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', file, false);
    // tenta buscar o arquivo
    try {
      httpRequest.send();
    } catch(exception) {
      if(exception.name == 'NetworkError'){
        // joga para bandeira desconhecida se erro
        file = 'css/images/flags/_unknown.png';
      }
    }
    return file;
  },
};

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

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
      StatusBar.backgroundColorByHexString("#8E3523");
      //StatusBar.backgroundColorByHexString("#1C81CE");
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", user.profile.csrf_token);
            }
        }
    });

    setTimeout(function() {
        navigator.splashscreen.hide();
    }, 2000);
  },

  onDocumentReady: function() {
    moment.locale('pt-br');
    map.init();
    user.downloadProfile();
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
    var popover = Frm7.popover(html, $$('html'));
    console.log(popover);
  },

  openAddForm: function() {
    if(!user.profile.admin) {
      alert("Você não pode executar essa ação!");
      return;
    }
    if($.isEmptyObject(data.forms)) { data.downloadGeneric(app.openAddForm, 'forms'); }
    else {
      mainView.router.load({
        url: 'adicionar.html',
        context: data.forms,
      });
    }
  },

  openSearch: function() {
    if($.isEmptyObject(data.meta)) data.downloadGeneric(app.openSearch, 'meta');
    else {
      var html = templates.searchFilters(data.meta);
      $("#search-name-filters").html(html);
      mainView.router.loadPage('#busca-nome');
    }
  },
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
    //a.classList = 'map-top-button button-fill search-button search-button-hide';
    a.classList = 'floating-button map-top-button search-button'

    var i = document.createElement('i');
    i.classList = 'material-icons'
    i.appendChild(document.createTextNode('search'));
    a.appendChild(i);

    L.DomEvent.addListener(a, 'click', app.openSearch);

    return a;
  },

  onRemove: function(m) {
    // Nothing to do here
  }
});

// marker com bandeira
var FlagIcon = function(flag, size) {
  return new L.Icon({
    iconUrl: templates.bandeira(flag),
    iconSize:     [size, size],
    iconAnchor:   [size/2, size/2],
    popupAnchor:  [size/2, -4]
  });
};

var map = {
  flag: {},
  object: null,
  dot: null,

  init: function() {
    var opt = {
      zoomControl: false,
    };
    map.object = new L.Map('map', opt);

  	var url = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'

    opt = {
      minZoom: 13,
      maxZoom: 18,
      attribution: "Tiles &copy; Esri &mdash;",
    };
  	var layer = new L.TileLayer(url, opt);

    // botão gps
    var gpsbutton = new GPSButton({position:'bottomright'});
    gpsbutton.addTo(map.object);

    // botão busca
    var searchbutton = new SearchButton({position:'bottomright'});
    searchbutton.addTo(map.object);

  	map.object.addLayer(layer);
    var userIcon = L.icon({
      'iconUrl' : 'css/images/userIcon.png',
      'iconSize' : [31,37]
    });

    map.markerClusters = L.markerClusterGroup({
      spiderfyDistanceMultiplier: 1.5,
      showCoverageOnHover: false,
      maxClusterRadius: 10,
    });
    map.markerClusters.freezeAtZoom(18);
    map.dot = L.marker([0, 0], { icon :userIcon}).addTo(map.object);
    // geopos de são paulo
  	map.object.setView(new L.LatLng(-23.547934, -46.632708), 50).setZoom(13);

    map.centerOnGPS();
    data.download();
    map.showSearchButton();
    map.object.on('moveend', function(e) {
    });

  },

  // finds gps, sets marker and pans camera to it
  centerOnGPS: function() {
    map.object.locate({
      enableHighAccuracy:true,
      setView:true,
      maxZoom:13,
    });
    map.object.on('locationfound', map.updateDot);
  },

  // callback function to set marker
  updateDot: function(e) {
    map.dot.setLatLng(e.latlng)
    map.dot.update();

    // fetch closest restaurants when location is found
    //data.download();
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
  },

  // caching de ícones
  flagIcon: function(flag) {
    if(!(flag in map.flag)) {
      var size = 32;
      map.flag[flag] = FlagIcon(flag, size);
    }
    return map.flag[flag];
  }
};

var data = {
  // json is stored and used to populate list
  list: {},
  objects: {},
  meta: {},
  forms: {},

  addObject: function(obj) {
    if(!(obj.id in data.objects)) {
      data.objects[obj.id] = obj;
    }
  },

  addList: function(obj) {
    if(!(obj.id in data.list)) {
      obj.marker = L.marker([obj.lat, obj.long], {icon: map.flagIcon(obj.origem.bandeira)});
      obj.marker.on('click', map.clickMarker);
      obj.marker.id = obj.id;
      data.list[obj.id] = obj;
      map.markerClusters.addLayer(obj.marker);
    }
  },

  // function to receive json and add markers to map
  parseList: function(json) {
    // add to objects if not already loaded
    for(var k in json.objects) {
      data.addList(json.objects[k]);
    }

    $$('.leaflet-marker-icon').on('click', function() {
      console.log(this);
    });
    map.object.addLayer( map.markerClusters );
    Frm7.hideIndicator();
  },

  // function to receive json and add markers to map
  parseSingle: function(json) {
    // add to objects if not already loaded
    data.addObject(json);
    //close search, show restaurant info
    app.loadRestaurant(json.id);

    Frm7.hideIndicator();
  },

  // parser metadados
  parseGeneric: function(callback, target) {
    return function(json) {
      data[target] = json;
      callback();
      Frm7.hideIndicator();
    }
  },

  // busca por nome
  parseSearchName: function(json) {
    var html = templates.searchName(json);
    $("#search-name-results").html(html);
    console.log(json);
    // add to objects if not already loaded
    for(var k in json.objects) {
      data.addList(json.objects[k]);
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
    //var query = "&lat__gte=" + lattop + "&long__gte=" + longtop + "&lat__lte=" + latbottom + "&long_lte=" + longbottom;
    var query = "&limit=997";
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
  downloadGeneric: function(callback, target) {
    if($.isEmptyObject(data[target])) {
      Frm7.showIndicator();
      var api = "/api/" + target;
      var url = SERVER + api;
      $.getJSON(url, data.parseGeneric(callback, target), data.fail);
    } else {
      callback();
    }
  },

  // busca por nome e atributos
  searchName: function() {
    Frm7.showIndicator();
    var api = "/api/restaurante/?";
    var nome = $("#search-name-input").val();
    var origem = $("#search-filter-origem").val();
    var comida = $("#search-filter-comida").val();
    var regiao = $("#search-filter-regiao").val();
    var query = $.param(cleanupParam({
      'nome__contains': nome,
      'origem': origem,
      'comida': comida,
      'regiao': regiao,
    }));
    var url = SERVER + api + query;
    $.getJSON(url, data.parseSearchName, data.fail);
  },
};

// detecta valor vazio
function isEmpty(value) {
  return value == null || value == "";
}

// apaga atributos vazios
function cleanupParam(queryParams) {
  for(key in queryParams)
    if(isEmpty(queryParams[key]))
       delete queryParams[key];
  return queryParams;
}

// funções de usuário e login
var user = {
  profile: {
    authenticated: false,
  },
  browser: null,
  options: {
    toolbarColor: '#8E3523',
    toolbarHeight: '50',
    closeButtonText: 'Fechar',
    closeButtonSize: '20',
    closeButtonColor: '#FFFFFF',
    openHidden: false
  },

  login: function(app) {
    var url = SERVER + '/accounts/'+app+'/login/';
    user.browser = window.inAppBrowserXwalk.open(url, user.options);
    user.browser.addEventListener("loadstop", function (e) {
      // if the user is redirected to the profile page, close this window and update info
      if(e.url.search("/accounts/profile") > 0) {
        user.browser.close();
        user.downloadProfile();
      }
    });
  },

  logout: function() {
    var url = SERVER + '/accounts/logout/';
    /*$.ajax({
      url: url,
      type: 'POST',
      crossDomain: true,
      beforeSend: function(request) {
        request.setRequestHeader("X-CSRFToken", user.profile.csrf_token);
      },
      xhrFields: { withCredentials: true },
      complete: user.downloadProfile
    });*/
    // O POST NÃO FUNCIONA POR CAUSA DO CSRF
    user.browser = window.inAppBrowserXwalk.open(url, user.options);
    user.browser.addEventListener("loadstop", function (e) {
      // if the user is redirected to the main page, close this window and update info
      if(e.url == SERVER + "/") {
        user.browser.close();
        user.downloadProfile();
      }
    });
  },

  downloadProfile: function() {
    // requests currently logged in profile from server
    Frm7.showIndicator();
    var api = '/accounts/profile';
    var url = SERVER + api;
    //$.getJSON(url, user.parseProfile, data.fail);
    $.ajax({
      url: url,
      method: 'GET',
      crossDomain: true,
      success: user.parseProfile,
    })
  },

  parseProfile: function(json) {
    // receive profile and change templates accordingly
    user.profile = json;
    if(DEBUG) user.profile.admin = true;
    var html = templates.leftPanel(user.profile);
    $("#left-panel").html(html);
    Frm7.hideIndicator();

    // if username (phone hash) is blank, send user to phone input screen
    if(user.profile.authenticated && user.profile.user == "") {
      mainView.router.load({
        url: 'telefone.html'
      });
    }
  },
};

app.initialize();
