define(['underscore', 'zepto'], function(_, $) {

	var DownloadManager = function() {
		this.downloadQueue = [];
		this.completeQueue = [];
		this.reloadQueue = [];
		this.loadState();
		this.listenToEvent();

		this.successCount = 0;
		this.errorCount = 0;
	};

	_.extend(DownloadManager.prototype, Backbone.Events, {

		listenToEvent: function() {
			//监听文件删除成功
			this.listenTo(this, "removeSuccessCount", this.onRemoveSuccessCount);
			//监听删除文件失败
			this.listenTo(this, "removeErrorCount", this.onRemoveErrorCount);
			//监听获取文件不存在
			this.listenTo(this, "getErrorCount", this.onGetErrorCount);
		},

		loadState: function() {
			var me = this;

			var state = null;
			try {
				var userName = window.localStorage['username'];
				if (window.localStorage[userName + '_ichangan.download-manager']) {
					state = JSON.parse(window.localStorage[userName + '_ichangan.download-manager']);
				}
			} finally {}

			if (!state || state == "null") {
				this.completeQueue = [];
				this.reloadQueue = [];
				return;
			}

			this.completeQueue = state.completeQueue;
			this.reloadQueue = state.reloadQueue;

			if (!window.cordova) return;


			window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

			//删除下载失败的文件
			_.each(state.downloadQueue, function(task) {
				me.removeFile(task);
			})

		},

		saveState: function() { //保存状态

			var userName = window.localStorage['username'];
			var state = {
				downloadQueue: this.downloadQueue,
				completeQueue: this.completeQueue,
				reloadQueue: this.reloadQueue
			}

			window.localStorage[userName + '_ichangan.download-manager'] = JSON.stringify(state);
		},

		//任务下载
		onDownload: function(id, url, filename, target, onProgress, success, fail) { //ID 下载路径 文件名 存储目标 进度方法 成功方法 失败方法		
			var me = this;
			var downloadUrl = url; //下载路径
			var idUrl = id; //ID

			if (me.findDownloadTask(id)) { //如果任务已经在下载中，就return
				return;
			} else if (me.findReloadTask(id)) {
				me.removeTask(id);
				me.saveState();
			}

			var task = {
				url: idUrl,
				downloadUrl: downloadUrl,
				filename: filename,
				target: target
			};
			var uri = encodeURI(downloadUrl);
			task.ft = new FileTransfer();
			task.ft.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
					if (onProgress) {
						onProgress(idUrl, (progressEvent.loaded / progressEvent.total));
					}
					me.findDownloadTask(idUrl).downloadProgress = (progressEvent.loaded / progressEvent.total);
					me.trigger("downloadProgress", me.findDownloadTask(idUrl)); //trigger事件
				}
			};

			me.downloadQueue.push(task); //存入已经正在下载的队列中

			me.saveState();

			task.ft.download(uri, encodeURI(target),
				function(entry) {
					//删除cordova.file-transfer对象
					delete task.ft;
					me.completeQueue.push(task); //存入已经下载完成的队列中
					me.removeTask(task.url); //移出正在下载的队列
					me.saveState(); //保存状态
					if (success) {
						success(task.url, task.filename, entry);
					}

					me.trigger("downloadSuccess", task);
				},
				function(error) {
					me.removeTask(task.url); //移出正在下载的队列
					if (!me.notAddToReloadQueue && !me.findReloadTask(task.url)) {
						me.reloadQueue.push(task); //添加到重新下载队列
					}

					me.saveState();

					if (fail) {
						fail(task.url, task.filename);
					}

					me.trigger("downloadError", task, me.notAddToReloadQueue);
					me.notAddToReloadQueue = false; //将此标志置为false

				},
				false, {
					headers: {
						/* "Authorization": "Basic k=="*/
					}
				}
			);
		},

		abort: function(idUrl) { //停止任务

			this.notAddToReloadQueue = true; //别添加到重新下载的队列
			var task = this.findDownloadTask(idUrl);
			if (task && task.ft) {
				task.ft.abort();
			}
		},

		findCompleteTask: function(url) { //通过url找到下载完成的任务
			return _.find(this.completeQueue, function(task) {
				return task.url == url;
			});
		},

		findDownloadTask: function(url) { //通过url找到下载任务
			return _.find(this.downloadQueue, function(task) {
				return task.url == url;
			});
		},

		findReloadTask: function(url) { //通过url找到重新下载任务
			return _.find(this.reloadQueue, function(task) {
				return task.url == url;
			});
		},

		removeTask: function(url) { //通过url删除下载任务
			var me = this;
			var downloadIndex = me.downloadQueue.indexOf(me.findDownloadTask(url)); //是否存在下载队列
			var completeIndex = me.completeQueue.indexOf(me.findCompleteTask(url)); //是否存在完成队列
			var reloadIndex = me.reloadQueue.indexOf(me.findReloadTask(url)); //是否存在重新下载队列
			if (downloadIndex > -1) {
				me.downloadQueue.splice(downloadIndex, 1);
			} else if (completeIndex > -1) {
				me.completeQueue.splice(completeIndex, 1);
			} else if (reloadIndex > -1) {
				me.reloadQueue.splice(reloadIndex, 1);
			}
		},

		deleteFile: function(url, urlLength) { //删除任务和文件
			var me = this;
			if (me.findDownloadTask(url)) {
				me.removeDownloadingTask(url, urlLength); //删除正在下载的任务和文件
			} else if (me.findCompleteTask(url)) {
				me.removeFile(me.findCompleteTask(url), urlLength); //如果已经下载完成就删除本地文件
			} else if (me.findReloadTask(url)) { //移出重新下载的任务
				me.removeTask(url);
				me.saveState();
				me.successCount = me.successCount + 1;
				me.triggerReload(urlLength);
			} else {
				me.successCount = me.successCount + 1;
				me.triggerReload(urlLength);
			}

		},

		removeDownloadingTask: function(idUrl, urlLength) { //删除正在下载的任务
			var me = this;
			// me.notAddToReloadQueue = true;		//别添加到重新下载的队列
			me.abort(idUrl);

			setTimeout(function() { //延迟更改状态的时机，
				me.removeTask(idUrl);
				me.saveState();
				me.trigger("removeSuccessCount", urlLength);
			}, 0);
		},
		getTargetCount:function(target) {
			var targetCount = 0;
			for (var storeKey in window.localStorage) { //遍历localStorage
				if (storeKey.indexOf("_ichangan.download-manager") > -1) { //获取所有用户的下载列表
					var otherDownloadManager = window.localStorage.getItem(storeKey);
					if (otherDownloadManager && otherDownloadManager !== "" && otherDownloadManager !== "null") { //判断otherDownloadManager不为空
						var otherDownloadManagerOb = JSON.parse(otherDownloadManager);
						if (otherDownloadManagerOb.completeQueue && otherDownloadManagerOb.completeQueue.length > 0) { //获取已经下载完成的文件路径
							console.log("用户:" + storeKey);
							_.each(otherDownloadManagerOb.completeQueue, function(completeItem) {
								if (completeItem.target && completeItem.target.indexOf(target) > -1) { //如果文件路径相同
									targetCount = targetCount + 1;
									console.log("target的数目:" + targetCount)
								}
							})
						}
					}
				}
			}
			return targetCount;
		},
		removeFile: function(task, urlLength) { //删除本地文件
			var me = this;
			if (!window.cordova) return;

			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
				/*var fileName = task.filename;
				var fileType = fileName.substring(fileName.lastIndexOf("."));
				var fileShortName = fileName.substring(0,fileName.lastIndexOf(".")); 
				fileName = fileShortName + task.url + fileType;*/

				// var filePath = device.platform == 'iOS' ? fileName : "cn.com.changan.ichangan/" + fileName;
				if (device.platform == "iOS") {
					var target = task.target.substring(fs.root.nativeURL.length);
				} else {
					var filePathIndex = task.target.indexOf(butterfly.config.identifier + "/");
					var target = task.target.substring(filePathIndex);
				}
				console.log(target);
				fs.root.getFile(target, {
					create: false
				}, function(fileEntry) {
					var targetCount = me.getTargetCount(target);
					if(targetCount > 1) {
						me.removeTask(task.url);
						me.saveState(); //更新本地存储
						me.trigger("removeSuccess", task);
						me.trigger("removeSuccessCount", urlLength);
					} else {
						fileEntry.remove(function() {
							me.removeTask(task.url);
							me.saveState(); //更新本地存储
							me.trigger("removeSuccess", task);
							me.trigger("removeSuccessCount", urlLength);
						}, function(error) {
							console.error('remove err: %s', error);
							me.trigger("removeError", task);
							me.trigger("removeErrorCount", urlLength);
						});
					}

				}, function(error) {
					me.removeTask(task.url);
					me.saveState(); //更新本地存储
					console.error('getFile err: %s', error);
					me.trigger("getError", task);
					me.trigger("getErrorCount", urlLength);
				});
			}, function(error) {
				console.error(error)
			});
		},

		removeFileBatch: function(urlArr) { //批量删除文件和任务
			var me = this;
			var urlLength = urlArr.length;
			_.each(urlArr, function(url) {

				if (!window.cordova) return;

				me.deleteFile(url, urlLength); //删除任务和文件
			});
		},

		onRemoveSuccessCount: function(urlLength) { //计算删除文件成功的数目

			this.successCount = this.successCount + 1;
			this.triggerReload(urlLength);
		},

		onRemoveErrorCount: function(urlLength) { //计算删除文件失败的数目

			this.errorCount = this.errorCount + 1;
			this.triggerReload(urlLength);
		},

		onGetErrorCount: function(urlLength) { //计算删除文件失败的数目

			this.successCount = this.successCount + 1;
			this.triggerReload(urlLength);
		},

		triggerReload: function(length) { //发射重新加载数据
			var me = this;
			if ((me.successCount + me.errorCount) == length) {
				//全部删除完成就发射重新加载数据事件
				me.trigger("reloadData", me.successCount);
				me.successCount = 0;
				me.errorCount = 0;
			}
		},
		openFile: function(completeTask) {
				var me = this;
				if (!window.cordova) return;
				/*var fileName = completeTask.filename;
				var fileType = fileName.substring(fileName.lastIndexOf("."));
				var fileShortName = fileName.substring(0,fileName.lastIndexOf(".")); 
				fileName = fileShortName + completeTask.url + fileType;*/
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
					// var fileURL = device.platform == "iOS" ? fileName : "cn.com.changan.ichangan/" + fileName;
					if (device.platform == "iOS") {
						var target = completeTask.target.substring(fs.root.nativeURL.length);
					} else {
						var filePathIndex = completeTask.target.indexOf(butterfly.config.identifier + "/");
						var target = completeTask.target.substring(filePathIndex);
					}
					console.log(target);
					fs.root.getFile(target, {
						create: false
					}, function(fileEntry) {
						me.trigger("fileExist", completeTask); //发射事件说明文件存在，可以打开文件
						// var ref = window.open(target, targetType, "location=yes");
					}, function(error) {
						me.trigger("fileNoExist", completeTask); //发射事件说明文件不存在
					});
				}, function(error) {
					me.trigger("openError"); //发射事件说明文件打开失败
				});
			} //openFile

	});

	return new DownloadManager();
});