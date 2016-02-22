define([
		'butterfly/view',
		'butterfly',
		'main/footer',
		'notification'
	],
	function(View, Butterfly, Footer, Notification) {
		return View.extend({
			events: {
				 "click button":"goBack",
				 "click .goPay" :"goPay"
			},
			render: function() {},
			onShow: function() {},
			goPay: function(){
				butterfly.navigate("welcome/payTution.html");
			}

		}); //view define
	});
