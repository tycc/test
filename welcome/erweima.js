define([
		'butterfly/view',
		'butterfly',
		'notification'
	],
	function(View, Butterfly, Footer, Notification) {
	return View.extend({
		events: {
			"click .back" : "goBack"
		},
		render: function(){
		},
		onShow: function() {
		}
	}); //view define
});
