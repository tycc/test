/**
 * Created by Tangailing on 2015/10/15.
 */
 define([
		'butterfly/view',
		'butterfly'
	],
	function(View, Butterfly) {
	return View.extend({
		events:{
			"click .back":"goBack"
		},
		onShow: function(options){
			var me = this;
			if (options) {				
				var descripe = options.groupDescripe;
				var inputNode = me.$el.find(".modify-describe")
				inputNode.val(descripe);
				inputNode.focus();
			}
			me.inputLimit();
			View.prototype.onShow.apply(this, arguments);
		},
		//输入框的字数限制
		inputLimit:function() {
			var me = this;
			var startLength = me.$el.find('.modify-describe').val().length;
			me.$el.find('.describeLength>b').text(startLength);
			me.$el.find('.modify-describe').bind('input prototypechange', function() {
				var length = $(this).val().length;
				me.$el.find('.describeLength>b').text(length);
				if(length>=256){
					var newVal = $(this).val().substring(0,256);
					$(this).val(newVal);
					me.$el.find('.describeLength>b').text(256);
				}
			});
		},
	});
});