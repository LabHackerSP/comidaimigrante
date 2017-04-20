Frm7.onPageInit('visitaco', function(page) {
  //init
});

var visitaco = {
  // send 'add' or 'remove' to event and check response
  send: function(status) {
    visitaco.status = status;
    $.ajax({
      url: url,
      type: 'GET',
      complete: visitaco.check
    });
  },

  // check response and call update if 204
  check: function() {
    //success
    if (d.status == 204) {
      update(visitaco.status);
      visitaco.status = undefined;
    // qualquer outro código
    } else {
      alert("Ocorreu um erro ao tentar comunicar com o servidor.");
    }
  },

  // updates object and then page
  // status is 'add' or 'remove'
  update: function(d, status) {
    if(status == 'add') {
      var user = {
        "first_name": user.profile.first_name,
        "last_name": user.profile.last_name,
        "resource_uri": resourcize(user.profile.id, 'user'),
        "username": user.profile.user
      };
      // adiciona à lista de visitantes
    } else if(status == 'remove') {
      // remove da lista de visitantes
    }
    // chama update da página
  },

  // returns true or false whether current logged user is in event
  userInEvent: function() {

  },
}
