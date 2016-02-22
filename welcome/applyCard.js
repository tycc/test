define([
		'butterfly/view',
		'butterfly',
		'notification'
	],
	function(View, Butterfly, Notification) {
	return View.extend({
		events: {
			"click .back" : "goBack",
			"click #submitApply" :"submitApply"
		},
		render: function(){
		},
		onShow: function() {
		},
		submitApply: function(){
			var backNumber = this.$("#bankNumber").val();
			if(backNumber == ""){
				Notification.show({
					type:"error",
					message:"请输入银行卡号"
				});
				return;
			}
			window.sessionStorage['applyCard'] = true;
			butterfly.navigate("welcome/welcomeIndex.html");
		}
	}); //view define
});
