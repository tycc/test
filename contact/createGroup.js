define([
		'butterfly/view',
		'butterfly',
		'notification'
	],
	function(View, Butterfly, Notification) {
	return View.extend({
		events: {
			"click .back": "goBack",
			"click .create": "createGroup"
		},
		onShow: function(options) {
			this.inputLimit();
			View.prototype.onShow.apply(this, arguments);
		},
		createGroup:function() {
			var me = this;
			var im = navigator.chameleonIM;
			var groupName = me.$el.find('.groupName').val();
			var groupDescribe = me.$el.find('.groupDescribe').val();
			if(groupName.length<2){
				Notification.show({
	                type: "error",
	                message: '群名称不少于2字',
	            });
	            me.$el.find('.groupName').focus();
	            return;
			}
			var args;
			if(groupDescribe == ""){
				args = {
					name:groupName,
					type:3
				};
			}else{
				args = {
					name:groupName,
					type:3,
					des:groupDescribe
				}
			}
			// name":"计算机学院","img":"../contact/image/groupicon.png
			var newItem = {};
			newItem.name = groupName;
			newItem.img = "../contact/image/groupicon.png";
			var newIndex_group = new Array();
			var index_group = window.localStorage['index_group'];
			if(index_group){
				index_group = JSON.parse(index_group);
				_.each(index_group,function(item){
					newIndex_group.push(item);
				});
				newIndex_group.push(newItem);
			}
			window.localStorage['index_group'] = JSON.stringify(newIndex_group);
			Notification.show({
	                type: "info",
	                message: '添加成功',
	           });
			window.history.go(-1);
			// im.createGroup(args,function(result){
			//     // result.code=200;
			//     // result.msg;//创建成功后的群id
			//     if (result.code == 200) {
			//     	alert("ok");
			//     	butterfly.navigate('contact/groupImfor.html');
			//     };
			//     butterfly.navigate('contact/groupImfor.html');
			// })
		},
		//输入框的字数限制
		inputLimit:function() {
			var me = this;
			me.$el.find('.groupName').bind('input prototypechange', function() {
				var length = $(this).val().length;
				me.$el.find('.nameLength>b').text(length);
				if(length>32){
					var newVal = $(this).val().substring(0,32);
					$(this).val(newVal);
					me.$el.find('.nameLength>b').text(32);
				}
				
			});
			me.$el.find('.groupDescribe').bind('input prototypechange', function() {
				var describeH = me.$el.find('.groupDescribe').height();
				var describeScrollH = me.$el.find('.groupDescribe')[0].scrollHeight;
				if (describeH+20 < describeScrollH) {
					me.$el.find('.groupDescribe').height(describeScrollH - 18);
				}

				var length = $(this).val().length;
				me.$el.find('.describeLength>b').text(length);
				if(length>=256){
					var newVal = $(this).val().substring(0,256);
					$(this).val(newVal);
					me.$el.find('.describeLength>b').text(256);
				}
			});
		},
	}); //view define
});