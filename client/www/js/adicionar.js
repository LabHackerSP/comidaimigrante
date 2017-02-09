var searchAddrTemplate = '{{#if meta.total_count}}\
        <div class="content-block-title">Resultados</div>\
        <div class="list-block">\
          <ul>\
            {{#each objects}}\
            <li class="item-content">\
              <a href="#index" onClick="map.panTo({{lat}},{{lon}})">\
                <div class="item-inner">\
                  <div class="item-title">{{display_name}}</div>\
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

Frm7.onPageInit('busca-end', function (page) {
    templates.searchAddr = Template7.compile(searchAddrTemplate);
});

var addForm = {
  openStreetSearch: function() {
    mainView.router.load({
      url: 'busca-end.html'
    });
  },

  // busca por endereço
  parseSearchAddress: function(json) {
    var obj = {};
    obj.meta = {
      total_count: json.length,
    };
    obj.objects = json;
    var html = templates.searchAddr(obj);
    $("#search-addr-results").html(html);

    Frm7.hideIndicator();
  },

  // busca por endereço
  searchAddress: function() {
    Frm7.showIndicator();
    var api = "http://open.mapquestapi.com/nominatim/v1/search.php?format=json";
    var key = "&key=dH7TjIg1f9jP1Q2Ckom19sp8dOfWW1KD";
    var search = $("#search-addr-input").val();
    var query = "&osm_type=way&q=" + search;
    var url = api + key + query;
    $.getJSON(url, addForm.parseSearchAddress, data.fail);
  },
};
