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
    } else {
      //Login success. Save in AppState file.
      fs.writeFileSync('./appstate.json', JSON.stringify(api.getAppState()));
      document.getElementById('login-status').textContent = '';

      //Switch page
      window.location.hash = '#settings';

    }

  });
}

/* Save new auto-reply text */
var save_reply = document.querySelector('div.tab-content button[name="save"]');

save_reply.addEventListener('click', function () {
  var text = document.querySelector('div.tab-content textarea[name="auto-reply-message"]').value;

  fs.writeFileSync('./app/resources/reply_text.txt', text);
  console.log("Text updated");
});

/* Start auto-replying messages */
var start_replies = document.querySelector('div.big-button button[name="starter-button"]');

start_replies.addEventListener('click', function() {
  start_replies.style.transform = 'scale(0.0, 0.0)';
  start_replies.style.opacity = '0.0';

  var parrot_div = document.querySelector('div.parrots');
  parrot_div.style.display = 'inline';

  var parrot_container = document.querySelector('div.parrot-container');
  parrot_container.classList.add('parrot-animation');

});
