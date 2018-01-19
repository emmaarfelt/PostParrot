window.addEventListener('hashchange', routePage);

function routePage() {
  var pageName = (window.location.hash) ? window.location.hash : "#";
  var showPage = document.getElementById(pageName.split('#')[1]);
  var allPages = document.querySelectorAll('div.pages');
  for(var i=0; i<allPages.length;i++) {
    allPages[i].style.display = 'none';
  }
  showPage.style.display = 'block';
}

var menu_toggle = document.getElementById('menu-toggle');
menu.addEventListener('click', function() {
  menu_toggle.checked = false;
});
