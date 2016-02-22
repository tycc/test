define(['butterfly/StackView'], function(StackView) {
  return StackView.extend({
    route: function(paths, options) {
      var cnt = 0;
      var backLevel = this.checkBackLevel();
      
      if (backLevel > 0) {  // 回退到最近一个非PopupView
        for (var i = this.stack.length-backLevel-1; i >= 0; i--,cnt++) {
          var elem = this.stack[i];
          if(!elem.options || !elem.options.isPopupView) {
            break;
          }
        }
      }

      if(cnt > 0) {
        setTimeout(function(){
          window.history.go(-cnt,options);
        },0);
      }else {
        StackView.prototype.route.apply(this, arguments);
      }
    }
  });
});