const fs = require("fs");
const connection = require('./start.js');

var setting_buttons = document.querySelectorAll('input[type=checkbox]');

var settings = JSON.parse(fs.readFileSync('./app/resources/settings.json', 'utf8'));

for (var i = 0; i < setting_buttons.length; i++) {
    var settingbutton = setting_buttons[i];
    var name = settingbutton.attributes['id'].value;

    /* Set up buttons according to settings.json file */
    if (settings[i].settingname == name) {
      settingbutton.checked = settings[i].settingstatus;
    }

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

/* Get settings from other files */
var methods = {
	getsettingstatus: function(setting_name) {
    for (var i=0; i<settings.length; i++) {
        if (settings[i].settingname == setting_name) {
          return settings[i].settingstatus;
        }
	  }
  }
};
module.exports = methods;

/* Save new auto-reply text */
var save_reply = document.querySelector('div.tab-content button[name="save"]');

save_reply.addEventListener('click', function () {
  var text = document.querySelector('div.tab-content textarea[name="auto-reply-message"]').value;

  fs.writeFileSync('./app/resources/reply_text.txt', text);
  console.log("Text updated");
});


/* Construct whitelist */
/* Generate list of friends */
var friends = [{'userID':837374, 'fullName':'Camilla Nielsen'}]/*connection.getFriends();*/
if(friends == null)
{
  //Create new HTML element to tell user to connect with FB - evt. login redirect
} else {
  for (var i = 0; i < friends.length; i++) {
     var friend = friends[i];
     var friendID = friend.userID;
     var friendName = friend.fullName;

     var li = document.createElement('li');

     var input = document.createElement('input');
     input.setAttribute('type','checkbox');
     input.setAttribute('id',friendID);

     var label = document.createElement('label');
     label.setAttribute('for',friendID);
     label.innerHTML = friendName;

     document.getElementById('friends').appendChild(li).append(input,label);
  }
}

var filter = document.getElementById('filter');
var list = document.getElementById('friends');
var listItems = list.querySelectorAll('li');

/* Search function for filtering friends */
filter.addEventListener('keyup', function(e) {
  /* Found on codepen.io @hmps modified slightly */
  var val = new RegExp(e.target.value, 'gi');
  for(var i=0; i<listItems.length; i++) {
    if(e.target.value.length > 0) {
      var text = listItems[i].querySelector("label").innerHTML;
      if( !text.match(val)) {
        listItems[i].classList.add('is-hidden');
      } else {
        listItems[i].classList.remove('is-hidden');
      }
    } else {
      listItems[i].classList.remove('is-hidden');
    }
  }
});
