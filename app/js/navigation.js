$(window).on('hashchange', routePage);

function routePage() {
  var pageName = (window.location.hash) ? window.location.hash : "#login";
  $('div.pages').hide(); // Hide all pages
  $(pageName).show();    // Show the current page

  /* switch for page specific functions, not used now */
  switch(pageName) {
    case '#login':
      break;
    case '#settings':
      break;
    case '#parrots':
      break;
    case '#starter':
      break;
  }
}
