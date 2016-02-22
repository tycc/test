define([],function() {

	var Forks = function() {};

	var enableForkNotification = true;
	var unDelivedLastNotification;	// 如果enableForkNotification置为false,会保留最后一条推送消息

	/*
	 * 加载模块根目录下的fork.js文件，业务模块在该文件中注册PushNotificationArrived事件监听
	 */
	Forks.prototype.loadForks = function(complete) {
		window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
		if(!window.device || !window.resolveLocalFileSystemURL)
			return;
        var replaceDir = "/" + butterfly.config.appFolderName + "/";
        var rootDir = butterfly.config.appRootPath + butterfly.config.appFolderName + "/";
       
		var loadModules = function(modules) {
			if (modules.length > 0) {
				console.log('load fork modules');
				require(modules, complete || function() {});
			} else if (complete) {
				complete();
			}
		};
       
        window.resolveLocalFileSystemURL(rootDir, function(fs) {
			console.log('Load forks from: %s',rootDir);
			fs.createReader().readEntries(function(entries) {
				var modules = [];
				var cnt = 0;
				var total = entries.length;
				var checkLoad = function(n) {
					if (n == total)
						loadModules(modules);
				};
				for (var i = 0, len = entries.length; i < len; i++) {
					if (entries[i].isDirectory) {
						entries[i].getFile('fork.js', {
							create: false
						}, function(entry) {
							console.log(entry.fullPath);
							modules.push(entry.fullPath.replace(replaceDir, '../'));
							checkLoad(++cnt);
						}, function() {
							checkLoad(++cnt);
						});
					} else {
						checkLoad(++cnt);
					}
				}
			}, function() {
				console.log('loadforks: readEntries error.');
			});
		},function(err){
			console.log('loadforks: resolveLocalFileSystemURL error');
		});
	};

	var dispatchMessageToModules = function(isBackground, msg) {
		if(enableForkNotification) {
			console.log('from bar:' + isBackground + '\n' + 'msg:' + msg);
			// 向前兼容,继续保留这个事件
			Backbone.trigger('PushNotificationArrived', arguments);
			// 使用butterfly2.1框架的,应该监听这个事件　
			butterfly.trigger('NotificationArrived', arguments);
		}else {
			unDelivedLastNotification = { 'isBackground': isBackground, 'msg': msg };
		}
	};

	/*
	 * 原生层收到推送消息会调用改函数
	 */
	Forks.prototype.handlePushNotifications = function(isBackground, msg) {
		dispatchMessageToModules(isBackground, msg);
	};

	Forks.prototype.dispatchMessageToModules = dispatchMessageToModules;

	Forks.prototype.setEnableForkNotification = function(enabled, delivedLastNotification) {
		if(enableForkNotification == enabled)
			return;
		enableForkNotification = enabled;
		if(enabled && delivedLastNotification && unDelivedLastNotification) {
			var notif = unDelivedLastNotification;
			unDelivedLastNotification = null;
			this.handlePushNotifications(notif.isBackground, notif.msg);
		}
	};

	// 保留这个方法,向前兼容
	Forks.prototype.setEnableForkPushNotification = function(enabled, delivedLastNotification) {
		this.setEnableForkNotification(enabled, delivedLastNotification);
	};

	Forks.prototype.getEnableForkNotification = function()
	{
		return enableForkNotification;
	}

	// 保留这个方法,向前兼容
	Forks.prototype.getEnableForkPushNotification = function()
	{
		return this.getEnableForkNotification();
	}
	if(!window.forksLoader) {
		window.forksLoader = new Forks();
		window.forksLoader.loadForks(function() {
			if(window.plugins && window.plugins.pushNotification) {
				var options = {};
				if(window.device.platform == "iOS") {
					options = {
								'badge':true,
								'sound':true,
								'alert':true,
								'ecb':'window.forksLoader.handlePushNotifications'
							};
				}else if(window.device.platform == "Android") {
					options = {
								'http_host': butterfly.config.chameleonUrl + '/instant',
								'http_port':'',
								'app_key':butterfly.config.appKey,
								'secret':butterfly.config.appSecret,
								'app_package_name':butterfly.config.nativeId,
								'app_version':butterfly.config.version,
								'basews': butterfly.config.chameleonUrl
							};
				}
				
				window.plugins.pushNotification.register(function(result) {
					console.log("pushNotification register ok.");
				}, function() {
					console.log("pushNotification register error.");
				}, options);
			}
		});
	}
});