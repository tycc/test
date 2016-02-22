define([
		'butterfly/view',
		"spin",
		'butterfly',
		'notification',
		'dialog',
		'main/footer'
	],
	function(View, Spinner, Butterfly, Notification, Dialog, Footer) {
		return View.extend({
			events: {
				"click .back": "goBack",
				// "click #login-button": "login"
			},
			//菊花图
			setSpin: function() {
				var spinnerOpts = {
					lines: 12, // 共有几条线组成
					length: 7, // 每条线的长度
					width: 4, // 每条线的粗细
					radius: 10, // 内圈的大小
					corners: 1, // 圆角的程度
					rotate: 0, // 整体的角度（因为是个环形的，所以角度变不变其实都差不多）
					direction: 1,
					color: '#fff', // 颜色 #rgb 或 #rrggbb
					speed: 1, // 速度：每秒的圈数
					trail: 60, // 高亮尾巴的长度
					shadow: false, // 是否要阴影
					hwaccel: false, // 是否用硬件加速
					className: 'spinner', // class的名字
					zIndex: 7, // z-index的值 2e9（默认为2000000000）
					top: '50%', // 样式中的top的值（以像素为单位，写法同css）
					left: '50%' // 样式中的left的值（以像素为单位，写法同css）
				};
				var target = document.getElementById('spin-area');
				var spinner = new Spinner(spinnerOpts).spin(target);
			},
			onShow: function(options) {
				var me = this;
				me.listenerBackbutton();
				me.setSpin();
				me.automaticLogin();
				footerFrom = "通讯录";
                me.loadFooter(footerFrom); //加载底部导航栏
				View.prototype.onShow.apply(this, arguments);
				me.login("tu");
			},
			//监听返回键
			listenerBackbutton: function() {
				var me = this;
				window.imBackbutton = function() {
					var hash = window.location.hash;
					if (hash === "#contact/messagesDetail.html") {
						window.removeEventListener('im.receive', window.imMsgDetail, false);
						history.back();
					} else if (hash === "#contact/index.html" || hash === "") {
						// window.removeEventListener('im.receive', window.imMsg, false);
						navigator.app.exitApp();
					} else {
						history.back();
					}
				};
				document.removeEventListener('backbutton', window.imBackbutton, false);
				document.addEventListener("backbutton", window.imBackbutton, false);
			},
			automaticLogin: function() {
				if (typeof cordova == "undefined") {
					return;
				}
				var im = navigator.chameleonIM;
				if (im._status === 3 && im._currentUser.length > 0) {
					butterfly.navigate('contact/index.html');
				}


			},
			login: function(userId) {
				var me = this,
					userId = window.localStorage['username'];
				if (userId == "") {
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
			loadFooter: function(footerFrom) {
				var footer = new Footer({
					'from': footerFrom
				});
				this.$el.find('.content').append(footer.$el);
			}
		}); //view define
	});
