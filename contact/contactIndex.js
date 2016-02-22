define([
        'butterfly/view',
        'butterfly',
        'main/footer',
        'swipe',
        'css!contact/contactIndex.css'
    ],
    function(View, Butterfly, Footer) {
        return View.extend({
            events: {
            },
            render:function(){
                var me = this;
            },
            onShow: function() {
                var me = this;
                footerFrom = "通讯录";
                me.loadFooter(footerFrom); //加载底部导航栏
            },
            //加载底部导航栏
            loadFooter: function(footerFrom) {
                var footer = new Footer({
                    'from': footerFrom
                });
                this.$el.find('.content').append(footer.$el);
            }
        }); //view define
    });
