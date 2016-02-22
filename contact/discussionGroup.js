/**
 * Created by Tangailing on 2015/10/12.
 */
define([
		'butterfly/view',
		'butterfly'
	],
	function(View, Butterfly) {
	return View.extend({
		events: {
			"click .back": "goBack",
			"click .group_member_title": "goDetail"
		},
		onShow: function() {
			var me = this;
			$.ajax({
				url: '../contact/data/myGroupMember.json',
				success: function(data){
					if ((typeof data) === "string") {
						me._datas = JSON.parse(data);
					}
					
					me.displayImfor();
				}
			});
		},
		displayImfor: function(){
			var me = this;
			var numContainer = me.$el.find(".group_member_title .title_right>span");
			/*var numTemp = me.$el.find("#group-number-template");
			var temp = _.template(numTemp.html());*/
			var nameString = null;
			nameString = me._datas.data[0].name+"、"+me._datas.data[1].name+"、"+me._datas.data[2].name;			
			// numContainer.append(temp({strName:nameString}));
			numContainer.text(nameString);

			var container = me.$el.find(".group_head_image");
			container.empty();
			var headTemplate = me.$el.find("#head-template");
			var template =_.template(headTemplate.html());
			for (var i = 0; i < me._datas.data.length; i++) {
				container.append(template(me._datas.data[i]));
			};
			container.append("<div><img src='../contact/image/add_icon.png'><div style='color:#1697e3;font-size:12px;margin-top:5px'>邀请</div></div>")
		},
		goDetail: function(el){
			var me = this;
			var currentTarget = $(el.currentTarget);
			var groupName = currentTarget.find(".title_right>span").text();
			butterfly.navigate("contact/modifyName.html",{groupName: groupName});
		}
	});
});