define([
        'butterfly/view',
        'butterfly',
        'main/footer',
        'iscroll',
        'text!bootstrap/bootstrap.css'
    ],
    function(View, Butterfly, Footer, IScroll) {
        var map;
        var myScroll;
        var screenWidth = $(window).width(),
            screenHeight = $(window).height();
        return View.extend({
            events: {
                "click .back": "goBack",
                "click #signUp" :"payTution"
            },
            onShow: function() {
                this.$("#stuInfo").fadeIn();
            },
            payTution: function(){
                //点击确定报名，设置session，方便修改首页流程样式
                window.sessionStorage['signUp'] = true;
                // butterfly.navigate("welcome/payTution.html");
                butterfly.navigate("welcome/bindPhone.html");
            }
        }); //view define
    });
