/* Author: Red Pill Web Masons */

// Editor-specific
if ($('title').text().indexOf('Edit') === 0) {
  var doc = $('#server_values').data('doc')
    , editor = new EpicEditor({
        clientSideStorage: false
      , useNativeFullscreen: false
      , file: {
          autoSave: 1000
        , defaultContent: doc.contents
        }
  }).load();
  console.log('doc is', doc);
  editor
    .enterFullscreen()
    .focus()
    .on('autosave', function(contents) {
      console.log('autosaving:', contents);
      $.post(
        '/update/' + doc.title
      , { contents: contents.content }
      , { always: function(response) {
            console.log('update response:', response);
          }
        }
      );
    });
}
else {
  console.log('Not on Edit page, so not running edit code!');
}