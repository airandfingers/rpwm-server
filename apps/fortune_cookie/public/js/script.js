/* Author:
  Red Pill Web Masons (2012.3.9)
*/
onFortuneCookiePage = function(id) {
  return (id.split('_')[0] === 'my')
};

endEditing = function(settings) {
  $('[name=' + settings.name + ']')
    .hide();
  $(this)
    .unbind(settings.event)
    .fadeIn('fast');
};

$(document).ready(function() {
  var new_value_name = 'new_fortune';
  $('.fortune').editable(function(new_fortune, settings) {
    var old_fortune = this.revert
      , this_id = $(this).attr('id')
      , message_to_show = new_fortune;
    /*console.log(new_fortune, settings, $(this),
                old_fortune, $('[name='+new_value_name+']'));*/
    if (old_fortune !== new_fortune) {
      if (onFortuneCookiePage(this_id)) {
        $('[name='+new_value_name+']')
        .hide();
        $(this)
          .unbind(settings.event)
          .fadeIn(5000);
        message_to_show = "You have changed your fortune.";
      }
      else {
        endEditing(settings);
      }
      //POST the new fortune to change_fortune
      $.post('change_fortune', {id: this_id, new_fortune: new_fortune})
        .success(function (response) {
          //console.log('response: ' + response);
        })
        .error(function (error) {
          console.log(error.status + ' error: ' + error.responseText);
        });
    }
    else
      endEditing(settings);
    return message_to_show;
  }, {
    indicator: "Saving...",
    tooltip: "Change this fortune...",
    name: new_value_name
  });
});