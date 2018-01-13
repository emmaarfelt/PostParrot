const fs = require("fs");
const fbm = require ("facebook-chat-api");
const ArrayList = require ("arraylist");
var myUserID;
var whitelist = new ArrayList;
var credentials = JSON.parse(fs.readFileSync("credentials.json"));
var settings = JSON.parse(fs.readFileSync('./app/resources/settings.json', 'utf8'));


fbm( credentials, { forceLogin: true }, (err, api) => {
  if(err) {
    switch (err.error) {
        case 'login-approval':
            console.log('Enter code > ');
            rl.on('line', (line) => {
                err.continue(line);
                rl.close();
            });
            break;
        default:
            console.error(err);
    }
    return;
  }

  myUserID = api.getCurrentUserID()
  api.setOptions({selfListen: true})

  api.listen((err, message) => {
    if (message.senderID == myUserID) {
      // This message was sent by you!
      if (message.body == "/stop") {
        if (!whitelist.contains(message.threadID)) {
          whitelist.add(message.threadID);
          api.sendMessage("<autoreplies are disabled>", message.threadID);
        } else {
          api.sendMessage("<autoreplies were already disabled for this thread>", message.threadID);
        }
      }
      if (message.body == "/resume") {
        if (whitelist.contains(message.threadID)) {
          api.sendMessage("<autoreplies are resumed>", message.threadID);
          whitelist.removeElement(message.threadID);
        } else {
          api.sendMessage("<autoreplies are enabled for this thread>", message.threadID);
        }
      }
    } else {
      if (whitelist.contains(message.threadID)){
        console.log("Recieved message from whitelisted thread");
      } else {
        if (!message.isGroup) {
          api.sendMessage("Hej! Jeg er kun på Facebook mellem 20-21, og vil derfor først se din besked der. Hvis det haster, kan du ringe eller smide en SMS. //Emma's ChatBot", message.threadID);
          console.info("I've just responded to a message");
        } else {
          console.info("Recieved a group message - ignoring");
        }
      }
    }
  });
});
