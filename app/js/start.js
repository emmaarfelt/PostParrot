const fs = require("fs");
const login = require("facebook-chat-api");
const ArrayList = require ("arraylist");
const loginstore = require('./state-storage.js');
var replied_threads = new ArrayList;
var startTime, endTime;

const settings = require('./settings.js');
var IGNORE_GROUPCHAT = settings.getsettingstatus('ignoregroup');
var REPLY_MENTIONS = settings.getsettingstatus('replymentions');
var whitelist = settings.getWhitelist();

var log_out = document.getElementById('logout');
log_out.addEventListener('click', stopReplies);

var start_replies = document.querySelector('div.big-button');

var stop_replies = document.querySelector('div.setup-buttons button[name="stop-button"]');
stop_replies.addEventListener('click', stopReplies);

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

function stopReplies() {
  endTime = new Date();
  settings.setTime(startTime,endTime);
  settings.setRepliedThreads(replied_threads.length);
  parrot_div.classList.remove('parrots-appear');
  start_replies.classList.remove('big-button-animation');
}

/* Check if reply file is empty */
function startReply() {
  startTime = new Date();
  var reply = settings.getReplyText();
  login({appState: loginstore.get('appState')}, (err, api) => {
    if(err) return window.location.href = 'login.html';


    api.setOptions({
       logLevel: "silent"
    });


    var ownUserID = api.getCurrentUserID();

    var listening = api.listen((err, message) => {
      if(err) return console.error(err);
      if(!message.isGroup) {
        if(!whitelist.friends.includes(message.senderID)) {
          if(!replied_threads.contains(message.threadID)) {
            api.sendMessage(reply, message.threadID);
            replied_threads.add(message.threadID);
          } else {  /* Already replied in this thread */ }
        } else { whitelist_notify(message.body) }
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
   });

   stop_replies.addEventListener('click', function () {
     return listening();
   });

   log_out.addEventListener('click', func, false);
   function func(event) {
     if ( event.preventDefault ) event.preventDefault();
     event.returnValue = false;
     console.log('logging out');
     loginstore.clear();
     api.logout();
     window.location = this.href;
     return listening();
   }

 });
}
