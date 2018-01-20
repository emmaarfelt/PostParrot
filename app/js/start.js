const fs = require("fs");
const login = require("facebook-chat-api");
const ArrayList = require ("arraylist");
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

/* Check if reply file is empty */
function startReply() {
  startTime = new Date();
  var reply = settings.getReplyText();
  login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return window.location.href = 'login.html';

    var ownUserID = api.getCurrentUserID();

    var listening = api.listen((err, message) => {
      if(!replied_threads.contains(message.threadID)) {
           if (message.senderID == ownUserID) {
             // This message was sent by you!
             if (message.body == "/stop") {
                 api.sendMessage("<autoreplies were already disabled for this thread>", message.threadID);
             }
             if (message.body == "/resume") {
                 api.sendMessage("<autoreplies are enabled for this thread>", message.threadID);
             }
           } else {
              if(!whitelist.includes(message.senderID)) {
                if(!IGNORE_GROUPCHAT) {
                    api.sendMessage(reply, message.threadID);
                    replied_threads.add(message.threadID);
                } else {
                  if(REPLY_MENTIONS) {
                    var mentions = message.mentions;
                    if(!mentions == null) {
                      if(mentions.contains(ownUserID)) {
                        api.sendMessage(reply, message.threadID);
                        replied_threads.add(message.threadID);
                      }
                    }
                  } else {
                    // Do not reply in group chats, no reply mentions and not a whitelist person
                    api.sendMessage(reply, message.threadID);
                    replied_threads.add(message.threadID);
                  }
                }
              } else {
                //  Nothing person is whitelisted. todo: create warning
              }
          }
     } else {/* Already replied */}
   });


   stop_replies.addEventListener('click', function () {
     endTime = new Date();
     settings.setTime(startTime,endTime);
     settings.setRepliedThreads(replied_threads.length);
     parrot_div.classList.remove('parrots-appear');
     start_replies.classList.remove('big-button-animation')
     return listening();
   });

   log_out.addEventListener('click', function() {
     console.log('logout');
     api.logout();
     return listening();
   });

 });
}
