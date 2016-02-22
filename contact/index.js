define([
		'butterfly/view',
		'butterfly',
		'contact/imageSet',
		'contact/js/recentlyChatArr',
		'dialog',
		'main/footer'
	],
	function(View, Butterfly, imageSet, RecentlyChats, Dialog, Footer) {
		return View.extend({
			events: {
				"click .index_list": "contactHRD",
				"click .index_group_list": "groupHRD",
				"click .create": "showMenu",
				"click .index_shade, .index_menu": "hideMenu",
				"click .index_menu li": "goIndexMenu",
				"click .clearfix li, .recent_contact li, .index_contact li": "goMessagesDetail"
			},
			myId: null,
			onShow: function(options) {
				var me = this;
				var me = this,
					footerFrom = "通讯录";
				me.loadFooter(footerFrom); //加载底部导航栏
				var im = navigator.chameleonIM;
				// this.login();
				if(im){
					me.myId = im._currentUser;
				}else{
					me.myId = "admin";
				}

				me.$el.find(".myTitle b").text(me.myId);
				// me.disconnected();
				// var disconnected = window.sessionStorage.getItem("disconnected");

				/*if(disconnected){
					window.sessionStorage.removeItem("disconnected");
					me.$el.find(".myTitle span").text("[离线]");
				}*/
				me.unitContact();
				me.unitGroup();
				me.unitRecentContact();
				View.prototype.onShow.apply(this, arguments);
			},
			//加载底部导航栏
			loadFooter: function(footerFrom) {
				var footer = new Footer({
					'from': footerFrom
				});

				this.$el.find('.content').append(footer.$el);
			},
			login: function(userId) {
				var me = this,
					userId = window.localStorage['username'];
				if(!userId || userId == "" || userId == null){
					userId = "admin";
				}

				window.sessionStorage.setItem("userId", "");
				window.sessionStorage.setItem("userId", "userId");

				if (typeof cordova != "undefined") {
					var im = navigator.chameleonIM;

					var options = {
							appId: "com.test", // 当前的appId
							userId: userId, // user id
							cert: { // 认证信息
								type: 1, // 认证类型, =1 系统自带认证; =2 第三方WEB认证
								pwd: "", // type=1,密码
								url: "", // type=2,第三方认证的URL
								token: "" // type=2,第三方认证的令牌
							},
							extra: {} // 附加信息
						},
						//				host = "192.168.1.53",
						host = "120.24.76.244", //服务器
						port = "3050";

					me.$el.find("#login-area").addClass("loading");
					me.$el.find("#username").attr("disabled", "disabled");
					me.$el.find("#password").attr("disabled", "disabled");



					im.init(host, port, options, function(result) {
						if (result.code == 200) {
							me.$el.find("#login-area").removeClass("loading");
							me.$el.find("#username").removeAttr("disabled");
							me.$el.find("#password").removeAttr("disabled");
							//离线后自动上线时，清空index页面的[离线]标记
							$("#index .myTitle span").text("");

							butterfly.navigate('contact/index.html');
						} else {

							me.$el.find("#login-area").removeClass("loading");
							me.$el.find("#username").removeAttr("disabled");
							me.$el.find("#password").removeAttr("disabled");
							var hash = window.location.hash;
							var msg = result.msg ? result.msg : "登录失败";
							if (hash !== "") {
								msg = "自动登录失败,请手动登录";
								var im = navigator.chameleonIM;
								window.history.back('contact/login.html');
							} else {
								if (result.code == 502) msg = "帐号已经登录了,请稍后再试";
							}
							Notification.show({
								type: "error",
								message: msg,
							});
						}
					});
				} else {
					butterfly.navigate('contact/index.html');
				}

			},
			disconnected: function() {
				var me = this;
				window.addEventListener('im.disconnected', function() {
					// me.$el.find(".myTitle span").text("[离线]");
					me.$el.find(".myTitle span").text("[离线]");
					// window.sessionStorage.setItem("disconnected",true);
				});
			},
			alertexit: function(button) {

				navigator.app.exitApp();

			},
			//初始化联系人列表
			unitContact: function() {
				var me = this;
				// if (typeof cordova == "undefined") {
				// 	return;
				// }
				// var im = navigator.chameleonIM;
				// im.getMyFriends(function(r) {
				// 	if (r.code == 200) {
				// 		var template = _.template(this.$("#index_contact").html(), {
				// 			"arr": r.msg,
				// 			"myId": me.myId
				// 		});
				// 		this.$("#index_test").html(template);
				// 	}else{
						var arr = [{
							uid:1,
							nickname:"张无忌",
							class:"1"
						},{
							uid:2,
							nickname:"张三丰",
							class:"2"
						},{
							uid:3,
							nickname:"乔峰",
							class:"3"
						}];
						var template = _.template(this.$("#index_contact").html(), {
							"arr":arr,
							"myId": "11"
						});
						this.$("#index_test").html(template);
				// 	}
				// });
			},
			//初始化群组列表
			unitGroup: function() {
				var self = this;
				this.$('.index_group_list_info .clearfix').html('');
				var images = [{
					name: 'img1',
					path: '../contact/image/groupicon.png'
				}, {
					name: 'img2',
					path: '../contact/image/groupicon.png'
				}, {
					name: 'img3',
					path: '../contact/image/groupicon.png'
				}, {
					name: 'img4',
					path: '../contact/image/groupicon.png'
				}, {
					name: 'img5',
					path: '../contact/image/groupicon.png'
				}, ];
				this._imgs = images;
				this._length = images.length;
				this._staticLength = images.length;
				if (this._length > 5) {
					this._length = 5;
				}
				if (this._staticLength > 5) {
					this._staticLength = 5;
				}
				this._imageSet = new imageSet();
				this._imageSet.init(images);
				this._imageSet.on("onload", function(name, img) {
					self.countImage();
				});
				// this._imgs = [];
			},
			//初始化最近联系人
			unitRecentContact: function() {
				var me = this;
				if (typeof cordova == "undefined") {
					return;
				}
				me.listenerMsg(); // 监听消息
				me.refreshRecentContact(); //刷新最近联系人
			},

			newMsgTime: function(messageTimestamp) {
				var messageTime = new Date(messageTimestamp);
				var year = messageTime.getFullYear();
				var month = messageTime.getMonth();
				var date = messageTime.getDate();
				var day = messageTime.getDay();
				var time = messageTime.toLocaleTimeString();
				return time;
			},
			refreshRecentContact: function() {
				var me = this;
				me.$(".recent_contact").html("");
				var arr = RecentlyChats.getArrary();
				if (arr == null) {
					return;
				}
				for (var i = 0; i < arr.length; i++) {
					var user = arr[i];
					var msgArr = me.getMsgArr(user.uid);
					if (msgArr.length > 0) {
						//msg: "["[饼干][伤心]",1,154,1446514382754,"wwww",false]"
						var unread = 0;
						for (var m = 0; m < msgArr.length; m++) {
							var mArr = msgArr[m];
							if (!mArr.read) {
								unread++;
							}
						}
						var newMsg = msgArr[msgArr.length - 1];
						var messageContent = newMsg.messageContent;
						var messageType = newMsg.messageType;
						var messageId = newMsg.messageType;
						var messageTimestamp = newMsg.messageTimestamp;
						// var source = newMsg[4];
						//返回消息的最新时间
						var newTime = me.newMsgTime(messageTimestamp);

						var template = _.template(me.$("#index_nearContact_temp").html(), {
							"messageContent": messageContent,
							"messageType": messageType,
							"messageId": messageId,
							"time": newTime,
							"source": user.uid,
							"unread": unread
						});
						me.$(".recent_contact").prepend(template);
					}
				}

			},
			//组装消息
			assemblyMsg: function(msg) {
				//msg = ["[饼干][伤心]",1,154,1446514382754,"wwww"]
				var obj = {};
				obj.messageContent = msg[0];
				obj.messageType = msg[1];
				obj.messageId = msg[2];
				obj.messageTimestamp = msg[3];
				obj.source = msg[4];
				obj.read = false; //将消息设置为未读
				obj.sendOk = true; //发送成功的消息
				return obj;
			},
			setMsgArr: function(source, msgArr) {
				var me = this;
				window.localStorage.setItem(me.myId + "-" + source, JSON.stringify(msgArr));
			},
			//得到已有消息的数组
			getMsgArr: function(source) {
				var me = this;
				var msgArr = [];
				var msgArrSession = window.localStorage.getItem(me.myId + "-" + source);
				if (msgArrSession) {
					msgArr = JSON.parse(msgArrSession);
				}
				return msgArr;
			},
			listenerMsg: function() { //获取新消息数据
				var me = this;
				window.imMsg = function(r) {
					var hash = window.location.hash;
					if (hash === "#im/messagesDetail.html") {
						return;
					}

					//例子
					r.route = "chat.chatHandler.onSend" //聊天数据
						//msg: "["[饼干][伤心]",1,154,1446514382754,"wwww"]"
						// r.msg=[messageContent,messageType,messageId,messageTimestamp,source,target]
					var msg = me.assemblyMsg(JSON.parse(r.msg)); //重新组装消息格式

					var msgArr = me.getMsgArr(msg.source); //得到以前的消息数组

					msgArr.push(msg); //加入新的消息

					me.setMsgArr(msg.source, msgArr); //更新消息数组

					RecentlyChats.insert(msg.source);
					me.refreshRecentContact();
				};
				window.removeEventListener('im.receive', window.imMsg, false);
				window.addEventListener('im.receive', window.imMsg, false);
			},
			countImage: function() {
				//加载所需最后一张图片时，开始绘图
				if (this._length <= 1) {
					this.startDraw();
				}
				this._length--;
			},
			startDraw: function() {
				for (var index = 0; index < this._staticLength; index++) {
					var template = _.template(this.$('#index_group').html(), {
						name: 'xxx讨论组',
						img: '../contact/image/groupicon.png'
					});
					this.$('.index_group_list_info .clearfix').append(template);
					// var canvas = this.$('.index_group_list_info .index_group_list_info_img').eq(index).find('canvas')[0];
					// var cxt = canvas.getContext("2d");
					// var img = this._imageSet.getImage(this._imgs[index].name);
					//          if(img)
					//          {
					//              cxt.drawImage(img, 0, 0);
					//          }
				}
			},
			groupHRD: function(el) {
				var currentTarget = $(el.currentTarget);
				if (currentTarget.hasClass('hide')) {
					currentTarget.removeClass('hide');
					currentTarget.find('.index_list_icon').css({
						"-webkit-transform": "rotate(0deg)"
					});
					currentTarget.siblings('.index_group_list_info').css('display', 'block');
				} else {
					currentTarget.addClass('hide');
					currentTarget.find('.index_list_icon').css({
						"-webkit-transform": "rotate(-90deg)"
					});
					currentTarget.siblings('.index_group_list_info').css('display', 'none');
				}
			},
			contactHRD: function(el) {
				var currentTarget = $(el.currentTarget);
				if (currentTarget.hasClass('hide')) {
					currentTarget.removeClass('hide');
					currentTarget.find('.index_list_icon').css({
						"-webkit-transform": "rotate(0deg)"
					});
					currentTarget.siblings('.index_list_info').css('display', 'block');
				} else {
					currentTarget.addClass('hide');
					currentTarget.find('.index_list_icon').css({
						"-webkit-transform": "rotate(-90deg)"
					});
					currentTarget.siblings('.index_list_info').css('display', 'none');
				}
			},
			//显示 创建群  组
			showMenu: function(el) {
				var me = this;
				var currentTarget = $(el.currentTarget);
				var index_shade = me.$el.find(".index_shade");
				var index_menu = me.$el.find(".index_menu");
				index_shade.css("visibility", "visible");
				index_menu.css("visibility", "visible");
			},
			hideMenu: function() {
				var me = this;
				var index_shade = me.$el.find(".index_shade");
				var index_menu = me.$el.find(".index_menu");
				index_shade.css("visibility", "hidden");
				index_menu.css("visibility", "hidden");
			},
			goIndexMenu: function(el) {
				var me = this;
				var currentTarget = $(el.currentTarget);
				var value = currentTarget.attr("data-value");
				if (value == "createGroup") {
					butterfly.navigate('contact/createGroup.html');
				} else if (value == "createDiscussion") {
					butterfly.navigate('contact/discussionGroup.html');
				} else if (value == "logout") {
					me.logout();
				}
			},
			logout: function() {
				var im = navigator.chameleonIM;
				im.logout(function() { //成功的回调
					window.removeEventListener('im.receive', window.imMsg, false);
					window.history.back();
				})
			},
			goMessagesDetail: function(el) {
				var me = this;
				var currentTarget = $(el.currentTarget);
				if (currentTarget.find(".index_nearContact_new").length > 0) {
					currentTarget.find(".index_nearContact_new").text("0");
					currentTarget.find(".index_nearContact_new").css("display", "none");
				}
				var uid = currentTarget.attr("data-id");
				var nickname = currentTarget.attr("data-name");
				var source = currentTarget.attr("data-source");
				window.removeEventListener('im.receive', window.imMsg, false);
				
				if(!nickname){
					nickname="xxx讨论组"
				}

				butterfly.navigate('contact/messagesDetail.html', {
					uid: uid,
					nickname: nickname,
					source: source
				});
			}


		}); //view define
	});
