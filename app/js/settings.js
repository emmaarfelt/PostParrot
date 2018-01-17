const fs = require("fs");
const connection = require('./start.js');
const login = require("facebook-chat-api");
const ArrayList = require ("arraylist");


/* Fetch userid for whitelisted users */
var whitelist = new ArrayList;
fs.readFile('./app/resources/whitelist.txt', 'utf8', function(err, data) {
    if (err) return err
    list = data.toString().split('\n');
    for(var i=0; i<list.length; i++) {
        whitelist.add(list[i])
        console.log(whitelist)
    }
    whitelist.remove("");
});

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
  },
  getWhitelist: function() {
    return whitelist;
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

/* Search function for whitelist */
var listItems = [];
var list = document.getElementById('friends');
var filter = document.getElementById('filter');
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

/* Construct whitelist */
function constructWhitelist(friends) {
  for (var i = 0; i < friends.length; i++) {
     var friend = friends[i];
     var friendID = friend.userID;
     var friendName = friend.fullName;

     var li = document.createElement('li');

     var input = document.createElement('input');
     input.setAttribute('type','checkbox');
     input.setAttribute('id',friendID);
     if (whitelist.indexOf(friendID) > -1) {
       input.setAttribute('checked', true);
     }

     var label = document.createElement('label');
     label.setAttribute('for',friendID);
     label.innerHTML = friendName;

     document.getElementById('friends').appendChild(li).append(input,label);
  }
  listItems = list.querySelectorAll('li');
}

try {
    var friendlist = JSON.parse(fs.readFileSync('./app/resources/friendlist.json', 'utf8'));
    constructWhitelist(friendlist);
  } catch (e) {
    login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
      if(err) return console.error(err);

      api.getFriendsList((err, data) => {
            if(err) return console.error(err);

            constructWhitelist(data);
            fs.writeFile('./app/resources/friendlist.json', JSON.stringify(data));
        });
    });
  }

  var save_whitelist = document.querySelector('div.whitelist button[name="save"]');

  save_whitelist.addEventListener('click', function () {
    fs.writeFileSync('./app/resources/whitelist.txt', ''); //Clear whitelist
    whitelisted = document.querySelectorAll('div.whitelist input[type=checkbox]:checked');
    for(var i=0; i < whitelisted.length; i++) {
      var friendID = whitelisted[i].id;

      fs.appendFileSync('./app/resources/whitelist.txt', '' + friendID + '\n');
    }
  });
