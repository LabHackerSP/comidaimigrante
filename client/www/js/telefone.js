Frm7.onPageInit('telefone', function(page) {
  // input mask para telefone
  $('#edit-tel').inputmask({
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

  // form validation
  $.validator.addMethod("notNull", function(value, element) {
    return value != null;
  }, "Este campo é requerido.");

  $('#tel-form').validate({
    ignore: false,
    rules: {
      tel: {
        required: false,
        minlength: 10,
      },
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

var telForm = {
  sendData: function() {
    if (!$('#tel-form').valid()) return false;

    var api = "/api/user/" + user.profile.id + "/";
    var url = SERVER + api;

    var tel = $('#edit-tel').val();
    var hash = SHA1(tel.substr(tel.length - 8)); // hash dos últimos 8 dígitos
    console.log(hash);
    var data = {
      username: hash
    };

    $.ajax({
      url: url,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      processData: false,
      complete: telForm.sendCheck
    });
  },

  sendCheck: function(data) {
    //created
    if (data.status == 204) {
      mainView.router.back();
    // qualquer outro código
    } else {
      alert("Ocorreu um erro ao tentar comunicar com o servidor.");
    }
  },
}
