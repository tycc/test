define([
		'butterfly/view',
		'butterfly',
		'main/footer',
		'notification'
	],
	function(View, Butterfly, Footer, Notification) {
		var codeMsg;
		return View.extend({
			events: {
				"click #verificationCodeBtn": "detectionCode",
				"input #phone": "verificationCodeBtn",
				"input #verificationCode": "verificationCode",
				"click .submit": "submit",
				"click .back": "goBack",
				"focus #phone,#verificationCode":"inputFocus",
				"blur #phone,#verificationCode":"phoneBlue"
			},
			render: function() {},
			onShow: function() {},
			detectionCode: function() {
				var me = this;
				var phone = me.$("#phone").val();
				var regNum = /^0{0,1}(13[0-9]|15[0-9]|153|156|18[0-9])[0-9]{8}$/; //手机验证
				//#f35d3c
				if (phone.trim().length === 0) { //被推荐人手机号码
					Notification.show({
						type: "error",
						message: '手机号码不能为空'
					});
					return;
				} else if (regNum.test(phone) == false) { //被推荐人手机号码
					Notification.show({
						type: "error",
						message: '手机号码格式有误'
					});
					return;
				}
				var url = "https://api.netease.im/sms/sendcode.action";
				this.postSMS(url, phone);//请求短信验证码
				// me.$("#verificationCode").val("123456");
				me.$(".submit").addClass('orange');
			},
			postSMS: function(url, phone){
				var obj = this.getPostData();
				$.ajax({//请求网易云讯发送短信验证码接口
					url: url,
					type: "POST",
					data: {
						mobile: phone
					},
					headers: {
						AppKey: "6e5b7e242c3737ee9c8361e7541e28b7",
						CurTime: obj.CurTime,
						CheckSum: obj.CheckSum,
						Nonce: obj.Nonce
					},
					success: function(response) {
						var data;
						if(typeof response == "string"){
							data = JSON.parse(response);
						}else{
							data = response;
						}

						if (data && data.code == 200) {
							codeMsg = data.obj;
						}
					},
					fail: function() {
						Notification.show({
							type: "error",
							message: '验证码发送失败'
						});
					}
				});
			},
			getPostData: function() { // 得到短信请求参数
				var AppSecret = "78c2561ae4e6";
				var Nonce = this.randomString(16);
				var CurTime;
				var date = new Date();
				var year = date.getFullYear(),
					month = date.getMonth(),
					day = date.getDate(),
					hours = date.getHours(),
					minutes = date.getMinutes(),
					seconds = date.getSeconds(),
					ms = date.getMilliseconds();

				CurTime = Date.UTC(year, month, day, hours, minutes, seconds, ms);

				var str = AppSecret + Nonce + CurTime;
				console.log(str);
				var hash = hex_sha1(str);
				var obj = {};
				obj.CurTime = CurTime;
				obj.CheckSum = hash;
				obj.Nonce = Nonce;
				return obj;
			},
			randomString: function(len) {　　//随机生成16位字符串
				len = len || 16;　　
				var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
				var maxPos = $chars.length;　　
				var pwd = '';　　
				for (i = 0; i < len; i++) {　　　　
					pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　
				}　　
				return pwd;
			},
			verificationCodeBtn: function() {
				var me = this;
				var phone = me.$("#phone").val();
				var regNum = /^0{0,1}(13[0-9]|15[0-9]|153|156|18[0-9])[0-9]{8}$/; //手机验证
				if (phone.trim().length === 11 && regNum.test(phone) == true) {
					me.$(".verificationCodeBtn").addClass('orange');
				} else {
					me.$(".verificationCodeBtn").removeClass('orange');
				}
			},
			verificationCode: function() {
				var me = this;
				var verificationCode = me.$("#verificationCode").val();
				if (verificationCode.trim().length === 4) {
					me.$(".submit").addClass('orange');
				} else {
					me.$(".submit").removeClass('orange');
				}

			},
			submit: function() {
				var me = this;
				var submitClass = me.$(".submit").attr('class');
				var isSub = submitClass.indexOf("orange");
				var verificationCode = this.$("#verificationCode").val();
				if(isSub <= 0){//如果输入的值小于4为
					return;
				}

				if (codeMsg && verificationCode == codeMsg) {
					butterfly.navigate("welcome/methodOfPay.html");
				} else {
					Notification.show({
						type: "error",
						message: '请输入正确验证码'
					});
				}
			},
			inputFocus:function(e){
				var currentTarget  = $(e.currentTarget);
				var placeholder = currentTarget.attr("placeholder");
				if(placeholder){
					currentTarget.attr("placeholder","");
				}
			},
			phoneBlue:function(e){
				var currentTarget  = $(e.currentTarget);
				var placeholder_data = currentTarget.attr("placeholder-data");
				var value = currentTarget.val();
				if(placeholder_data && value.length == 0){
					currentTarget.attr("placeholder",placeholder_data);
				}else{
					return;
				}
			}
		}); //view define
	});
