const fs = require("fs");
const login = require("facebook-chat-api");
const ArrayList = require ("arraylist");

var replied_threads = new ArrayList;

var login_start = document.querySelector('div.big-button button[name="starter-button"]');
login_start.addEventListener('click', function () {
  var creds = getCredentials();
  switch(creds) {
    case 'APP-STATE':
      login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
        if(err) return console.error(err);
        api.setOptions({selfListen: true})
        startReply(api);
      });
      break;
    case 'NEED-LOGIN':
      window.location.hash = '#login';
      break;
  }
});

function getCredentials() {
  var appstate = fs.existsSync('./appstate.json');
  if(appstate) { return 'APP-STATE';} else {return 'NEED-LOGIN';}
}

function startReply(api) {
    var ownUserID = api.getCurrentUserID();
    var reply = fs.readFileSync('./app/resources/reply_text.txt', 'utf8', function(err, data) {
                  if (err) throw err;
                  return data;
                });

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
           if (!message.isGroup) {
             api.sendMessage(reply, message.threadID);
             replied_threads.add(message.threadID);
             console.info("Thread id:"+message.threadID);
             console.info(replied_threads.lenght);
             console.info("I've just responded to a message");
           } else {
             console.info("Recieved a group message - ignoring");
           }
       }
     } else {console.info("Already auto-replied in this thread");}
    });
}
