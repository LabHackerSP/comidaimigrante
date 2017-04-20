var botaoRemove = '<a href="#" id="edit-restaurante" class="floating-button color-pink" onClick="visitaco.send(\'remove\')">\
        <i class="material-icons">remove</i>\
      </a>';

var botaoAdd = '<a href="#" id="edit-restaurante" class="floating-button color-pink" onClick="visitaco.send(\'add\')">\
        <i class="material-icons">add</i>\
      </a>';

Frm7.onPageInit('visitaco', function(page) {
  //init
  var r = /\d+/;
  var rid = page.context.restaurante.match(r); //restaurante id
  var ekey = page.context.key; // eventos index
  visitaco.object = data.objects[rid].eventos[ekey];
  if(user.profile.authenticated) visitaco.userInEvent();
});

var visitaco = {
  object: null, // data object to be edited

  // send 'add' or 'remove' to event and check response
  send: function(status) {
    visitaco.status = status;

    var api = "/api/visitar/" + visitaco.object.id + "/" + status;
    var url = SERVER + api;

    $.ajax({
      url: url,
      type: 'GET',
      complete: visitaco.check,
      xhrFields: {
        withCredentials: true
      },
      beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", user.profile.csrf_token);
      }
    });
  },

  // check response and call update if 204
  check: function(d) {
    //success
    if (d.status == 204) {
      visitaco.update(visitaco.status);
      visitaco.status = undefined;
    // qualquer outro código
    } else {
      alert("Ocorreu um erro ao tentar comunicar com o servidor.");
    }
  },

  // updates object and then page
  // status is 'add' or 'remove'
  update: function(status) {
    if(status == 'add') {
      var visitor = {
        "first_name": user.profile.first_name,
        "last_name": user.profile.last_name,
        "resource_uri": resourcize(user.profile.id, 'user'),
        "username": user.profile.user
      };
      // adiciona à lista de visitantes
      visitaco.object.visitors.push(visitor);
    } else if(status == 'remove') {
      // remove da lista de visitantes
      var key = visitaco.userInEvent();
      if(key > -1) visitaco.object.visitors.splice(key, 1);
    }
    // chama update da página
    mainView.router.load({
      url: 'visitaco.html',
      context: visitaco.object,
      reload: true,
    });
  },

  // returns array index if user is in visitors, -1 otherwise
  // also changes button to match state
  userInEvent: function() {
    var visitors = visitaco.object.visitors;
    var userresource = resourcize(user.profile.id, 'user');
    for(var i = 0; i < visitors.length; i++) {
      if(visitors[i].resource_uri == userresource) {
        $('#botao-visitar').html(botaoRemove);
        return i;
      }
    }
    $('#botao-visitar').html(botaoAdd);
    return -1;
  },
}
