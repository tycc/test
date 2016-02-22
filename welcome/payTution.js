define([
		'butterfly/view',
		'butterfly',
		'main/footer',
		'notification'
	],
	function(View, Butterfly, Footer, Notification) {
	return View.extend({
		events: {
			"click .back" :"goBack",
			"click .pay-item" : "itemClick",
			"click #surePay" : "surePay"
		},
		render: function(){
		},
		onShow: function(options) {
		},
		itemClick: function(e){//item点击
			var me = this,
				$target = me.$(e.currentTarget);
			_.each(me.$(".pay-item"), function(item){
				var box = me.$(item).find(".box");
				if($(item).attr("type") == $target.attr("type")){
					box.removeClass('unchoose');
					box.addClass('choose');
				}else{
					box.removeClass('choose');
					box.addClass('unchoose');
				}
			});
		},
		surePay: function(){
			//点击缴费，设置session，方便修改首页流程样式
            window.sessionStorage['payTution'] = true;
			butterfly.navigate("welcome/welcomeIndex.html");
		}
	}); //view define
});
