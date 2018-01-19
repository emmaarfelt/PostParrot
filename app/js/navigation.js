
window.addEventListener('hashchange', routePage);

function routePage() {
  var pageName = (window.location.hash) ? window.location.hash : "#login";
  $('div.pages').hide(); // Hide all pages
  $(pageName).show();    // Show the current page
}

var menu_toggle = document.getElementById('menu-toggle');
menu.addEventListener('click', function() {
  menu_toggle.checked = false;
});
