const fs = require("fs");
const login = require("facebook-chat-api");
const path = require('path')
const {app} = require('electron').remote;
var appDataPath = path.join(app.getPath('appData'), 'appState.json');

/* Getting credentials and saving in credentials.json for login */
var submit_cred = document.getElementById('login-button');
var load_spinner = document.getElementById('load-spinner');

submit_cred.addEventListener('click', function () {
  submit_cred.classList.add('shrink-login-animation');
  submit_cred.innerHTML = "";
  load_spinner.classList.add('loader-appear');

  var username = document.querySelector('div.form input[id="name"]').value;
  var password = document.querySelector('div.form input[id="password"]').value;

  var cred = {
            email: username,
            password: password
        };

  FBlogin(cred);
});

function FBlogin(cred) {
  login(cred, { forceLogin: true }, (err, api) => {
    if(err) {
      switch (err.error) {
          case 'login-approval':
              //todo: two-factor authentication
              break;
          case 'Wrong username/password.':
            submit_cred.classList.remove('shrink-login-animation');
            submit_cred.innerHTML = "login";
            load_spinner.classList.remove('loader-appear');
            document.getElementById('login-status').textContent = 'Wrong username/password! Try again.';
          default:
              console.error(err);
      }
      return;
    } else {
      //Login success. Save in AppState file.
      fs.writeFileSync(appDataPath, JSON.stringify(api.getAppState()));
      //fs.writeFileSync('./appstate.json', JSON.stringify(api.getAppState()));
      document.getElementById('login-status').textContent = '';

      //Switch page
      window.location.href = 'index.html';
    }

  });
}
