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

  //limpa local no mapa quando endereço muda
  $('#add-endereco').change(function() {
    addForm.invalidaMapa();
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
      lat: 'required',
      long: 'required',
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
    focusInvalid: false,
    invalidHandler: function(form, validator) { // scroll para primeiro campo invláido
      if (!validator.numberOfInvalids()) return;
      var elem = $(validator.errorList[0].element).parent().parent().parent().parent();
      console.log(elem);
      $$('.page-content').scrollTop(
        elem.position().top, // posição do primeiro erro
        500 // tempo em milis
      );
    }
  });
});

Frm7.onPageInit('busca-end', function(page) {
    templates.searchAddr = Template7.compile(searchAddrTemplate);
});

var addForm = {
  editar: false,
  id: null,
  data: {},
  results: [],
  mapaValido: false,

  openStreetSearch: function() {
    if(!$("#add-endereco").valid()) return;
    var search = $("#add-endereco").val();
    mainView.router.load({
      url: 'busca-end.html'
    });
    addForm.searchAddress(search);
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
  searchAddress: function(search) {
    Frm7.showIndicator();
    var api = "https://maps.googleapis.com/maps/api/geocode/json?region=br";
    var key = "&key=" + keys.gmaps;
    if(!search) search = $("#search-addr-input").val();
    var query = "&address=" + search;
    var url = api + key + query;
    $.getJSON(url, addForm.parseSearchAddress, data.fail);
  },

  // seleciona resultado e coloca no form
  resultAddress: function(id) {
    var obj = addForm.results[id];
    console.log(obj);
    try {
      var rua = $.grep(obj.address_components, function(e){ return e.types.indexOf('route') >= 0; })[0].long_name;
      var num = $.grep(obj.address_components, function(e){ return e.types.indexOf('street_number') >= 0; })[0].long_name;
      var bairro = $.grep(obj.address_components, function(e){ return e.types.indexOf('sublocality') >= 0; })[0].long_name;
      var formatted_address = rua + ", " + num + " - " + bairro;
    } catch (e) {
      var formatted_address = obj.formatted_address;
    }
    formData = {
      'lat': obj.geometry.location.lat,
      'long': obj.geometry.location.lng,
    };
    Frm7.formFromData("#add-form", formData);
    addForm.validaMapa();
    mainView.router.back();
  },

  // usuário escolheu resultado no gmaps
  validaMapa: function() {
    $('#add-endereco-button').removeClass('button-fail');
    $('#add-endereco-button').addClass('button-ok');
    addForm.mapaValido = true;
  },

  // usuário mudou endereço, gmaps não é mais válido
  invalidaMapa: function() {
    $('#add-endereco-button').removeClass('button-ok');
    $('#add-endereco-button').addClass('button-fail');
    var formData = {
      'lat': 0,
      'long': 0,
    };
    Frm7.formFromData("#add-form", formData);
    addForm.mapaValido = false;
  },

  // POST
  sendData: function() {
    if (!$('#add-form').valid()) return false;
    if (!addForm.mapaValido) { // validação dos campos ocultos lat long
      $$('.page-content').scrollTop(
        $('#add-endereco-button').position().top, // posição do botão de endereço
        500 // tempo em milis
      );
      return false;
    }
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
    if(data.preco_min == "") data.preco_min = 0;
    if(data.preco_max == "") data.preco_max = 0;

    console.log(data);
    addForm.data = data;

    /*$.post(url, data,
      function(data) {
        console.log("success");
        console.log(data)
      },
      "json"
    );*/

    if(addForm.editar) { var type = 'PUT'; }
    else { var type = 'POST'; }

    $.ajax({
      url: url,
      type: type,
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      processData: false,
      complete: addForm.sendCheck,
      xhrFields: {
          withCredentials: true
        },
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", user.profile.csrf_token);
        }
    })
  },

  sendCheck: function(data) {
    //created
    if (data.status == 201) {
      alert("O restaurante " + addForm.data.nome + " foi enviado com sucesso e aguarda moderação.");
      mainView.router.back();
    } else if (data.status == 204) { // edited
      alert("O restaurante " + addForm.data.nome + "foi editado com sucesso.");
      app.loadRestaurant(addForm.id);
    } else { // qualquer outro código
      alert("Ocorreu um erro ao tentar enviar o restaurante!");
    }
  },
};
