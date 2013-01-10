/* Author:
  Red Pill Web Masons (2012.3.9)
*/
var $form,
    $received_text = $('<span></span>')
      .attr('id', 'received')
      .text('Your wish has been... received.'),
    $another_wish = $('<input></input>')
      .attr('id', 'wish_again')
      .attr('type', 'submit')
      .val('Make another wish')
      .click(function() {
        resetPage($(this), $received_text, $form
      )});

$('#wish_form').submit(function (e) {
  var wish = $(this).children('#wish').val();
  $('<img />')
    .attr('src', '/img/inside_well.jpg');
  $.post('/wish', {wish: wish}, function (data) {
    fadeToImage($('html'), '/img/inside_well.jpg');
    $('#wish_form').fadeOut(function () {
      $form = $(this)
        .after($received_text, $another_wish.show())
      $received_text
        .fadeOut(0)
        .fadeIn('slow');
    });
  });
  return false;
});

function resetPage($button, $text, $form) {
  fadeToImage($('html'), '/img/well.jpg');
  $button.fadeOut();
  $text
    .fadeOut()
    .promise()
    .done(function() {
      $form.fadeIn('slow');
    });
};

function fadeToImage($target, url) {
  $target.fadeOut(function () {
      $(this)
        .css('background-image', 'url("'+url+'")');
      $(this).fadeIn('slow');
    });
};