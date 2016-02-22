define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	var VERSION = 1.0;

	var EVT_IN_VIEW = "in_view";
	var EVT_IN_APP = "in_app";
	var EVT_ENTER_APP = "enter_app";
	var EVT_GOT_EVENT = "got_event";

	var monitor;
	var resumeTime = new Date();
	var firsttime = window.localStorage.monitor_firsttime === undefined;
	var delegateEvents = Backbone.View.prototype.delegateEvents;
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	var lastPath, timestamp, span;
	var moduleInfos = [];

	var getModuleId = function(path) {
		if(!path) return "";
		var result = _.find(moduleInfos, function(moduleInfo) {
			return path.indexOf(moduleInfo.name) === 0;
		});
		return result ? result.module.identifier:path;
	};

	var gatherEvent = function(evt) {
		if(monitor) {
			// 检查事件是否在白名单中
			var result = _.find(monitor.options.whitelist, function(elem) {
				return elem == '*' || elem == evt.type;
			});
			if(result === undefined) 
				return;
			
			var el = $(evt.target);
			var target = el.attr('id') || el.prop('outerHTML');
			monitor.gather(getModuleId(lastPath), 1, EVT_GOT_EVENT, {
				timestamp: new Date(),
				path: lastPath,
				target: target,
				type: evt.type
			});
		}
	};

	window.localStorage.setItem('monitor_firsttime', false);

	var Monitor = function(options, interval) {
		if (!options.appId || !options.url) {
			throw new Error('创建Monitor的options至少要包含appId和url')
		}
		var me = this;
		me.events = localStorage.monitor_events === undefined ? []:JSON.parse(localStorage.monitor_events);
		me.options = $.extend({}, options);
		me.options.whitelist = _.union(['click'], [] || options.whitelist);

		me.timer = setInterval(function() {
			me.submit();
		}, interval || 30000);
	};

	// type: 0 or 1, 0 is timespan event, 1 is timestamp event
	Monitor.prototype.gather = function(moduleId, type, name, extra) {
		if (!name || isNaN(type)) {
			console.log('monitor warning: invalid params');
			return;
		}
		this.events.push({
			moduleId: moduleId,
			name: name,
			type: type,
			extra: extra
		});
		window.localStorage.setItem('monitor_events', JSON.stringify(this.events));
	};

	// extra app data while submit package
	Monitor.prototype.appData = function(data) {
		if (data === undefined) {
			return this.appData;
		}else {
			this.appData = data;
		}
	};

	Monitor.prototype.submit = function() {
		if (!this.events || this.events.length == 0)
			return;

		var me = this;

		$.ajax({
			url: me.options.url,
			type: 'POST',
			dataType: 'json',
			contentType:'application/json; charset=UTF-8',
			data: JSON.stringify({ version: VERSION, appId: me.options.appId, events: me.events, appData: me.appData }),
			success: function() {
				console.log("monitor submit success");
				me.events = [];
				window.localStorage.setItem('monitor_events', '[]');
			},
			error: function() {
				console.log("monitor submit error");
			}
		});
	};

	// 替换Backbone方法,收集View中的事件
	Backbone.View.prototype.delegateEvents = function(events) {
		delegateEvents.apply(this, arguments);

		if (!(events || (events = _.result(this, 'events')))) return this;
		for (var key in events) {
			var match = key.match(delegateEventSplitter);
			var eventName = match[1],
				selector = match[2];
			eventName += '.delegateEvents' + this.cid;
			if (selector === '') {
				this.$el.on(eventName, gatherEvent);
			} else {
				this.$el.on(eventName, selector, gatherEvent);
			}
		}
		return this;
	};

	console.log('monitor delegate...');

	// 搜索并加载各H5模块的package.json
	var scanModuleInfos = function(rootDir, callback) {
		var cnt = 0, all;
		var done = function(err) {
			if(callback) callback(err);
		};
		var searchModule = function(moduleEntry) {
			if (moduleEntry.isDirectory) {
				var moduleName = moduleEntry.name;
				moduleEntry.getFile('package.json', {
					create: false
				}, function(entry) {
					console.log('getFile ok:%o', entry);
					console.log('loadFile %s', entry.nativeURL.replace(rootDir, ''));
					require(['json!' + entry.nativeURL.replace(rootDir, '')], function(moduleInfo) {
						console.log('load moduleInfo %s: %o', moduleName, moduleInfo);
						moduleInfos.push({ name: moduleName, module: moduleInfo });
						if(++cnt === all) done();
					},function(err) {
						if(++cnt === all) done();
					});
				}, function(err) {
					if(++cnt === all) done();
					console.log('monitor getFile error: %s', err);
				});
			}else {
				if(++cnt === all) done();
			}
		};
		window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
		if (!window.device || !window.resolveLocalFileSystemURL) {
			done();
		}
		window.resolveLocalFileSystemURL(rootDir, function(fs) {
			console.log('monitor: %s', rootDir);
			fs.createReader().readEntries(function(entries) {
				all = entries.length;
				for (var i = 0, len = all; i < len; i++) 
					searchModule(entries[i]);
			}, function() {
				done('readEntries error.');
			});
		}, function(err) {
			done('resolveLocalFileSystemURL error');
		});
	}

	Backbone.history.on('route', function(router, name, args) {
		var path = args[0];
		if (monitor && lastPath && timestamp) {
			span = ((new Date()).getTime() - timestamp.getTime()) / 1000;
			monitor.gather(getModuleId(path), 0, EVT_IN_VIEW, {
				path: path,
				timespan: span
			});
		}
		lastPath = path;
		timestamp = new Date();
	});

	document.addEventListener("resume", function() {
		setTimeout(function() {
			if (monitor) {
				console.log('resume : %o',monitor.events);
				monitor.gather("", 1, EVT_ENTER_APP, {
					timestamp: new Date(),
					firsttime: false
				});
			}
			resumeTime = new Date();
		}, 0);
	});

	document.addEventListener("pause", function() {
		if (monitor) {
			var span = ((new Date()).getTime() - resumeTime.getTime()) / 1000;
			monitor.gather("", 0, EVT_IN_APP, {
				timespan: span
			});
			monitor.submit();
		}
	});

	var createMonitor = function(options) {
		if (!monitor) {
			if (options.rootDir) {
				scanModuleInfos(options.rootDir);
			}
			monitor = new Monitor(options, options.interval);
			monitor.gather("", 1, EVT_ENTER_APP, {
				timestamp: resumeTime,
				firsttime: firsttime
			});
		}
		return monitor;
	}

	return {
		create: createMonitor
	}
});