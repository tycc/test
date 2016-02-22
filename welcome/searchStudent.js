define([
	'butterfly/view',
	'butterfly',
	'main/footer',
	'iscroll'
	],
	function(View,Butterfly,Footer,IScroll){
		return View.extend({
			events:{
				"click .ul li":"goDetail"
			},
			render:function(){
			},
            onShow: function() {
                var me = this,
                    footerFrom = "迎新";

                me.loadFooter(footerFrom); //加载底部导航栏
            },
            goDetail:function(){
            	butterfly.navigate("welcome/studentInfo.html")
            },
              loadFooter: function(footerFrom) {
                var footer = new Footer({
                    'from': footerFrom
                });
                this.$el.find('.content').append(footer.$el);
            },
		})
	})
