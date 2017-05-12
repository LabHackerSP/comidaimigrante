Frm7.onPageInit('visitaco-add', function(page) {
  visitacoForm.page = page;

  // form validation
  $.validator.addMethod("notNull", function(value, element) {
    return value != null;
  }, "Este campo é requerido.");

  $('#visitaco-form').validate({
    ignore: false,
    rules: {
      nome: 'required',
      sinopse: 'required',
      data: 'required',
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

  visitacoForm.init(page);
});

var visitacoForm = {
  init: function(page) {
    visitacoForm.data = {};
    visitacoForm.restaurante = page.context.rid;

    // limpa form
    $('#visitaco-form').trigger('reset');

    // editar evento
    console.log(page.context);
    if(page.context.key != undefined) {
      var eventoobj = data.objects[page.context.rid].eventos[page.context.key];
      visitacoForm.id = eventoobj.id;
      visitacoForm.editar = true;
      // clona objeto pra evitar alterações
      var obj = JSON.parse(JSON.stringify(eventoobj));

      // converte true/false para checkbox
      if(obj.privado) {
        obj.privado = ["on"];
      } else {
        obj.privado = [];
      }

      console.log(obj)
      Frm7.formFromData("#visitaco-form", obj);
    } else {
      visitacoForm.id = null;
      visitacoForm.editar = false;
      formData = {
        'restaurante': resourcize(visitacoForm.restaurante, 'restaurante')
      };
      Frm7.formFromData("#visitaco-form", formData);
    }
  },

  // POST
  formSend: function() {
    if (!$('#visitaco-form').valid()) return false;

    var api = "/api/evento/";
    if(visitacoForm.editar) {
      var type = 'PATCH';
      api = api + visitacoForm.id + '/';
    }
    else { var type = 'POST'; }
    var url = SERVER + api;

    var data = Frm7.formToData('#visitaco-form');

    // converte checkbox pra true/false
    if(data.privado.length > 0) {
      data.privado = true;
    } else {
      data.privado = false;
    }
    console.log(data);
    visitacoForm.data = data;

    /*$.post(url, data,
      function(data) {
        console.log("success");
        console.log(data)
      },
      "json"
    );*/

    Frm7.showIndicator();

    $.ajax({
      url: url,
      type: type,
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      processData: false,
      complete: visitacoForm.formCheck,
      xhrFields: {
        withCredentials: true
      },
      beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", user.profile.csrf_token);
      }
    })
  },

  formCheck: function(d) {
    Frm7.hideIndicator();
    if (d.status == 201) { // created
      alert("O visitaço " + visitacoForm.data.nome + " foi enviado com sucesso.");
      delete data.objects[visitacoForm.restaurante];
      mainView.router.back({pageName: 'index', force: true});
      data.downloadSingle(visitacoForm.restaurante);
    } else if (d.status == 202) { // edited
      alert("O visitaço " + visitacoForm.data.nome + " foi editado com sucesso.");
      delete data.objects[visitacoForm.restaurante];
      mainView.router.back({pageName: 'index', force: true});
      data.downloadSingle(visitacoForm.restaurante);
    } else { // qualquer outro código
      alert("Ocorreu um erro ao tentar enviar o Visitaço!");
    }
  },
};
