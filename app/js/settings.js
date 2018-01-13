const fs = require("fs");

var setting_buttons = document.querySelectorAll('input[type=checkbox]');

/* */
var settings = JSON.parse(fs.readFileSync('./app/resources/settings.json', 'utf8'));

for (var i = 0; i < setting_buttons.length; i++) {
    var settingbutton = setting_buttons[i];
    var name = settingbutton.attributes['id'].value;

    /* Set up buttons according to settings.json file */
    if (settings[i].settingname == name) {
      settingbutton.checked = settings[i].settingstatus;
    }git status

    setupSetting(settingbutton);
}

function setupSetting(button) {
  var settingname = button.attributes['id'].value;

  settingbutton.addEventListener('click', function () {
      var status = button.checked;
      editSetting(settingname, status);
    });
}

function editSetting(name, checked) {
  for (var i=0; i<settings.length; i++) {
      if (settings[i].settingname == name) {
        settings[i].settingstatus = checked;
        break;
      }
  }

  fs.writeFileSync('./app/resources/settings.json', JSON.stringify(settings));
}
