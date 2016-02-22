define([
	'text!./calendar.html', 
	'swipe', 
	'moment',
	'zepto',
	'iscroll',
	'./lunarCal',
	'./fx'],
	function(viewTemplate,mySwiper, Moment, $, iscroll, LunarCal, Animation) {
		return Piece.View.extend({

			initDate: new Date(),	// 初始日期
			initViewType: "week",	// 取值"week"或"month",默认显示周视图

			events:
			{
				"click .cal-info":"onActiveDay",
				"click .goBackToToday": "onGoBackToToday",
				"click .cal-next-page":"onGoNext",
				"click .cal-prev-page":"onGoPrev",
				"click .toggleView" : "onToggleView",
				"touchstart #calendar-content":"onTouchBegin",
				"touchmove #calendar-content":"onTouchMoved",
				"touchend #calendar-content":"onTouchEnd"
			},

// public:
			// 获取当前选中日期,没有选中返回undefined
			uiGetActiveDate: function() {
				return  moment(this.activeDate);
			},

			// 设置当前选中日期,日期必须在当前视图内,否则返回false
			//TODO:当当期视图为月视图的时候，日期必须在当期月份内
			uiSetActiveDate: function(date, triggerEvent) {
				if(!date) return false;

				var me = this;
				var old = me.activeDate;
				var type = me.uiGetCurrentViewType();
				var dateStr = moment(date).format("YYYY-MM-DD");
				if(me.activeDate && me.activeDate.format("YYYY-MM-DD") == dateStr) 
					return true;

				var wrapper = type == "week" ? this.weekWrapper : this.monthWrapper;
				var id = "#" + (type == "week" ? "w":"m") + dateStr;
				var elem = $(wrapper.children()[1]).find(id);
				if(!elem || elem.length == 0) return false;

				wrapper.find(".activeDay").removeClass("activeDay");
				elem.closest(".cal-info").addClass("activeDay");

				me.activeDate = moment(date);
				me.uiUpdateCalendarTitle(date);
				
				if(triggerEvent) {
					me.trigger("dateChanged", me, old , moment(date));
				}

				return true;
			},

			// 获取当前的视图类型,周视图返回"week",月视图返回"month"
			uiGetCurrentViewType: function() {
				var me = this;
				if(me.weekSwiper && me.weekWrapper.css("display") != "none")
					return "week";
				else if(me.monthSwiper && me.monthWrapper.css("display") != "none")
					return "month";
			},

			uiSetCurrentViewType: function(type) {
				var me = this;
				var oldType = me.uiGetCurrentViewType();
				if(oldType == type) {
					return;
				}


				me.onTouchBegin({touches:[]});
				me.prepareDragging(null, 0);
				me.finishDragging();
				delete me.dragContext;
			},

			// 获取当前显示的所有日期元素(css为"cal-info")
			uiGetCurrentDateElements: function(){
				// TODO:
			},
			uiSetTodayButtonStyle:function(){
				var today = moment(new Date());
				var activeDay = this.activeDate;

				if(today.format('YYYY-MM-DD') == activeDay.format('YYYY-MM-DD')) {
					this.$el.find('.goBackToToday').css('display', 'none');
				} else {
					this.$el.find('.goBackToToday').css('display', 'inline');
				}
			},
			uiGoBackToToday:function(){		//回到今天的视图
				var me = this;
				var viewType = this.uiGetCurrentViewType();
				var today = new Date();
				//if(!me.uiSetActiveDate(today, true)) {
					if(viewType == 'week') {
						me.uiInitWeekview(today);
					} else {
						me.uiInitMonthview(today);
					}
					me.uiSetActiveDate(today,true);
				//}
				me.uiSetTodayButtonStyle();
				me.trigger("goBackToTodaySucceed", me);
			},

			onGoBackToToday:function(el){
				this.uiGoBackToToday();		//调用组件回到今天的接口
			},

			// 初始化界面,可以重复调用
			uiInitialize: function() {
				var me = this;
				var date = !me.initDate ? new Date():me.initDate;

				// 初始化一些内部参数
				me.calendar = $(me.el);
				me.monthWrapper = this.$el.find("#slider-monthview>.swipe-wrap");	// 月视图容器
				me.weekWrapper = this.$el.find("#slider-weekview>.swipe-wrap");		// 周视图容器
				me.monthSlider = this.$el.find('#slider-monthview');							//月视图容器父元素

				me.activeDate = null;	// 当前选中日期

				if (me.initViewType == "week") 
					me.uiInitWeekview(date);
				else
					me.uiInitMonthview();
				
				me.uiSetActiveDate(date);
				me.uiSetTodayButtonStyle();				//是否显示回到今天按钮
			},
// private:
			render: function() 
			{
				var me = this;

				$(this.el).html(viewTemplate);
				Piece.View.prototype.render.call(this);

				this.uiInitialize();
				this.listenToDragging();
				return this;
			},

			remove: function() {
				Piece.View.prototype.remove.call(this, arguments);
			}, 
			listenToDragging: function() {		//监听开始拖动和拖动结束
				var me = this;
				this.bind('prepareDragging', function(calendar, oldViewType){		//开始滑动
					me.isDraggingAuto = true;
					me.$el.find(".dateMask").show();
				});

				this.bind('finishDragging', function(calendar, oldViewType){		//开始滑动
					me.isDraggingAuto = false;
					me.$el.find(".dateMask").hide();
				});
				this.bind('cancelDragging', function(calendar, oldViewType){		//开始滑动
					me.isDraggingAuto = false;
					me.$el.find(".dateMask").hide();
				});
			},
			// 计算某天所在的周在该月视图中的索引,从0开始
			calcWeekIndexInMonthview: function(date) {
				var monday = this.getMondayBefore(date.format("YYYY-MM-01"));
				var days = parseInt((date._d.getTime() - monday._d.getTime())/ (1000 * 60 * 60 * 24));
				return (days-(days%7))/7;
			},

			isInSameWeek: function(date1, date2) {
				return this.getMondayBefore(date1).format("YYYY-MM-DD") == this.getMondayBefore(date2).format("YYYY-MM-DD");
			},

			isInSameMonth: function(date1, date2) {
				return date1.format("YYYY-MM") == date2.format("YYYY-MM");
			},

			destroyWeekview: function() {
				var me = this;
				var wrapper = me.weekWrapper;
				wrapper.html("");

				if(me.weekSwiper) {
					me.weekSwiper.kill();
					delete me.weekSwiper;
				}
			},

			destroyMonthview: function() {
				var me = this;
				var wrapper = me.monthWrapper;
				wrapper.html("");

				if(me.monthSwiper) {
					me.monthSwiper.kill();
					delete me.monthSwiper;
				}
			},

			// 获取与date同一周的周一的日期, 返回moment类型, 参数可以是Date或者moment或者字符串类型
			getMondayBefore: function(date) {
				var date = moment(date);
				var days = date.days();
				return date.subtract("days", days == 0 ? 6 : days-1);	
			},

			// 加载HTML中的模板week-template, 传入周一的日期作为模板参数
			// 如果需要更改日期样式,可以在派生类中覆写该函数,但必须保留之前的样式名称
			loadWeekTemplate: function(monday, dateIdPrefix) {
				var template = _.template($("#week-template").html());
				return template({dateOfMonday: monday, dateIdPrefix: dateIdPrefix, LunarCal: LunarCal});
			},

			createMonthviewPage: function(monday) {
				var me = this;
				var container = $("<div class='cal-month'></div>");

				for(var i = 0; i < 6; i++) {
					container.append(me.loadWeekTemplate(moment(monday).add("days", 7*i), "m"));
				}
				var monthDate = container.find('.cal-day:nth-child(2)').find('.cal-content').attr('id').substring(1);
				var precentMonth = moment(monthDate).months();

				var dayArr = container.find(".cal-content");
				_.each(dayArr, function(dayInfo) {
					var day = $(dayInfo).attr("id").substring(1);
					if(precentMonth != moment(day).months()) {	//不在一个月内，颜色置浅
						container.find("#m" + day).addClass('cal-other-month');
						container.find("#m" + day).parent().find(".meeting-point").remove();
					}
				});		

				container.find("#m" + moment(new Date()).format("YYYY-MM-DD")).css("color", "#B94326");		//	设置今天为红色
				return container;
			},

			// 初始化周视图,周视图的swipe包含左中右三页,每页7天,可以左右滑动,滑动完成后根据滑动方向移除旧页,加载新页
			// 参数date为该星期中某天的日期, 可以是Date或者moment或者字符串类型
			uiInitWeekview: function(date) {
				var me = this;
				var wrapper = me.weekWrapper;
				var monday = me.getMondayBefore(date);

				me.destroyWeekview();

				wrapper.html("");
				wrapper.append(me.loadWeekTemplate(moment(monday).subtract("days", 7), "w"));
				wrapper.append(me.loadWeekTemplate(moment(monday), "w"));
				wrapper.append(me.loadWeekTemplate(moment(monday).add("days", 7), "w"));
				me.uiSetTodayStyle();
				me.weekSwiper = new Swipe(me.$el.find('#slider-weekview')[0], {
					startSlide: 1,
					speed: 400,
					auto: false,
					continuous: false,
					disableScroll: false,
					stopPropagation: false,
					transitionEnd: function() {
						var idx = me.weekSwiper.getPos();
						if (idx != 1) {
							me.uiWeekviewDidSwipeTo(idx);
							me.trigger("viewDidSwiped", me);
						}
						console.log("weekview transitionEnd:" + idx);
					}
				});
			},

			// 初始化月视图,月视图的原理与周视图类似,区别在于月视图一页包含6周,一周为一行.
			// 参数date为该月中某天的日期, 可以是Date或者moment或者字符串类型
			uiInitMonthview: function(date, csstop, cssheight) {
				var me = this;
				var wrapper = me.monthWrapper;
				var firstDay0 = moment(date).subtract("month", 1).format("YYYY-MM-01");		// 上月1号
				var firstDay1 = moment(date).format("YYYY-MM-01");		// 本月1号
				var firstDay2 = moment(date).add("month", 1).format("YYYY-MM-01");			// 下月1号

				me.destroyMonthview();

				me.uiSetNormalWeek();

				if (!isNaN(csstop)) wrapper.css("top", csstop + "px");
				if (!isNaN(cssheight)) wrapper.css("height", cssheight + "px");

				wrapper.html("");
				wrapper.append(me.createMonthviewPage(me.getMondayBefore(firstDay0)));
				wrapper.append(me.createMonthviewPage(me.getMondayBefore(firstDay1)));
				wrapper.append(me.createMonthviewPage(me.getMondayBefore(firstDay2)));

				me.monthSwiper = new Swipe(me.monthSlider[0], {
					startSlide: 1,
					speed: 400,
					auto: false,
					continuous: false,
					disableScroll: false,
					stopPropagation: false,
					transitionEnd: function() {
						var idx = me.monthSwiper.getPos();
						if (idx != 1) {
							me.uiMonthviewDidSwipeTo(idx);
							me.trigger("viewDidSwiped", me);	//滑动结束发射事件
						}
						console.log("monthview transitionEnd:" + idx);
					}
				});
			},

			uiWeekviewDidSwipeTo: function(idx) {
		  		if(idx == 0 || idx == 2) {
		  			var me = this;
		  			var wrapper = me.weekWrapper;
		  			var date = me.uiGetFirstDateInPage(wrapper, idx);
		  			var active = me.uiGetActiveDate();
		  			
		  			me.uiInitWeekview(date);
		  			me.uiSetTodayStyle();

		  			if(active) {
		  				active = idx == 2 ? active.add("days", 7):active.subtract("days", 7);
		  				me.uiSetActiveDate(active, true);
		  			}
		  			me.uiSetTodayButtonStyle();
		  		}
			},

			uiMonthviewDidSwipeTo: function(idx) {
				if(idx == 0 || idx == 2) {
		  			var me = this;
		  			var wrapper = me.monthWrapper;
		  			var date = me.uiGetFirstDateInPage(wrapper, idx);
		  			var active = me.uiGetActiveDate();
		  			var dateInMonth = date.add("days", 15);	// 第一个日期加上15天可以保证该日期肯定在这个月中

		  			me.uiInitMonthview(dateInMonth);	

		  			if(active) {
		  				if(active.format("YYYY-MM") != dateInMonth.format("YYYY-MM")) 
		  					active = idx == 2 ? active.add("month", 1):active.subtract("month", 1);
		  				me.uiSetActiveDate(active, true);
		  			}
		  			me.uiSetTodayButtonStyle();
		  		}
			},

			// 获取周视图或者月视图的第一个日期,日期存储在元素的id中,格式为"d2014-04-05",参见模板week-template
			uiGetFirstDateInPage: function(wrapper, pageIdx) {
				var id = $(wrapper.children()[pageIdx]).find(".content-day1").first().attr("id");
				return moment(id.substring(1));
			},

			// 用指定的日期更新日历Title
			uiUpdateCalendarTitle: function(date) {
				this.$el.find("#calendar-header>.header-year").html(moment(date).format("YYYY") + "年");
				this.$el.find("#calendar-header>.header-month").html(moment(date).format("M") + "月");
			},
			uiSetTodayStyle:function(){		//显示周视图 今天
				var me = this;
				
				var viewType = me.uiGetCurrentViewType();
				if(viewType == 'month') {
					return;
				}
				var today = moment(new Date());
				me.$el.find('#w' + today.format('YYYY-MM-DD')).css("color","#B94326");
				var week =  today.days();
				week = week == 0 ? 7 : week;
				var weekContainer = me.$el.find('#slider-weekview');
  			
  			var str = weekContainer.find(".cal-day:nth-child(2)").find(".content-day" + week).attr("id").substring(1);
				if(str == today.format('YYYY-MM-DD')){
					var itemId = ".header-day" + week;
					me.$el.find(itemId).text("今天");
				} else{
						me.uiSetNormalWeek();
						weekContainer.find(".cal-content").css("color","");
				} 
			},
			uiSetNormalWeek:function(){		//显示完整的星期一到星期日
				var me = this;
				var numArr = ["一","二","三","四","五","六","日"];
				for(var i = 1; i <= 7; i++){
					itemId =".header-day" + i;
					me.$el.find(itemId).text("星期" + numArr[i-1]);
				}
			},
			onGoNext: function() {
				var type = this.uiGetCurrentViewType();
				if(type == "month")
					this.monthSwiper.next();
				else
					this.weekSwiper.next();
			},

			onGoPrev: function() {
				var type = this.uiGetCurrentViewType();
				if(type == "month")
					this.monthSwiper.prev();
				else
					this.weekSwiper.prev();
			},

			onActiveDay: function(e) {
				var me = this;
				var dateElem = $(e.currentTarget).find(".cal-content");
				if(dateElem.length == 0)
					return;

				var old = me.activeDate;
				var date = dateElem.attr("id").substring(1);
				
				// 月视图下,如果日期不在当前月份,应该跳转
				if(me.uiGetCurrentViewType() == "month") {
					var min = old.format("YYYY-MM-01");
					var max = moment(min).add("month",1).format("YYYY-MM-DD");
					if(date < min) {
						me.activeDate = moment(date).add("month",1);
						me.monthSwiper.prev();
						me.trigger("dateChanged", me, old, moment(date));
					}
					else if(date >= max) {
						me.activeDate = moment(date).subtract("month",1);
						me.monthSwiper.next();
						me.trigger("dateChanged", me, old, moment(date));
					}
					else
						me.uiSetActiveDate(date, true);
				}else {
					me.uiSetActiveDate(date, true);
				}
				me.uiSetTodayButtonStyle();
			},
			onToggleView: function() {
				var me = this;
				if(!this.isDraggingAuto) {
					var view = this.uiGetCurrentViewType();
					var newView = view == "week" ? "month" : "week";
					if(view == "week") {
						var newView = "month";
						me.$el.find(".toggleView").text("周视图");
					} else {
						var newView = "week";
						me.$el.find(".toggleView").text("月视图");
					}
					this.uiSetCurrentViewType(newView);
				}
			},
			onTouchBegin: function(e) {
				if(!this.dragContext) { // 创建Touch上下文, 记录信息用于拖动
					this.dragContext = 
					{
						isDragging: false,		// 拖动开始标志
						lastTouch: null,		// 上次Touch对象
						calendarHeight: 0,		// 准备拖动时calendar元素的高度
						weekviewHeight: 55, 	// 准备拖动时周视图高度
						monthviewTop: 0,		// 准备拖动时月视图的初始Top值,拖动过程中月视图的Top值不能超过它
						weekRowIndex: 0, 		// 周视图的周在月视图中的行号,从0开始
						swipeAccumulateY: 0,	// Y方向上的累积滑动距离
						swipeAccumulateX: 0,	// X方向上的累积滑动距离
						isHorizScrolling: false,	// 是否正在水平滑动,只要X方向上的累计距离大于阀值,该标志开启
						viewTypeBeforeDrag:null	// 拖动开始前的视图类型
					};
				}

				this.dragContext.lastTouch = $.extend({}, e.touches[0]);
				this.trigger('touchEvent',  'touchBegin', this);
			},

			onTouchMoved: function(e) {
				var me =  this;
				var touch = e.touches[0];
				var tolerance = 6;
				var ctx = me.dragContext;
				var deltaY = touch.screenY-ctx.lastTouch.screenY;
				var isDraggingBefore = ctx.isDragging;

				ctx.swipeAccumulateY += deltaY;
				ctx.swipeAccumulateX += touch.screenX-ctx.lastTouch.screenX;
				ctx.lastTouch = $.extend({}, touch);

				if(!ctx.isDragging && !ctx.isHorizScrolling && Math.abs(ctx.swipeAccumulateX) > tolerance) 
					ctx.isHorizScrolling = true;

				if(ctx.isHorizScrolling)
					return;

				if(!ctx.isDragging) {	// 还未开始拉动,记录滑动量, 判断是否应该开始拉动
					var type = me.uiGetCurrentViewType();
					var dy = type == "week" ? ctx.swipeAccumulateY:-ctx.swipeAccumulateY;
					if (dy > tolerance)
						ctx.isDragging = true;
				}

				if(!ctx.isDragging)
					return;

				if(!isDraggingBefore)	// 之前没有在拖动,现在要开始拖动,做一些拖动前的准备工作
					me.prepareDragging(e, deltaY);
				
				me.processDragging(e, deltaY);

				// 必须加上下面两句,否则拖动可能会很卡
				e.preventDefault();		// 阻止事件的默认处理
				e.stopPropagation();	// 阻止事件再派发给其它节点
			},

			onTouchEnd: function(e) {
				var me =  this;
				var ctx = me.dragContext;
				var tolerance = ctx.weekviewHeight;	// 是否拖动成功的阀值
				
				// 根据拖动距离决定应该完成拖动还是取消拖动
				if (ctx.isDragging) {
					var accumulate = ctx.viewTypeBeforeDrag == "week" ? ctx.swipeAccumulateY:-ctx.swipeAccumulateY;
					if(accumulate > tolerance)
						me.finishDragging(e);
					else
						me.cancelDragging(e);
				}
				delete me.dragContext;
				this.trigger('touchEvent', 'touchEnd', this);
			},

			animiateAllOnce: function(elems, duration, callback) {
				var me = this;
				var cnt = elems.length;
				if(duration == undefined) duration = 400;
				_.each(elems, function(el) {
					el.elem.animate(el.csses, {duration: duration, easing: "linear", complete: function() {
						if(--cnt == 0 && callback) callback();
					}});
				});
			},

			finishDragging: function(e) {
				var me = this;
				var ctx = me.dragContext;
				
				var viewType = ctx.viewTypeBeforeDrag;
	
				if(viewType == "week") {		//向下成功
					var monthHeight = ctx.weekviewHeight*6;
					var headHeight = ctx.calendarHeight - ctx.weekviewHeight;
					
					me.destroyWeekview();
					me.$el.find(".toggleView").text("周视图");
					me.weekWrapper.css("display", "inherit");
					me.animiateAllOnce([{elem:me.monthWrapper, csses:{top:"0px",height:monthHeight + "px"}},
										{elem:me.calendar, csses:{height:(headHeight + monthHeight) + "px"}},
										{elem:me.monthSlider, csses:{height:'330px'}}],400, function() {

											me.trigger('viewChanged', me, viewType);		//周视图向月视图切换成功后发射事件
											me.trigger("finishDragging", me);
										});
				}else {			//向上成功
					var monthHeight = Math.abs(ctx.monthviewTop) + ctx.weekviewHeight;
					var headHeight = ctx.calendarHeight - ctx.weekviewHeight*6;
					var activeDate = me.activeDate;
					me.$el.find(".toggleView").text("月视图");
					me.animiateAllOnce([{elem:me.monthWrapper,csses:{top:ctx.monthviewTop + 'px',height:monthHeight + "px"}},
													{elem:me.calendar,csses:{height:(headHeight + ctx.weekviewHeight) + "px"}},
													{elem:me.monthSlider,csses:{height:'55px'}}], 400, function() {
														me.destroyMonthview();
														me.uiInitWeekview(activeDate);
														me.activeDate = null;		
														me.uiSetActiveDate(activeDate);
														me.trigger('viewChanged', me, viewType);		//周视图向月视图切换成功后发射事件
														me.trigger("finishDragging", me);
					});
				}
			},

			cancelDragging: function(e) {
				var me = this;
				var ctx = me.dragContext;
				var viewType = ctx.viewTypeBeforeDrag;

				if(viewType == "week") {		//向下取消
					me.animiateAllOnce([{elem:me.monthWrapper,csses:{top:ctx.monthviewTop + 'px', height:(Math.abs(ctx.monthviewTop)+ctx.weekviewHeight) + "px"}},
										{elem:me.calendar,csses:{height: ctx.calendarHeight + "px"}},
										{elem:me.monthSlider,csses:{height:'55px'}}], 200, function() {
											me.destroyMonthview();		// !!!? 
											me.uiSetTodayStyle();		//还原是否周视图的今天
											me.weekWrapper.css("display", "inherit");	// 还原显示周视图容器
											me.trigger('cancelDragging', me, viewType);		
										});
				}else {		//向上取消
					me.animiateAllOnce([{elem:me.monthWrapper,csses:{top:'0px',height: (ctx.weekviewHeight*6) + "px"}},
						{elem:me.calendar,csses:{height: ctx.calendarHeight + "px"}},
						{elem:me.monthSlider,csses:{height:'330px'}}],200, function(){
							me.trigger('cancelDragging', me, viewType);	
						});
				}
			},

			prepareDragging: function(e, deltaY) {
				var me =  this;
				var ctx = me.dragContext;
				var type = me.uiGetCurrentViewType();
				var activeDate = me.activeDate;
				var activeRow = me.calcWeekIndexInMonthview(activeDate);

				// 周视图高度
				var weekviewHeight = type == "week" ? me.weekWrapper.height():me.monthWrapper.height()/6;

				// 记录Drag上下文,用于计算拖动过程中月视图的Top,Height等
				ctx.weekRowIndex = activeRow;
				ctx.calendarHeight = me.calendar.height();
				ctx.weekviewHeight = weekviewHeight;
				ctx.monthviewTop = -weekviewHeight*activeRow;	// 计算activeRow之前所有行的高度,monthview应该向上缩进这么多
				ctx.viewTypeBeforeDrag = type;
				
				// 周视图下的拖动,我们首先隐藏周视图,然后创建一个临时的月视图,用来拖动.
				// 拖动完成后根据拖动距离决定要取消拖动还是完成拖动
				if (type == "week")  {	
					me.weekWrapper.css("display", "none");	// 隐藏周视图
					me.uiInitMonthview(activeDate, ctx.monthviewTop, Math.abs(ctx.monthviewTop)+weekviewHeight);	// 创建新的月视图用于拖动
					me.calendar.css("height", ctx.calendarHeight + "px");	// 将日历高度调整回未创建月视图之前的高度

					// 设置月视图中的选中日期
					me.activeDate = null;
					me.uiSetActiveDate(activeDate);		
				}
				me.trigger("prepareDragging", me);
			},
			processDragging: function(e, deltaY) {

				var me = this;
				var top = parseInt(me.monthWrapper.css("top"));
				var monthHeight = me.monthWrapper.height();
				var maxMonthHeight = me.dragContext.weekviewHeight*6;
				var minMonthHeight = Math.abs(me.dragContext.monthviewTop) + me.dragContext.weekviewHeight;

				//计算父元素的高度
				var sliderMonthviewHeight = monthHeight + top;		
				
				if(sliderMonthviewHeight < 55) {
					sliderMonthviewHeight = 55;
				} else if(sliderMonthviewHeight > 330) {
					sliderMonthviewHeight = 330;
				}
				
				me.monthSlider.height(sliderMonthviewHeight);

				if (deltaY > 0) { // 向下拉
					if( top < 0) { // 顶部还有部分被隐藏,应继续向下拉顶部
						var dy = (top+deltaY) > 0 ?  -top : deltaY;

						me.monthWrapper.css("top", (top + dy) + "px");
						me.calendar.css("height", (me.calendar.height() + dy) + "px");
					}
					else if(monthHeight < maxMonthHeight) { // top=0之后,再向下拉就拉长月视图的高度
						var dy = monthHeight+deltaY > maxMonthHeight ? maxMonthHeight-monthHeight : deltaY;

						me.monthWrapper.css("height", (monthHeight + dy) + "px");
						me.calendar.css("height", (me.calendar.height() + dy) + "px");
					}
				}
				else if(deltaY < 0) {	// 向上拉
					var monthTop = me.dragContext.monthviewTop;

					deltaY = -deltaY;

					if(monthHeight > minMonthHeight) { // 向上拉时先缩减高度至最小
						var dy = monthHeight-deltaY < minMonthHeight ? (monthHeight-minMonthHeight) : deltaY;
						me.monthWrapper.css("height", (monthHeight - dy) + "px");
						me.calendar.css("height", (me.calendar.height() - dy) + "px");
					}
					else if(top > monthTop) { // 如果高度已经最小,再尝试向上收缩顶部
						var dy = (top-deltaY) < monthTop ? (top-monthTop) : deltaY;
						me.monthWrapper.css("top", (top-dy) + "px");
						me.calendar.css("height", (me.calendar.height() - dy) + "px");
					}
				}
				me.trigger("processDragging", me);
			}
		}); //view define

	});