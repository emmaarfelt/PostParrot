const fs = require("fs");
const connection = require('./start.js');
const login = require("facebook-chat-api");

var statistics = JSON.parse(fs.readFileSync('./app/resources/statistics.json', 'utf8'));
var whitelist = JSON.parse(fs.readFileSync('./app/resources/whitelist.json', 'utf8'));
var settings = JSON.parse(fs.readFileSync('./app/resources/settings.json', 'utf8'));
var reply = fs.readFileSync('./app/resources/reply_text.txt', 'utf8');
if (reply == "") {reply = 'I\'m currently unavailable, and use PostParrot to auto-reply to messages. If urgent, give me a call.'}


/* Settings: Write new reply */
document.getElementById('enter-message').querySelector('textarea[name="auto-reply-message"]').innerHTML = reply;

var save_reply = document.querySelector('div.tab-content button[name="save"]');
save_reply.addEventListener('click', function () {
  reply = document.querySelector('div.tab-content textarea[name="auto-reply-message"]').value;
  save_reply.classList.add('save-reply-animation');
  save_reply.innerHTML = 'Saved!';
  fs.writeFileSync('./app/resources/reply_text.txt', reply);
  setTimeout(
    function() {
      save_reply.classList.remove('save-reply-animation');
      save_reply.innerHTML = 'save';
    }, 2000);
});

/* Settings: Group messages */
var ignore_groups = document.getElementById('ignore-group-messages');
var reply_tags = document.getElementById('reply-groupchat-mentions');

if (settings.ignoregroup) {
  ignore_groups.checked = true;
  reply_tags.disabled = true;
  document.getElementById('tag-reply').style.color = "#e5e5e5";
} else {
  ignore_groups.checked = false;
  reply_tags.checked = settings.replymentions;
}

ignore_groups.addEventListener('click', function() {
  if(ignore_groups.checked == true) {
    reply_tags.checked = false;
    reply_tags.disabled = true;
    document.getElementById('tag-reply').style.color = "#e5e5e5";
  } else {
    reply_tags.disabled = false;
    document.getElementById('tag-reply').style.color = "#424242";
  }

  settings.ignoregroup = ignore_groups.checked;
  fs.writeFileSync('./app/resources/settings.json', JSON.stringify(settings));
})

reply_tags.addEventListener('click', function() {
  if(reply_tags.checked == false) {
    document.getElementById('ignore').style.color = "#424242";
  }

  settings.replymentions = reply_tags.checked;
  fs.writeFileSync('./app/resources/settings.json', JSON.stringify(settings));
})

/* Settings: Edit Whitelist */
var listItems = [];
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
     if(whitelist.friends.includes(friendID)) {
       input.setAttribute('checked', true);
     }

     var label = document.createElement('label');
     label.setAttribute('for',friendID);
     label.innerHTML = friendName;

     document.getElementById('friends').appendChild(li).append(input,label);
  }
  listItems = document.getElementById('friends').querySelectorAll('li');
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

  var input_friends = document.querySelectorAll('div.whitelist input[type="checkbox"]');

  for(var i=0; i < input_friends.length; i++) {
    input_friends[i].addEventListener('change', editWhitelist);
  }

  function editWhitelist() {
    if(this.checked) {
      whitelist.friends.push(this.id);
      fs.writeFileSync('./app/resources/whitelist.json', JSON.stringify(whitelist));
    } else {
      var index = whitelist.friends.indexOf(this.id);
      whitelist.friends.splice(index, 1);
      fs.writeFileSync('./app/resources/whitelist.json', JSON.stringify(whitelist));
    }
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
  getReplyText: function() {
    return reply;
  },
  getWhitelist: function() {
    return whitelist.friends;
  },
  setTime: function(st, et) {
    var timeDiff = et - st;
    timeDiff /= 1000;
    statistics.totalhours = statistics.totalhours + timeDiff;
    fs.writeFileSync('./app/resources/statistics.json', JSON.stringify(statistics));
  },
  setRepliedThreads: function(threads) {
    statistics.totalreplies = statistics.totalreplies + threads;
    fs.writeFileSync('./app/resources/statistics.json', JSON.stringify(statistics));
  }
};
module.exports = methods;

/* Settings: Statistics */
var number_send = document.getElementById('number-response').textContent = statistics.totalreplies;
var hours_spend = document.getElementById('hours-spend').textContent = ((parseFloat(statistics.totalhours)) / 60 / 60).toFixed(2);
