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

var resourcize = function(name, resource) {
  //return '/api/' + resource + '/' + encodeURIComponent(name) + '/';
  return '/api/' + resource + '/' + name + '/';
};

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

  // form validation
  $.validator.addMethod("notNull", function(value, element) {
    return value != null;
  }, "Este campo é requerido.");

  $('#add-form').validate({
    ignore: false,
    rules: {
      nome: 'required',
      endereco: 'required',
      telefone: {
        required: false,
        minlength: 10,
      },
      comida: {
        notNull: true,
      },
      sinopse: 'required',
    },
    errorPlacement: function(error, element) {
      var placement = $(element).data('error');
      if ('#'+placement) {
        $('#'+placement).append(error)
      } else {
        error.insertAfter(element);
      }
    },
  });
});

Frm7.onPageInit('busca-end', function(page) {
    templates.searchAddr = Template7.compile(searchAddrTemplate);
});

var addForm = {
  data: {},
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
    /* TODO: fix this
    try {
      var rua = $.grep(obj.address_components, function(e){ return e.types.indexOf('route') >= 0; })[0].long_name;
      var num = $.grep(obj.address_components, function(e){ return e.types.indexOf('street_number') >= 0; })[0].long_name;
      var bairro = $.grep(obj.address_components, function(e){ return e.types.indexOf('sublocality') >= 0; })[0].long_name;
      var formatted_address = rua + ", " + num + " - " + bairro;
    } catch (e) {
      var formatted_address = obj.formatted_address;
    }*/
    formData = {
      'lat': obj.geometry.location.lat,
      'long': obj.geometry.location.lng,
      'endereco': $("#search-addr-input").val()
    };
    Frm7.formFromData("#add-form", formData);
    mainView.router.back();
  },

  // POST
  sendData: function() {
    if (!$('#add-form').valid()) return false
    var api = "/api/restaurante/";
    var url = SERVER + api;
    var data = Frm7.formToData('#add-form');
    data.origem = resourcize(data.origem, 'origem');
    data.regiao = resourcize(data.regiao, 'regiao');
    data.comida.forEach(function(part, index, arr) {
      arr[index] = resourcize(part, 'comida');
    });
    data.flags.forEach(function(part, index, arr) {
      arr[index] = resourcize(part, 'flags');
    });
    if(data.preco_min = "") data.preco_min = 0;
    if(data.preco_max = "") data.preco_max = 0;

    console.log(data);
    addForm.data = data;

    /*$.post(url, data,
      function(data) {
        console.log("success");
        console.log(data)
      },
      "json"
    );*/
    $.ajax({
      url: url,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      processData: false,
      complete: addForm.sendCheck
    })
  },

  sendCheck: function(data) {
    //created
    if (data.status == 201) {
      alert("O restaurante " + addForm.data.nome + "foi enviado com sucesso e aguarda moderação.");
      mainView.router.back();
    // qualquer outro código
    } else {
      alert("Ocorreu um erro ao tentar enviar o restaurante!");
    }
  },
};
