const fs = require("fs");
const login = require("facebook-chat-api");
const ArrayList = require ("arraylist");
const path = require('path')
const {app} = require('electron').remote;
var appDataPath = path.join(app.getPath('appData'), 'appState.json');

var replied_threads = new ArrayList;
var startTime, endTime;

const settings = require('./settings.js');
var IGNORE_GROUPCHAT = settings.getsettingstatus('ignore-group-messages');
var REPLY_MENTIONS = settings.getsettingstatus('reply-groupchat-mentions');
var whitelist = settings.getWhitelist();

var log_out = document.getElementById('logout');
var start_replies = document.querySelector('div.big-button');
var stop_replies = document.querySelector('div.setup-buttons button[name="stop-button"]');
var parrot_div = document.querySelector('div.parrots');
var parrot_container = document.querySelector('div.parrot-container');

start_replies.addEventListener('click', function () {
  startReply();

  start_replies.classList.add('big-button-animation');

  /* Parrot animation */
  parrot_div.classList.add('parrots-appear');
  parrot_container.classList.add('parrot-animation');
  stop_replies.classList.add('button-animation');

  setTimeout(
    function() {
      parrot_container.classList.remove('parrot-animation');
      stop_replies.classList.remove('button-animation');
    }, 3000);
});


/* Notify when message from whitelist friend received */
function whitelist_notify(message) {
  let notification = new Notification('Message from whitelist', {
    body: message,
    silent: true
  })
  var audio = new Audio('../assets/pip.mp3');
  audio.play();
}


/* Check if reply file is empty */
function startReply() {
  startTime = new Date();
  var reply = settings.getReplyText();
  login({appState: JSON.parse(fs.readFileSync(appDataPath, 'utf8'))}, (err, api) => {
    if(err) return window.location.href = 'login.html';

    api.setOptions({
       logLevel: "silent"
    });

    var ownUserID = api.getCurrentUserID();

    var listening = api.listen((err, message) => {
      if(!whitelist.contains(message.senderID)) {
        if(!replied_threads.contains(message.threadID)) {
          if(!message.isGroup) {
            api.sendMessage(reply, message.threadID);
            replied_threads.add(message.threadID);
          } else {
            if(IGNORE_GROUPCHAT) {
              if(REPLY_MENTIONS) {
                var mentions = message.mentions;
                if(!mentions == null) {
                  if(mentions.contains(ownUserID)) {
                    api.sendMessage(reply, message.threadID);
                    replied_threads.add(message.threadID);
                  }
                }
              } else {
                /* Do nothing. Ignoring all group messages */
              }
            } else {
              /* Replying to all messages including group chats */
              api.sendMessage(reply, message.threadID);
              replied_threads.add(message.threadID);
            }
          }
        } else {
          /* Already replied in this thread */
        }
      } else {
        whitelist_notify(message.body)
      }
   });

   stop_replies.addEventListener('click', function () {
     endTime = new Date();
     settings.setTime(startTime,endTime);
     settings.setRepliedThreads(replied_threads.length);
     parrot_div.classList.remove('parrots-appear');
     start_replies.classList.remove('big-button-animation');
     return listening();
   });

   log_out.addEventListener('click', function() {
     fs.writeFileSync(appDataPath, ''); //Clear appState-file
     api.logout();
     return listening();
   });

 });
}
