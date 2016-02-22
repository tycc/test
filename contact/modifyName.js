/**
 * Created by Tangailing on 2015/10/15.
 */
 define([
		'butterfly/view',
		'butterfly',
		'notification'
	],
	function(View, Butterfly, Notification) {
	return View.extend({
		events:{
			"click .back": "goBack",
			"click .complete": "submit"
		},
		onShow: function(options){
			var me = this;
			if (options) {				
				var name = options.groupName;
				var inputNode = me.$el.find(".modify-name")
				inputNode.val(name);	
				inputNode.focus();
			}
			me.inputLimit();
			View.prototype.onShow.apply(this, arguments);
		},
		//输入框的字数限制
		inputLimit:function() {
			var me = this;
			var startLength = me.$el.find('.modify-name').val().length;
			me.$el.find('.describeLength>b').text(startLength);
			me.$el.find('.modify-name').bind('input prototypechange', function() {
				var length = $(this).val().length;
				me.$el.find('.describeLength>b').text(length);
				if(length>=32){
					var newVal = $(this).val().substring(0,32);
					$(this).val(newVal);
					me.$el.find('.describeLength>b').text(32);
				}
			});
		},
		submit: function(){
			var me = this;
			if(me.$el.find('.modify-name').val().length<2){
				Notification.show({
	                type: "error",
	                message: '群名称不少于2字',
	            });
	            me.$el.find('.modify-name').focus();
	            return;
			}
			alert("提交修改");
		},
	});
});