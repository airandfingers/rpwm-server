// Navbar Menu functionality
$(function() {  
  $('.navbar li ul').css({
    display: 'none',
    left: 'auto'
  });

  $('.navbar li').hoverIntent(function() {
    $(this)
      .find('ul')
      .stop(true, true)
      .slideDown('fast');

  }, function() {
    $(this)
      .find('ul')
      .stop(true, true)
      .fadeOut('fast');
  });
});

// Hide/Show Login/Register functionality
$(function() {
  var $login_register_trigger = $('#login_register_trigger')
    , $login_register_dropdown = $('#login_register');
  if ($login_register_trigger.length > 0) {
    $login_register_trigger.click(function() {
      toggleDropdown($login_register_trigger, $login_register_dropdown,
                     { toggle_args: ['slide', { direction: 'up' }, 400] });
    });
  }
});

$(function() {
  var $guest_convert_trigger = $('#guest_convert_trigger')
    , $guest_convert_dropdown = $('#guest_convert');
  if ($guest_convert_trigger.length > 0) {
    $guest_convert_trigger.click(function() {
      toggleDropdown($guest_convert_trigger, $guest_convert_dropdown,
                     { toggle_args: ['slide', { direction: 'up' }, 400] });
    });
  }
});

function toggleDropdown($trigger, $dropdown, options) {
  console.log('toggleDropdown called with', $trigger, $dropdown);
  //console.log('$dropdown\'s top and left are', $dropdown.position().top, $dropdown.position().left);
  
  // calculate and set position of $dropdown
  var left = (typeof options.left !== 'undefined') ? options.left : calculateLeft($trigger, $dropdown)
    , top = (typeof options.top !== 'undefined') ? options.top : calculateTop($trigger)
    , toggle_args = options.toggle_args || ['fade'];
  console.log('setting dropdown position to', {left: left, top:top });
  $dropdown.css({
    left: left
  , top: top
  });

  // show or hide dropdown
  $dropdown.stop(true, true)
           .toggle.apply($dropdown, toggle_args);
}

function calculateLeft($trigger, $dropdown) {
  // calculate trigger's left and maximum left
  var trigger_left = $trigger.offset().left
    , max_left = $(window).width() - $dropdown.outerWidth(true) - 1 // workaround
  // return whichever is less
    , left = trigger_left < max_left ? trigger_left : max_left;
  return left;
}

function calculateTop($trigger) {
  // return vertical position of $trigger's bottom
  console.log($trigger.position().top, $trigger.outerHeight(true));
  return $trigger.position().top + $trigger.outerHeight(true);
}

// jQuery Validate functionality
$.validator.setDefaults({
  messages: {
    password_confirm: {
      equalTo: 'Password fields must match.'
    }
  }
});

$(function() {
  $('form[action="/register"]').validate();
  $('form[action="/login"]').validate();
});