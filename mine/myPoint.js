define([
		'butterfly/view',
		'butterfly',
		'main/footer',
		'notification'
	],
	function(View, Butterfly, Footer, Notification) {
	return View.extend({
		events: {
			"click .back" : "goBack",
		},
		render: function(){
		},
		onShow: function(options) {
			// View.prototype.onShow.apply(this, arguments);
			var me = this,
				footerFrom = "我";
			me.loadFooter(footerFrom);//加载底部导航栏
		},

		//加载底部导航栏
		loadFooter: function(footerFrom){
			var footer = new Footer({
					'from': footerFrom
				});
			this.$el.find('.content').append(footer.$el);
		},
		goPhone:function(){
			butterfly.navigate("welcome/bindPhone.html");
		},
		exit: function(){
			window.localStorage['username'] = "";
			butterfly.navigate("login/login.html");
		}
	}); //view define
});
