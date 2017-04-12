Frm7.onPageInit('sobre', function(page) {
  //exibe versão na página
  if (window.cordova) {
    cordova.getAppVersion.getVersionNumber().then(function (version) {
      $('.versao').text(version);
    });
  } else {
    $('.versao').text('null');
  }
});
