define([
  'notification',
  'shared/plugin_dialog/js/dialog'
], function(Notification,Dialog){
  Backbone.on('PushNotificationArrived',function(dataArr){
    var fromBar=dataArr[0],msg=dataArr[1];
    console.log('fromBar: ',fromBar);
    console.log('msg :',msg);
    console.log('...',!msg||'report'!=msg.moduleid);
    //事件处理
    // msg=msg.extras;
    var currentPath=Backbone.history.fragment;
    if(fromBar){
        butterfly.navigate('contact/messagesDetail.html', {
          trigger:true,
          uid: "admin",
          nickname: "admin",
          source: "admin",
          msg: msg
        });
    }

    //
    // Dialog.createDialog({
    //   closeBtn: false,
    //   buttons: {
    //     '取消': function() {
    //       this.close();
    //     },
    //     '确定': function() {
    //       navigator.app.exitApp();
    //       this.close();
    //     }
    //   },
    //   content: '是否退出程序?',
    //   title: '退出'
    // });
  });
});