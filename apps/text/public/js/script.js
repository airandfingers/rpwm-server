/* Author: Red Pill Web Masons */

var editor = new EpicEditor({
  clientSideStorage: false
, file: {
    autoSave: 1000
  }
}).load();

editor.on('autosave', function(contents) {
  console.log('autosaving:', contents);
  $.post('/save', { contents: contents });
});