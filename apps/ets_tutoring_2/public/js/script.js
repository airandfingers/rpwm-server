/* Author:
Red Pill Web Masons (2013)
*/

// Header dropdown
$('.dropdown-toggle').dropdown();

// SES Schools page nav
$('.nav-pills li a').click(function (e) {
	e.preventDefault();
	window.location.hash = $(this).attr('href');
	$(this).tab('show');
});
// SES Schools page nav hash
$(document).ready(function() {
	var hash = window.location.hash;
	if (hash) {
		$('.nav-pills li a[href="' + hash + '"]').tab('show');
	}
});

//lightbox
$('a.lightbox').click(function(e) {
  //hide scrollbars!
  $('body').css('overflow-y', 'hidden');

  $('<div id="overlay"></div>')
    .css('top', $(document).scrollTop())
    .css('opacity', '0')
    .animate({'opacity': '0.5'}, 'slow')
    .appendTo('body');

  $('<div id="lightbox"></div>')
    .hide()
    .appendTo('body');

  $('<img />')
    .attr('src', $(this).attr('href'))
    .load(function() {
      positionLightboxImage();
    })
    .click(function() {
      removeLightbox();
    })
    .appendTo('#lightbox');

  return false;
});

function positionLightboxImage() {
  var top = ($(window).height() - $('#lightbox').height()) / 2;
  var left = ($(window).width() - $('#lightbox').width()) / 2 ;
  $('#lightbox')
    .css({
      'top': top + $(document).scrollTop(),
      'left': left
    })
    .fadeIn();
}

function removeLightbox() {
  $('#overlay, #lightbox')
    .fadeOut('slow', function() {
      $(this).remove();
      $('body').css('overflow-y', 'auto'); //show scrollbars
    });
}