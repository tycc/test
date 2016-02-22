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
			"click .minefooter":"generateerweima"
		},
		render: function(){
		},
		onShow: function(options) {
			
                var me = this,
                    footerFrom = "迎新";

                me.loadFooter(footerFrom); //加载底部导航栏
		}, //加载底部导航栏
            loadFooter: function(footerFrom) {
                var footer = new Footer({
                    'from': footerFrom
                });
                this.$el.find('.content').append(footer.$el);
            },
		generateerweima:function(){
			butterfly.navigate("welcome/erweima.html")
		}
	}); //view define
});
