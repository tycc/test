define([
		'butterfly/view',
		"spin",
		'butterfly',
		'notification',
		'dialog'
	],
	function(View, Spinner, Butterfly, Notification, Dialog) {
		return View.extend({
			events: {
				"click .back": "goBack",
				"click #login-button": "onLogin",
				"keyup": "enterLogin",
			},
			onShow: function() {

				this.onLogin()
			},
			//用回车键响应登录
			enterLogin: function(event) {
				var me = this;
				if (event.keyCode == 13) {
					me.onLogin()
				}
			},
			onLogin: function() {

				var me = this,
					userId = me.$el.find('#username')[0].value;
				if (!userId) {
					Notification.show({
						type: "error",
						message: "请输入帐号"
					});
					return;
				}
				window.localStorage['username'] = userId;
				butterfly.navigate("mine/mineIndex.html");
			},
		}); //view define
	});
