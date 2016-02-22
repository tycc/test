/**
 * Created by Tangailing on 2015/10/10.
 */
define([
		'butterfly/view',
		'butterfly',
		'contact/js/enlargeImg',
	],
	function(View, Butterfly, EnlargeImg) {
	return View.extend({
		events:{
			"click .back": "goBack",
			"click .swich-equiment":"changeGroupState",
			"click .pargram-li": "goDetail",
			"click .icon_modify": "modifyHeadImg",
			"click .ceng": "deleteCeng",
			"click .modify-head-img": "goModifyHeadImg",
			"click .head_image": "showBigPicture",
			"click .manageGroup": "manageGroup",
			"click .group-description": "goDetail",
			"click .addContact": "selectContact"
		},
		onShow: function(options) {
			var me = this;
			me.from = options.from;
			me._groupName = "工作交流群";
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
		changeGroupState: function(){
			var me = this;
			me.$el.find(".swich-equiment-component").animate({'margin-left':'21px'},200);
            me.$el.find(".swich-equiment").css("background-color","#c3c3c3");
		},
		displayImfor: function(){
			var me = this;
			var numContainer = me.$el.find(".group_member_title");
			numContainer.empty();
			var numTemp = me.$el.find("#group-number-template");
			var temp = _.template(numTemp.html());
			numContainer.append(temp({number:me._datas.data.length}));

			var container = me.$el.find(".group_head_image");
			container.empty();
			var headTemplate = me.$el.find("#head-template");
			var template =_.template(headTemplate.html());
			for (var i = 0; i < 4; i++) {
				container.append(template(me._datas.data[i]));
			};
			container.append("<div class='addContact'><img src='../contact/image/add_icon.png'></div>")
		},
		goDetail: function(el){
			var me = this;
			var $target = $(el.currentTarget);
			var type = $target.attr("data-value");
			if (type == "modifyName") {
				butterfly.navigate("contact/modifyName.html",{type:type, groupName: me._groupName});
			}else if (type == "modifyDescribe") {
				var description = me.$el.find(".des-imfor").text();
				butterfly.navigate("contact/modifyDescribe.html",{groupDescripe: description});
			}
		},
		modifyHeadImg: function(){
			var me = this;
			me.$el.find(".ceng").css("display","block");
		},
		deleteCeng: function(){
			var me = this;
			me.$el.find(".ceng").css("display","none")
		},
		showBigPicture: function(el){
			var me = this;	
			var imgUrl = "../contact/image/head_image.jpg";	
			var container = me.$el.find(".content");
			var smallImgNode = me.$el.find(".head_image");			
			EnlargeImg.enlargeImg(imgUrl, container, smallImgNode);
		},
		goModifyHeadImg: function(el){
			var me = this;
			alert("更换头像");
		},
		manageGroup: function(el){
			butterfly.navigate('contact/manageMember.html');
		},
		selectContact: function(el){
			butterfly.navigate('contact/selectContact.html', {from:'groupImfor'});
		}
	}); //view define
});