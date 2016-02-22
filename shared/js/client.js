define(['backbone', "text!shared/profile/profile.json"], function(Backbone, json) {
// 不用text读取json哦，后面要改

	//   node.js代理接口
	//"text!changan/profile/profile-proxy.json";
	//   部署手机时用
	//"text!changan/profile/profile-development.json";

	var basePath = JSON.parse(json).serverUrl;
	return {
		basePath: basePath,
		pageSize: 20, //通用列表分页大小
		request: function(paras) {
			var url = decodeURI(location.href);
			var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
			var returnValue;
			for (i = 0; i < paraString.length; i++) {
				var tempParas = paraString[i].split('=')[0];
				var parasValue = paraString[i].split('=')[1];
				if (tempParas === paras)
					returnValue = parasValue;
			}

			if (typeof(returnValue) == "undefined") {
				return "";
			} else {
				return returnValue;
			}
		},

		ajax: function(params) {
			var me = this;

			var callbacks = _.pick(params, ['success', 'error']);

			var defaults = {
				dataType: "json",
				type: "POST",
				timeout: 15000,
				error: function() {
					console.log('Call API error');
					callbacks.error(arguments);
				}
			};

			//带有默认值
			params = _.extend(defaults, params);
			if (!params.data) {
				params.data = {};
			}
			
			return $.ajax(params);
		},
		//判断是否为空
		isNull: function(data) {
			var def = true;
			if (typeof data == "string") {
				data = data.trim();
			}
			if ((typeof data !== "undefined" && data && data.length !== 0) || typeof data === "function") {
				def = false;
			}
			return def;
		},

	} //return
});