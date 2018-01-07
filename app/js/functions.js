const fs = require("fs");

/* Getting credentials and saving in credentials.json for login */
var submit_cred = document.querySelector('div.form button[name="submit"]');
submit_cred.addEventListener('click', function () {
  var username = document.querySelector('div.form input[id="name"]').value;
  var password = document.querySelector('div.form input[id="password"]').value;

  var credentialsJson = "{\n\"email\": \"" + username +"\",\n\"password\": \""+ password +"\"\n}"

  fs.writeFile("./app/js/credentials.json", credentialsJson, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
});
