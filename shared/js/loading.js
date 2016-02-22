define(['backbone', 'spin'], function(Backbone, Spinner) {

	return Backbone.View.extend({

			className: 'loading-mask',

			defaults: {
				lines: 10, // The number of lines to draw
				length: 0, // The length of each line
				width: 8, // The line thickness
				radius: 14, // The radius of the inner circle
				corners: 1,
				color: 'dodgerblue', // #rbg or #rrggbb
				speed: 2, // Rounds per second
				trail: 90, // Afterglow percentage
				shadow: false, // Whether to render a shadow
				hwaccel: true, // Whether to use hardware acceleration
				msg: "正在加载中...",
				parentEl: document.body
			},

			initialize: function(options) {
				var opt = _.extend(this.defaults, options);

				var div = document.createElement("div");
				div.id = "loading";
				this.el.appendChild(div);
				var div2 = document.createElement("div");
				div2.className = "loadContent";
				div2.innerHTML = opt.msg;
				div.appendChild(div2);
				opt.parentEl.appendChild(this.el);


				this.spinner = new Spinner(opt).spin(div);
			},

			hide: function() {
				this.el.classList.remove('active');
			},

			show: function() {
				this.el.classList.add('active');
			},

			remove: function() {
				if (this.spinner) this.spinner.stop();
				Backbone.View.prototype.remove.call(this, arguments);
			}

		}
		/*, {
				show: function(options) {
					n = new this(options);
					n.show();
				},
				hide: function(options) {
					if (n) {
						n.hide();
					}
				}
			}*/
	);
});