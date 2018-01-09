const fs = require("fs");
const login = require("facebook-chat-api");

/* Getting credentials and saving in credentials.json for login */
var submit_cred = document.querySelector('div.form button[name="submit"]');

submit_cred.addEventListener('click', function () {
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
            document.getElementById('login-status').textContent = 'Wrong username/password! Try again.';
          default:
              console.error(err);
      }
      return;
    }

    fs.writeFileSync('./appstate.json', JSON.stringify(api.getAppState()));


  });
}
