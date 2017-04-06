Frm7.onPageInit('restaurante', function(page) {
  // se usuário = criador do restaurante ou = admin então mostra botão editar
  var restUser = page.context.user;
  console.log(restUser);
  try {
    var clientUser = "/api/user/" + user.profile.id + "/";
  } catch (e) { // cai aqui se usuário não estiver logado
    var clientUser = "";
  }
  console.log(clientUser);
  if (user.profile.admin || clientUser == restUser) {
    $('#edit-restaurante').removeClass('hidden');
  }
});
