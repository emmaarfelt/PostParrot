const fs = require("fs");
const login = require("facebook-chat-api");
const Store = require('electron-store');
const store = new Store({
  name: 'settings',
  defaults: {
    statistics: { totalreplies: 0, totalhours: 0 },
    whitelist: {friends:[]},
    settings: {ignoregroup:true,replymentions:false},
    reply: 'I\'m currently unavailable, and use PostParrot to auto-reply to messages. If urgent, give me a call.'
  }
});

var statistics = store.get('statistics');
var whitelist = store.get('whitelist');
var settings = store.get('settings');
var reply = store.get('reply');

/* Settings: Write new reply */
document.getElementById('enter-message').querySelector('textarea[name="auto-reply-message"]').innerHTML = reply;

var save_reply = document.querySelector('div.tab-content button[name="save"]');

save_reply.addEventListener('click', function () {
  reply = document.querySelector('div.tab-content textarea[name="auto-reply-message"]').value;
  store.set('reply', reply);
  save_reply.classList.add('save-reply-animation');
  save_reply.innerHTML = 'Saved!';
  setTimeout(
    function() {
      save_reply.classList.remove('save-reply-animation');
      save_reply.innerHTML = 'save';
    }, 2000);
});

/* Settings: Group messages */
var ignore_groups = document.getElementById('ignore-group-messages');
var reply_tags = document.getElementById('reply-groupchat-mentions');

ignore_groups.checked = settings.ignoregroup;
if(!ignore_groups.checked) {
  document.getElementById('tag-reply').style.color = "#e5e5e5";
}
reply_tags.checked = settings.replymentions;

ignore_groups.addEventListener('click', function() {
  if(ignore_groups.checked == true) {
    reply_tags.disabled = false;
    document.getElementById('tag-reply').style.color = "#424242";
  } else {
    document.getElementById('tag-reply').style.color = "#e5e5e5";
    reply_tags.checked = false;
    reply_tags.disabled = true;
  }

  settings.ignoregroup = ignore_groups.checked;
  store.set('settings', settings);
})

reply_tags.addEventListener('click', function() {
  settings.replymentions = reply_tags.checked;
  store.set('settings', settings);
})


/* Settings: Edit Whitelist */
var listItems;

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


if(store.has('friendlist')) {
  constructWhitelist(store.get('friendlist'));
} else {
  login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    api.getFriendsList((err, data) => {
          if(err) return console.error(err);

          constructWhitelist(data);
          store.set('friendlist', data);
    });
  });
}

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

/* Add eventlistener to each friend in list */
var input_friends = document.querySelectorAll('div.whitelist input[type="checkbox"]');
for(var i=0; i < input_friends.length; i++) {
  input_friends[i].addEventListener('change', editWhitelist);
}

function editWhitelist() {
  if(this.checked) {
    whitelist.friends.push(this.id);
    store.set('whitelist', whitelist);
  } else {
    var index = whitelist.friends.indexOf(this.id);
    whitelist.friends.splice(index, 1);
    store.set('whitelist', whitelist);
  }
}

/* Settings: Statistics */
var number_send = document.getElementById('number-response').textContent = statistics.totalreplies;
var hours_spend = document.getElementById('hours-spend').textContent = ((parseFloat(statistics.totalhours)) / 60 / 60).toFixed(2);


/* Get settings from other files */
var methods = {
	getsettingstatus: function(setting_name) {
    switch (setting_name) {
      case 'ignoregroup':
        return settings.ignoregroup;
        break;
      case 'replymentions':
        return settings.replymentions;
    }
  },
  getReplyText: function() {
    return reply;
  },
  getWhitelist: function() {
    return whitelist;
  },
  setTime: function(st, et) {
    var timeDiff = et - st;
    timeDiff /= 1000;
    statistics.totalhours = statistics.totalhours + timeDiff;
    store.set('statistics', statistics);
  },
  setRepliedThreads: function(threads) {
    statistics.totalreplies = statistics.totalreplies + threads;
    store.set('statistics', statistics);
  }
};
module.exports = methods;
