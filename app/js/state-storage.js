const path = require('path');
const fs = require("fs");
const Store = require('electron-store');
const loginstore = new Store({
  name: 'login'
});

var appstate = loginstore.get('appState');

/* Get settings from other files */
var methods = {
	get: function(name) {
    return loginstore.get(name);
  },
  set: function(name, value) {
    loginstore.set(name, value);
  },
  clear: function() {
    return loginstore.clear();
  },
  getLoginstore: function() {
    return loginstore;
  },
  path: function() {
    return loginstore.path;
  }
};
module.exports = methods;
