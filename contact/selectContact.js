define([
		'butterfly/view',
		'butterfly',
		'iscroll',
		'contact/imageSet',
		'contact/js/recentlyChatArr',
		'dialog'
	],
	function(View, Butterfly, IScroll, imageSet, RecentlyChats, Dialog) {
	return View.extend({
		events: {
			"click .back": "goBack",
			"click .index_list":"contactHRD",
			"click .contact_ul li": "selectContact",
			"click .complete": "complete"
		},
		myId: null,
		onShow: function(options) {
			var me = this;
			me.from = options.from;
			var im = navigator.chameleonIM;
			me.myId = im._currentUser;
			me.unitContact();

			me.unitRecentContact();
			View.prototype.onShow.apply(this, arguments);
		},
		//初始化IScroll
		initScroll: function(){
			var me = this;
			var wrapper = me.$el.find(".content")[0];
			me.myScroll = new IScroll(wrapper,{
				mouseWheel: true,
				scrollX: false,
				probeType: 1,
				scrollY: true,
				lockDirection: true,
			});
			me.myScroll.refresh();
		},
		//初始化联系人列表
		unitContact:function(){
			var me = this;
			if(typeof cordova == "undefined"){
				return;
			}
			var im = navigator.chameleonIM;
			im.getMyFriends(function(r){
				if(r.code == 200){
					var template = _.template(me.$("#select_contact").html(),{"arr":r.msg, "myId":me.myId});
					me.$el.find(".contact_ul").html(template);
				}
				me.initScroll();
			});
		},

		//初始化最近联系人
		unitRecentContact: function(){
			var me = this;
		},

		contactHRD:function(el){
			var me = this;
			var currentTarget = $(el.currentTarget);
			if(currentTarget.hasClass('hide')){
				currentTarget.removeClass('hide');
				currentTarget.find('.index_list_icon').css({
					"-webkit-transform":"rotate(0deg)"
				});
				currentTarget.siblings('.index_list_info').css('display','block');
			}else{
				currentTarget.addClass('hide');
				currentTarget.find('.index_list_icon').css({
					"-webkit-transform":"rotate(-90deg)"
				});
				currentTarget.siblings('.index_list_info').css('display','none');
			}
			me.myScroll.refresh();
		},
		selectContact: function(el){
			var me = this;
			var selectSpan = $(el.currentTarget).children(".checkBox_select");
			//该人已经被选择
			if(selectSpan.hasClass("selected")){
				return;
			}

			if(selectSpan.hasClass("selecting")){
				selectSpan.removeClass("selecting");
			}else{
				selectSpan.addClass("selecting");
			}

			//判断是否选人
			var count = me.$el.find(".contact_ul .selecting").length;


			if(count>0){
				if(me.$el.find(".complete").hasClass("uncomplete")){
					me.$el.find(".complete").removeClass("uncomplete");
				}
				if(count>1){
					me.$el.find(".complete span").html("完成("+count+")");
				}else{
					me.$el.find(".complete span").html("完成");
				}
			}else{
				me.$el.find(".complete").addClass("uncomplete");
				me.$el.find(".complete span").html("完成");
			}
		},
		complete: function(el){
			var me = this;
			var e = $(el.currentTarget);
			if(e.hasClass("uncomplete")){
				return;
			}else{
				alert("完成");
			}
		}


	}); //view define
});
