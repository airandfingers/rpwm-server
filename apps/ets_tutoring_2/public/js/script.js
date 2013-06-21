/* Author:
Red Pill Web Masons (2012)
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