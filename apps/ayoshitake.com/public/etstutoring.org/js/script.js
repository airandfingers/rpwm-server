/* Author:
Red Pill Web Masons (2012)
*/
$('.dropdown-toggle').dropdown();
$('.nav-pills li a').click(function (e) {
	e.preventDefault();
	window.location.hash = $(this).attr('href');
	$(this).tab('show');
});
$(document).ready(function() {
	var hash = window.location.hash;
	if (hash) {
		$('.nav-pills li a[href="' + hash + '"]').tab('show');
	}
});