/* Author: Red Pill Web Masons */

var editor = new EpicEditor({
  clientSideStorage: false
, useNativeFullscreen: false
, file: {
    autoSave: 1000
  , defaultContent: '#EpicEditor\nThis is some default content. Go ahead, _change me_.'
  }
}).load();

editor
  .enterFullscreen()
  .focus()
  .on('autosave', function(contents) {
    console.log('autosaving:', contents);
    $.post('/save', { contents: contents });
  });