define([
		'butterfly/view',
		'butterfly',
		'listview/ListView',
		'listview/DataSource',
		'dialog'
	],
	function(View, Butterfly, ListView, DataSource, Dialog) {
	return View.extend({
		events: {
			"click .back": "goBack",
			"click .delete": "delete",
			"click .deleteMember": "deleteMemberDialog",
			// "touchstart .memberList>li": "touchstart",
			// "touchmove .memberList>li": "touchmove",
		},
		onShow: function(options) {
			var me = this;
			
			me._initListView();

			View.prototype.onShow.apply(this, arguments);
			
		},
		loadData: function() {
			var me = this;
			me.datasource = new DataSource({
				storage: 'session',
				identifier: 'member-list',
				url: '../im/manageMember.json',
				pageParam: 'pageIndex'
			});
		},
		_initListView: function() {
			var me = this;
			me.loadData();
			var listEl = this.el.querySelector("#groupMember-list");
			var template = _.template(this.$("#groupMember-template").html());
			me.listview = new ListView({
				id: 'groupMember',
				el: listEl,
				autoLoad: 'true',
				itemTemplate: template,
				dataSource: me.datasource,
				requestParams: {
					isSimpleList: 0,
				}
			});
			me.listview.IScroll.scrollTo(0, 0, 0, false);
			this.listenTo(this.listview, 'itemSelect', this.onItemSelect);
			
		},
		onItemSelect: function(listview, item, index, event) {
			if(event.toElement.className == "letter") return;
		},
		delete:function(e) {
			var me = this;
			var el = me.$(e.currentTarget);
			var state = el.attr("data-state");
			if(state == "delete"){
				me.$el.find(".deleteMember").css("display","inline-block");
				el.attr("data-state","ok");
				el.children("span").text("完成");
			}else{
				me.$el.find(".deleteMember").css("display","none");
				el.attr("data-state","delete");
				el.children("span").text("删除");
			}
		},
		deleteMemberDialog:function(e) {
			var me = this;
			Dialog.createDialog({
				closeBtn: false,
				buttons: {
					'取消': function() {
						this.close();
					},
					'确定': function() {
						me.deleteMember();
						this.close();
					}
				},
				content: "确定要将该用户从本群中移除？",
				title: '删除群成员'
			});
		},
		deleteMember:function(){

		},
		//滑动成员时显示删除图标
		touchstart: function(e){
			var me = this;
			var touche = e.originalEvent.changedTouches[0];
			me.baseX = touche.pageX;
			me.baseY = touche.pageY;
		},
		touchmove: function(e){
			var me = this;
			var el = $(e.currentTarget);
			var touche = e.originalEvent.changedTouches[0];
			var toucheX = touche.pageX - me.baseX;
			var toucheY = touche.pageY - me.baseY;
			me.baseX = touche.pageX;
			me.baseY = touche.pageY;
			var liLeft = parseInt(el.css("margin-left"));
			el.css("margin-left",(liLeft+toucheX)+"px");

		},
	});
});