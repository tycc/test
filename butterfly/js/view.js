define(['backbone','butterfly/view-animate'], function(Backbone,animationExtentions){

	// Butterfly View
	// ==============

	var View =  Backbone.View.extend({

		//default event
		events: {
			"click a[data-action='back']": "goBack"
		},

		goBack: function(){
			window.history.back();
		},

		//add superview & subviews property
		constructor: function(options){
			if(options)this.superview = options.superview;
			this.subviews = [];

			Backbone.View.apply(this, arguments);
		},

		//remove superview & subviews reference
		remove: function(){
			Backbone.View.prototype.remove.call(this);

			this.superview = null;
			_.each(this.subviews, function(subview){
				subview.remove();
			});
		},

		//find a subview
		//Breadth First Search
		find: function(id, deep){
			var result = _.find(this.subviews, function(subview){
				return subview.el.id == id;
			});

			if (deep && !result) {
				var container = _.find(this.subviews, function(subview){
					return subview.find(id);
				});
				result = container.find(id);
			}

			return result;
		},

		addSubview: function(view){
			this.subviews.push(view);
		},

		/* show this view */
		show: function(options) {
			if(this.shown === true) return;
			this.shown = true;
			$(this.el).show();
			this.onShow(options);
		},
		/* hide this view */
		hide: function(){
			if(this.shown === false) return;
			this.shown = false;
			$(this.el).hide();
			this.onHide();
		},

		//events
		onShow: function(options){
			$(window).on('orientationchange', this.onOrientationchange);
			$(window).on('resize', this.onWindowResize);
			$(window).on('scroll', this.onWindowScroll);

			_.each(this.subviews, function(subview) {
				subview.onShow(options);
			});
		},
		onHide: function(){
			$(window).off('orientationchange', this.onOrientationchange);
			$(window).off('resize', this.onWindowResize);
			$(window).off('scroll', this.onWindowScroll);

			_.each(this.subviews, function(subview) {
				subview.onHide();
			});
		},

		onOrientationchange: function() {
			this.$('input').blur();
		},

		onWindowScroll: function() {},

		onWindowResize: function() {},

		route: function(){}
	});
    //add to View prototype
	_.extend(View.prototype, animationExtentions);
	return View;
});
