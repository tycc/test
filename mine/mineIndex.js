define([
		'butterfly/view',
		'butterfly',
		'main/footer',
		'notification'
	],
	function(View, Butterfly, Footer, Notification) {
	return View.extend({
		events: {
			"click #btn":"goPhone",
			"click #exit":"exit",
			"click #point":"goPoint",
			"click .set":"goPay"
		},
		render: function(){
		},
		onShow: function(options) {
			// View.prototype.onShow.apply(this, arguments);
			var me = this,
				footerFrom = "我";
			me.loadFooter(footerFrom);//加载底部导航栏
			//判断当前用户状态
			var username = window.localStorage['username'];
			if(username && username != "" && username != null){
				this.$("#exit").text("退出");
				this.$("#exit").removeClass("login");
				this.$("#exit").addClass("exit");
			}else{
				this.$("#exit").text("登陆");
				this.$("#exit").removeClass("exit");
				this.$("#exit").addClass("login");
			}
		},
		goPoint: function(){
			butterfly.navigate("mine/myPoint.html");
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
			var username = window.localStorage['username'];
			window.sessionStorage.removeItem("signUp");
			window.sessionStorage.removeItem("payTution");
			window.sessionStorage.removeItem("applyCard");
			if(username && username != "" && username != null){//退出
				window.localStorage['username'] = "";
				this.$("#exit").text("登陆");
				this.$("#exit").removeClass("exit");
				this.$("#exit").addClass("login");
				window.location.reload();
			}else{
				butterfly.navigate("login/login.html");
			}
		},
		goPay:function(){
			butterfly.navigate("welcome/methodOfPay.html");
		}
	}); //view define
});
