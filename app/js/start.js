const fs = require("fs");
const login = require("facebook-chat-api");
const ArrayList = require ("arraylist");
var replied_threads = new ArrayList;

const settings = require('./settings.js');
var IGNORE_GROUPCHAT = settings.getsettingstatus('ignore-group-messages');
var REPLY_MENTIONS = settings.getsettingstatus('reply-groupchat-mentions');

var reply = fs.readFileSync('./app/resources/reply_text.txt', 'utf8', function(err, data) {
              if (err) throw err;
              if (data == "") {
                return "Hi! This is an auto-reply";
              } else { return data;}
});

var start_replies = document.querySelector('div.big-button button[name="starter-button"]');
start_replies.addEventListener('click', function () {
  startReply();

  /* Parrot animation */
  start_replies.style.transform = 'scale(0.0, 0.0)';
  start_replies.style.opacity = '0.0';

  var parrot_div = document.querySelector('div.parrots');
  parrot_div.style.display = 'inline';

  var parrot_container = document.querySelector('div.parrot-container');
  parrot_container.classList.add('parrot-animation');
});

function startReply() {
  login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    var ownUserID = api.getCurrentUserID();

    api.listen((err, message) => {
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
             if(IGNORE_GROUPCHAT) {
               if (!message.isGroup) {
                 api.sendMessage(reply, message.threadID);
                 replied_threads.add(message.threadID);
                 console.info("I've just responded to a message");
               } else {
                 console.info("Recieved a group message - ignoring");
               }
             } else if(REPLY_MENTIONS) {
               var mentions = message.mentions;

               if(!mentions == null) {
                 if(mentions.contains(ownUserID)) {
                   api.sendMessage(reply, message.threadID);
                   replied_threads.add(message.threadID);
                 }
               }

             } else {
              api.sendMessage(reply, message.threadID);
              replied_threads.add(message.threadID);
              console.info("Thread id:"+message.threadID);
              console.info(replied_threads.lenght);
              console.info("I've just responded to a message");
            }
          }
     } else {console.info("Already auto-replied in this thread");}
   });
  });
}
