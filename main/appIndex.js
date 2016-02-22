define([
		'butterfly/view',
		'butterfly',
		'notification',
		'iscroll',
		'main/footer',
		'swipe',
		'shared/js/loadforks'
	],
	function(View, Butterfly, Notification, IScroll, Footer, swipe) {

		return View.extend({
			events: {
				'click .pic': 'goDetail'
			},
			onShow: function() {
				var me = this,
					footerFrom = "校园";
				me.loadFooter(footerFrom); //加载底部导航栏
				this.swipe();
				this.signInDevice();

				if (window.forksLoader) {
					window.forksLoader.setEnableForkPushNotification(true, true);
				}
			},
			goDetail: function(el) {

				var currentTarget = $(el.currentTarget);
				var index = currentTarget.attr("data-index");
				if (index == 0) {


					username = window.localStorage['username'];
				if(username &&
					username != "" && username != null){
					butterfly.navigate("welcome/searchStudent.html",{effect:"null"});
				}else{
					butterfly.navigate("welcome/welcomeIndex.html",{effect:"null"});
				}

					// butterfly.navigate('welcome/welcomeIndex.html')
				}
			},
			//加载底部导航栏
			loadFooter: function(footerFrom) {
				var footer = new Footer({
					'from': footerFrom
				});

				this.$el.find('.content').append(footer.$el);
			},
			signInDevice: function() {
				var loginId = "admin";
				if (navigator.iChanganCommon && navigator.iChanganCommon.getDeviceId) {
					navigator.iChanganCommon.getDeviceId(
						function(deviceId) {
							$.ajax({
								url: "http://m.changan.com.cn/pushModule/ms_plugin/push_api/ms_user_sign",
								method: 'POST',
								timeout: 30 * 1000,
								dataType: 'json',
								data: {
									loginId: loginId,
									loginName: loginId,
									appKey: 'b3d5423f2eb52e537428fb15',
									masterSecret: '5c7009c139545300a29eb463',
									appName: 'schoolDemo',
									deviceId: deviceId,
									deviceOS: window.device.platform,
									OSType: window.device.platform == "iOS" ? 1 : 2
								},
								success: function() {
									console.log('设备签到成功');
								},
								error: function() {
									console.log('设备签到失败');
								}
							});
						},
						function() {
							console.log('获取设备id失败');
						}
					);
				}
			},
			swipe: function() {
				var me = this;
				var bullets = $("#position").children("li");
				if (!this.swiper) {
					this.swiper = this.$el.find('#slider').Swipe({
						startSlide: 0, //开始滚动的位置
						speed: 500, //动画滚动的间隔（秒数）
						auto: 2000, //开始自动幻灯片（以毫秒为单位幻灯片之间的时间）
						continuous: true, //创建一个无限的循环（当滑动到所有动画结束时是否循环滑动）
						disableScroll: false, //当滚动滚动条时是否停止幻灯片滚动
						stopPropagation: false, //是否停止事件冒泡
						closeEndMotion: true,
						callback: function(pos) { //幻灯片运行中的回调函数
							var i = bullets.length;
							while (i--) {
								bullets[i].className = ' ';
							}
							bullets[pos].className = 'on';
						},
						transitionEnd: function(index, elem) { //动画运行结束的回调函数
							// alert(index)
						}
					});
				}
			}

		}); //view define
	});
