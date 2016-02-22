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
            screenHeight = $(window).height(),
            firstInit = true;
        return View.extend({
            events: {
                "click .back": "goBack",
                "click #map": "showOrHide",
                "click #welcome": "showWelcome",
                "click #activity": "showActivity",
                "click #marker2,#vienna2" : "goStep2",
                "click #marker4,#vienna4" : "goStep4",//缴费
                "click #marker5,#vienna5" : "goStep5"//缴费
            },
            onShow: function() {
                var me = this,
                    footerFrom = "迎新";

                me.loadFooter(footerFrom); //加载底部导航栏
                // me.initListView();//初始化listView
                // me.countdown(me,"2015-12-4 15:20:40",me.$el.find(".countdownText")[0]);
                // this._initScroll();
                setTimeout(function(){
                    me.initMap();
                },100);
            },
            goStep2: function(e) {
                butterfly.navigate("welcome/newStudentReport.html")
            },
            goStep4: function(e) {
                butterfly.navigate("welcome/payTution.html")
            },
            goStep5: function(e) {
                butterfly.navigate("welcome/applyCard.html")
            },
            _initScroll: function() {
                myScroll = new IScroll('.wrapper', {
                    scrollX: true,
                    zoom: true,
                    zoomMin: 1,
                    zoomMax: 4,
                    click: true,
                    disableMouse: true,
                    disablePointer: true
                });
                $("img").load(function() {
                    myScroll.scrollTo(300, 320);
                    myScroll.refresh();
                });
            },
            //加载底部导航栏
            loadFooter: function(footerFrom) {
                var footer = new Footer({
                    'from': footerFrom
                });
                this.$el.find('.content').append(footer.$el);
            },
            initMap: function() {
                var extent = [0, 0, 737, 964];
                var projection = new ol.proj.Projection({
                    code: 'xkcd-image',
                    units: 'pixels',
                    extent: extent,
                });

                map = new ol.Map({
                    layers: [
                        new ol.layer.Image({
                            source: new ol.source.ImageStatic({
                                attributions: [
                                    new ol.Attribution({
                                        html: '&copy; <a href="http://xkcd.com/license.html">xkcd</a>'
                                    })
                                ],
                                url: '../welcome/img/map.jpg',
                                projection: projection,
                                imageExtent: extent
                            })
                        })
                    ],
                    target: 'map',
                    view: new ol.View({
                        projection: projection,
                        center: ol.extent.getCenter(extent),
                        zoom: 1,
                        maxZoom: 3,
                        minZoom: 1
                    })
                });

                this.resize(map);
                this.markDone();//设置已近完成的流程为灰
                var mark = this.$("#step").html();
                if(mark.trim() != ""){
                    //初始化迎新流程
                    this.initWelcomeStep();

                    //初始化活动
                    this.initActivity();
                    this.$(".activity-icon").hide();
                }
            },
            addMark: function(map, posArr, marker, text) {
                var pos = posArr;

                if (marker && marker != "") {
                    // Vienna marker
                    var marker = new ol.Overlay({
                        position: pos,
                        // positioning: 'center-center',
                        element: document.getElementById(marker),
                        stopEvent: false
                    });
                    map.addOverlay(marker);
                }

                if (text && text != "") {
                    // Vienna label
                    var vienna = new ol.Overlay({
                        position: pos,
                        element: document.getElementById(text)
                    });
                    map.addOverlay(vienna);
                }
            },
            markDone: function(){
                var signType = window.sessionStorage['signUp'];
                if(signType && signType != "" && signType != null){
                    this.$("#vienna2>div").addClass('step-done');
                }
                var payType = window.sessionStorage['payTution'];
                if(payType && payType != "" && payType != null){
                    this.$("#vienna4>div").addClass('step-done');
                }

                var cardType = window.sessionStorage['applyCard'];
                if(cardType && cardType != "" && cardType != null){
                    this.$("#vienna5>div").addClass('step-done');
                }
            },
            resize: function(mymap) {
                var mapSize = map.getSize(),
                    fitWidth = mapSize[0],
                    fitHeight = mapSize[1];
                fitWidth = fitWidth>screenWidth ?screenWidth:fitWidth;
                fitHeight = fitHeight>(screenHeight-44-51) ? (screenHeight-44-51):fitHeight;
                // fitWidth  = fitWidth * 0.6;
                // fitHeight  = fitHeight * 0.6;
                // mymap.getView().fit([0,0,fitWidth, fitHeight], map.getSize(),{minResolution:1});
            },
            showOrHide: function() { //显示与隐藏右上角按钮
                var me = this;
                if ($("#activity").css("display") == "none") {
                    $("#activity").fadeIn();
                    $("#welcome").fadeIn();
                } else {
                    $("#activity").animate({
                        width: 'toggle',
                        opacity: 'toggle'
                    }, "slow");
                    setTimeout(function() {
                        me.$("#welcome").animate({
                            width: 'toggle',
                            opacity: 'toggle'
                        }, "slow");
                    }, 200);
                }
            },
            initWelcomeStep: function() {
                var posArr = [450, 250];
                this.addMark(map, posArr, 'marker1', 'vienna1');

                posArr = [160, 800];
                this.addMark(map, posArr, 'marker2', 'vienna2');

                posArr = [120, 550];
                this.addMark(map, posArr, 'marker3', 'vienna3');

                posArr = [380, 450];
                this.addMark(map, posArr, 'marker4', 'vienna4');

                posArr = [360, 700];
                this.addMark(map, posArr, 'marker5', 'vienna5');

            },
            initActivity: function() {
                var posArr = [100, 480];
                this.addMark(map, posArr, 'activity1');

                posArr = [350, 500];
                this.addMark(map, posArr, 'activity2');

                posArr = [330, 280];
                this.addMark(map, posArr, 'activity3');

                posArr = [150, 700];
                this.addMark(map, posArr, 'activity4');
            },
            showActivity: function() { //显示活动
                //隐藏迎新流程
                this.hideWelcome();
                this.$("#activity").removeClass('unchoose');
                this.$("#activity").addClass('choose');
                this.$("#welcome").removeClass('choose');
                this.$("#welcome").addClass('unchoose');
                var me = this;
                $("#activity1").fadeIn();
                setTimeout(function() {
                    me.$("#activity2").fadeIn();
                    setTimeout(function() {
                        me.$("#activity3").fadeIn();
                        setTimeout(function() {
                            me.$("#activity4").fadeIn();
                            setTimeout(function() {
                                me.$("#activity5").fadeIn();
                            }, 200);
                        }, 200);
                    }, 200);
                }, 200);
            },
            hideActivity: function() { //隐藏活动
                var me = this;
                $("#activity1").fadeOut();
                me.$("#activity2").fadeOut();
                me.$("#activity3").fadeOut();
                me.$("#activity4").fadeOut();
                me.$("#activity5").fadeOut();

            },
            showWelcome: function() { //显示迎新流程
                var me = this;
                // 先隐藏活动
                me.hideActivity();
                this.$("#welcome").removeClass('unchoose');
                this.$("#welcome").addClass('choose');
                this.$("#activity").removeClass('choose');
                this.$("#activity").addClass('unchoose');

                $("#marker1").fadeIn();
                $("#vienna1").fadeIn();
                setTimeout(function() {
                    me.$("#marker2").fadeIn();
                    me.$("#vienna2").fadeIn();
                    setTimeout(function() {
                        me.$("#marker3").fadeIn();
                        me.$("#vienna3").fadeIn();
                        setTimeout(function() {
                            me.$("#marker4").fadeIn();
                            me.$("#vienna4").fadeIn();
                            setTimeout(function() {
                                me.$("#marker5").fadeIn();
                                me.$("#vienna5").fadeIn();
                            }, 200);
                        }, 200);
                    }, 200);
                }, 200);
            },
            hideWelcome: function() { //隐藏迎新流程
                var me = this;
                $("#marker1").fadeOut();
                $("#vienna1").fadeOut();
                me.$("#marker2").fadeOut();
                me.$("#vienna2").fadeOut();
                me.$("#marker3").fadeOut();
                me.$("#vienna3").fadeOut();
                me.$("#marker4").fadeOut();
                me.$("#vienna4").fadeOut();
                me.$("#marker5").fadeOut();
                me.$("#vienna5").fadeOut();
            },
        }); //view define
    });
