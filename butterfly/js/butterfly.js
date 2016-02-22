(function(root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['exports', 'underscore', 'jquery', 'backbone', 'view'], function(exports, _, $, Backbone, ViewPlugin){
			root.Butterfly = factory(root, exports, _, $, Backbone, ViewPlugin);
		});

	} else {
		root.Butterfly = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$), Backbone);
	}

})(this, function(root, Butterfly, _, $, Backbone, ViewPlugin){

	// Plugin System
	// ---------------

	// use a plugin in all view instances
	Backbone.View.use = function(Plugin) {
		_.extend(this.prototype, Plugin);
		return this;
	}

	// use plugin in this view instance
	Backbone.View.prototype.use = function(Plugin) {
		_.extend(this, Plugin);
		return this;
	}

	//Butterfly start
	Butterfly.VERSION = '1.1';

  // Butterfly.Router
  // ---------------
  //
  var Router = Butterfly.Router = Backbone.Router.extend({
		routes: {
			'*path(?*queryString)': 'any',
		},
		any: function(path, queryString){
//			console.log('route: %s ? %s', path, queryString);

			if(queryString) {
				queryString = decodeURI(queryString);
				var queryObj = JSON.parse('{"' + queryString.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
				this.routingOptions = $.extend({}, queryObj, this.routingOptions);
				this.routingOptions['queryString'] = queryString;
			}

			root.butterfly.route(path, this.routingOptions);
			delete this.routingOptions;
		}
	});

  // hack of Backbone.history.navigate
  // so when call Backbone.history.navigate, we can pass options to our route
  var backboneNavigate = Backbone.history.navigate;
  Backbone.history.navigate = function(fragment, options) {
  	root.butterfly.navigate(fragment, options);
  }

  Butterfly.history = Backbone.history;

  // hack of window.history
  // so we can pass options to our route.
  // like this: window.history.go('somepage',options)
  // or like this: window.history.go(-1, options)
  // or like this: window.history.back(options)
  var browserGo = window.history.go;
  var browserBack = window.history.back;
  window.history.go = function(dest,options) {
  	root.butterfly.back(dest, options);
  };
  window.history.back = function(options) {
  	root.butterfly.back(undefined, options);
  };


  // Butterfly.Application
  // ---------------
  //
	var Application = Butterfly.Application = function(el){
		this.el = el;
	};
	_.extend(Application.prototype, Backbone.Events);
	_.extend(Application.prototype, {

		navigate: function(fragment, options){
			//default options
			options = options || {trigger: true};
			//default trigger
			options.trigger = (options.trigger == undefined) ? true : options.trigger;
			//pass params
			this.router.routingOptions = options;

			backboneNavigate.call(Backbone.history, fragment, options);
		},

		back: function(dest, options) {
			var t = typeof dest;
			if(t === "string") {
				// Todo: ugly but no choice now!
				if(this.rootView.backTo) {
					this.rootView.backTo(dest,options);
				}else {
					console.error('root view不支持backTo方法');
				}
			}else if(t === "number") {
				this.router.routingOptions = options;
				browserGo.call(window.history, dest);
			}else {
				this.router.routingOptions = options;
				browserBack.call(window.history);
			}
		},

		route: function(path, options){
			if (this.rootView.route) {
				this.rootView.route(path, options);
			}else {
				console.error('rootView不支持route方法');
			} 
		},

		//launch application
		fly: function(){
			var me = this;

			this.scanRootView(function(view) {
				me.rootView = view;
				me.router = new Butterfly.Router();

				var pathname = window.location.pathname;
				var rootPath = pathname.substr(0, pathname.lastIndexOf('/'));
//				console.log("start history with root: [%s]", rootPath);
				Backbone.history.start({
					pushState: false,
					root: rootPath
				});

				view.render();
				view.show();

			}, function(err) {

				console.error("fail to load root view: %s", err);
				throw err;
			});

			return this;
		},

		scanRootView: function(success, fail){
			var me = this;

			var rootView = this.el.querySelector('[data-view]');
			if (!rootView) {
				throw new Error('root view not found');
			}

			// 向前兼容,默认给rootView添加has-subview属性
			rootView.setAttribute('has-subview','true');

			ViewPlugin.loadView(rootView, function(View){

				var view = new View();

				success(view);

			}, fail);
		}

	});

	Butterfly.Application.extend = Backbone.Router.extend;

	var run = function(AppClass) {
		root.butterfly = new AppClass(document.body);
		root.butterfly.fly();
	};

	$(function(){
		var path = $(document.body).attr('application');
		if(path) {
			require([path], function(MyApp) {
				if(!_.isFunction(MyApp) || !_.isFunction(MyApp.prototype.fly)) {
					var error = '自定义Application必须从Butterfly.Application继承';
					throw new Error(error);
				}else {
					run(MyApp);
				}
			});
		}else {
			run(Application);
		}
	});

	return Butterfly;
});
