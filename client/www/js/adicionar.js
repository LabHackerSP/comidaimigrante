var searchAddrTemplate = '{{#if meta.total_count}}\
        <div class="content-block-title">Resultados</div>\
        <div class="list-block">\
          <ul>\
            {{#each results}}\
            <li class="item-content">\
              <a href="#" onClick="addForm.resultAddress({{@index}})">\
                <div class="item-inner">\
                  <div class="item-title">{{formatted_address}}</div>\
                </div>\
              </a>\
            </li>\
            {{/each}}\
          </ul>\
        </div>\
        {{else}}\
        <div class="content-block">\
          Não foram encontrados resultados\
        </div>\
        {{/if}}';

Frm7.onPageInit('adicionar', function(page) {
  // input mask para telefone
  $('#add-telefone').inputmask({
    'mask': '(99) [X]9999-9999',
    'greedy': false,
    'autoUnmask': true,
    'definitions': {
      'X': {
        validator: '[9]',
        cardinality: 1,
        casing: 'upper'
      }
    }
  });

  // atualiza valor visual de slider
  $$('input[type="range"]').on('input change', function(){
    $('#badge-'+this.name).html(this.value);
  });
});

Frm7.onPageInit('busca-end', function(page) {
    templates.searchAddr = Template7.compile(searchAddrTemplate);
});

var addForm = {
  results: [],

  openStreetSearch: function() {
    mainView.router.load({
      url: 'busca-end.html'
    });
  },

  // busca por endereço
  parseSearchAddress: function(json) {
    var obj = json;
    addForm.results = json.results;
    obj.meta = {
      total_count: json.results.length,
    };
    obj.objects = json;
    var html = templates.searchAddr(obj);
    $("#search-addr-results").html(html);

    Frm7.hideIndicator();
  },

  // busca por endereço
  searchAddress: function() {
    Frm7.showIndicator();
    var api = "https://maps.googleapis.com/maps/api/geocode/json?region=br";
    var key = "&key=" + keys.gmaps;
    var search = $("#search-addr-input").val();
    var query = "&address=" + search;
    var url = api + key + query;
    $.getJSON(url, addForm.parseSearchAddress, data.fail);
  },

  // seleciona resultado e coloca no form
  resultAddress: function(id) {
    var obj = addForm.results[id];
    console.log(obj);
    var rua = $.grep(obj.address_components, function(e){ return e.types.indexOf('route') >= 0; })[0].long_name;
    var num = $.grep(obj.address_components, function(e){ return e.types.indexOf('street_number') >= 0; })[0].long_name;
    var bairro = $.grep(obj.address_components, function(e){ return e.types.indexOf('sublocality') >= 0; })[0].long_name;
    var formatted_address = rua + ", " + num + " - " + bairro;
    console.log(formatted_address);
    console.log(obj.geometry.location.lat);
    console.log(obj.geometry.location.lng);
    formData = {
      'lat': obj.geometry.location.lat,
      'long': obj.geometry.location.lng,
      'endereco': formatted_address
    };
    Frm7.formFromData("#add-form", formData);
    mainView.router.back();
  },
};
