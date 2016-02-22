define(['butterfly/view'], function(View) {

  var animations = {
    slideInRight: { go: "slideInRight", back: "slideOutRight" },
    slideInUp: { go:  "slideInUp", back: "slideOutDown" },
    slideInDown: { go:  "slideInDown", back: "slideOutUp" },
    fadeIn: { go: "fadeIn", back: "fadeOut" },
    fadeInUp: { go: "fadeInUp", back: "fadeOutDown" },
    fadeInDown: { go: "fadeInDown", back: "fadeOutUp" },
    fadeInDownBig: { go: "fadeInDownBig", back: "fadeOutUpBig" },
    fadeInUpBig: { go: "fadeInUpBig", back: "fadeOutDownBig" },
    fadeInRight: { go: "fadeInRight", back: "fadeOutRight" },
    fadeInRightBig: { go: "fadeInRightBig", back: "fadeOutRightBig" }
  };

  var viewChangedEvent = "viewchanged";

  var animationFinished = function(isGoBack, currentView, nextView, options) {
    if(isGoBack) {
      currentView.onHide();
      nextView.onShow(options);
      currentView.remove();
    }else {
      currentView.onHide();  
      nextView.onShow(options); 
    }
    window.butterfly.trigger(viewChangedEvent, { 
      isGoBack:isGoBack,
      currentView: currentView, 
      nextView:nextView, 
      options: options
    });
  };
  
  var doAnimate = function(isGoBack, currentView, nextView, options) {
    var effect = options && options.effect;

    if(effect === undefined) effect = "slideInRight";

    if (effect !== null && typeof effect === "object") {
      var action = isGoBack ? effect.back : effect.go;
      if(typeof action === "function") {
        action(currentView, nextView ,function() {
          animationFinished(isGoBack, currentView, nextView, options);
        });
      }else {
        animationFinished(isGoBack, currentView, nextView, options);
      }
    }else if(typeof effect === "string" && animations[effect]) { 
      var anim = isGoBack ? animations[effect].back:animations[effect].go;
      var view = isGoBack ? currentView:nextView;
      if(anim) {
        view.animate(anim, function(){
          animationFinished(isGoBack, currentView, nextView, options);
        });
      }else {
        animationFinished(isGoBack, currentView, nextView, options);
      }
    }else {
      animationFinished(isGoBack, currentView, nextView, options);
    }
  };

  //show only contain one direct subview
  return View.extend({

    initialize: function(options) {
      View.prototype.initialize.apply(this, arguments);

      // stack to store the views, [{path: 'a', view: a}, {path: 'b', view: b}]
      this.stack = [];
      this.baseZIndex = 100;

      // using this variable to indicate this container has routed once already
      // to stop the animation from first route
      // this check is no needed for normal case
      this.routedOnce = false;
    },

    render: function() {
      _.each(this.stack, function(item) {
        item.view.render();
      });
    },

    //pass on the 'onShow' event to the top subview
    onShow: function(options) {
      var currentView = this.stack[this.stack.length - 1].view;
      currentView.onShow(options);
    },

    addSubview: function(view,options) {
      View.prototype.addSubview.apply(this, arguments);
      view.$el.css({
        'position': 'absolute',
        'top': '0px',
        'bottom': '0px',
        'width': '100%',
        'z-index': this.baseZIndex++
      });

      this.stack.push({path: "", view: this.subviews[0]});
    },

    currentView: function() {
      if(this.stack.length>1) {
        return this.stack[this.stack.length-1].view;
      }
    },

    // 检查回退的级数,不传参表示检查当前url.返回0表示不是回退
    checkBackLevel: function(url) {
      if(url === undefined) url = window.location.hash;
      var level = 0;
      for (var i = this.stack.length - 2; i >= 0; i--) {
        if(this.stack[i].path == url) {
          level = this.stack.length - i -1;
          break;
        }
      };
      return level;
    },

    backTo: function(dest, options) {
      if(typeof dest === "string" && dest[0] != "#") {
        dest = "#" + dest;
      }
      var level = this.checkBackLevel(dest);
      if(level === 0) {
        console.log('backTo: 回退的url不正确');
      }else {
        window.history.go(-level, options);
      }
    },

    route: function(paths, options) {
      var me = this;

      if (this.stack.length == 1 && !paths) {
        return;
      }

      // check is this route is intent to go back,and get back level
      var backLevel = this.checkBackLevel();
      // 2 top views in the stack
      var currentView = this.stack[this.stack.length -1].view;

      if (backLevel > 0) {

        var elem = this.stack[this.stack.length-1-backLevel];
        var nextView = elem.view;
        var popCnt = backLevel;

        while(popCnt > 0) {
          var elem = this.stack.pop();
          if(popCnt < backLevel)  {
            elem.view.onHide();
            elem.view.remove();
          }
          popCnt--;
          this.baseZIndex--;
        }

        options = _.extend(elem.options || {}, options);

        //show next
        doAnimate(true, currentView, nextView, options);

      } else {

        //load view using butterfly plugin
        require(['view!' + paths], function(ViewClass){

          var newView = new ViewClass();
          newView.$el.css({
            'position': 'absolute',
            'top': '0px',
            'bottom': '0px',
            'width': '100%',
            'z-index': me.baseZIndex++
          });

          me.stack.push({path: window.location.hash, view: newView, options: options});

          newView.render(options);
          me.el.appendChild(newView.el);

          //如果是第一次route，则不显示动画
          if (me.routedOnce) {
            doAnimate(false, currentView, newView, options);
          }else {
            animationFinished(false, currentView, newView, options);
          }

          me.routedOnce = true;
        }, function(err){
          //TODO: without trigger
          //window.history.back();
          alert('页面加载失败');
        });

      }
    }
  });
});