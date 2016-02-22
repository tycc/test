define([
		'text!main/footer.html',
		'butterfly/view',
		'butterfly',
		"css!main/footer"
	],
	function(viewTemplate,View,Butterfly) {
	return View.extend({
		id: 'main-footer',
			events: {
				"click .FooterModule": "gotoFooterModule",//进入页脚模块
			},
			//初始化footer
			initialize: function(options) {
				var  me = this;
				this.render();
				this.from = options.from;
				this.uiFooter();
			},
			uiSetPopoverRight: function() {
				var footerWidth = $('#main-footer').width();

				if (footerWidth < 400) {
					var popoverRight = footerWidth / 8 - 42;
				} else if (footerWidth >= 400 && footerWidth < 540) {
					var popoverRight = footerWidth / 8 - 44;
				} else {
					var popoverRight = footerWidth / 8 - 46;
				}

				this.$el.find('#popover').css('right', popoverRight + 'px');

			},
			render: function() {
				$(this.el).html(viewTemplate);
				View.prototype.render.call(this);
				var me = this;
				// if (typeof cordova !== "undefined") {
				// 	if (device && device.platform == 'iOS') {
				// 		me.$el.find(".quit").css("display", "none");
				// 		me.$el.find(".toolsrecommend").css("display", "none");
				// 	}
				// }
				return this;
			},
			onShow: function() {
				var me = this;
			},
			//更改指定模块的UI（样式）
			uiFooter: function() {
				var me = this;
				if (me.from) {
					var arr = me.$el.find('.footerName');
					_.map(arr, function(listitem) {
						if ($(listitem).text().trim() === me.from) {
							$(listitem).parent().find('.detailicon').addClass('footerActive');
							$(listitem).css({
								'color': '#19f1cb'
							});
						}
					})
				}

			},
			//进入页脚模块
			gotoFooterModule: function(el) {
				var me = this;
				$target = $(el.currentTarget);
				var url = $target.attr("data-navigator"),
					username = window.localStorage['username'];
				if(url == "welcome/welcomeIndex.html" && username &&
					username != "" && username != null){
					butterfly.navigate("welcome/searchStudent.html",{effect:"null"});
				}else{
					butterfly.navigate(url,{effect:"null"});
				}
			},
	}); //view define
});
