/* 
 * 日期插件
 * 滑动选取日期（年，月，日）
 * V1.1
 */

define(['iscroll',
    'moment',
    'css!../css/common'
], function(IScroll, moment) {
    var me = {};
     me.datecancle = function(callback) {
         $("#datePage").hide();
         $("#dateshadow").hide();
         if (callback) {
             callback();
         }
     };

    var DatePick = function($) {
        $.fn.date = function(options, Ycallback, Ncallback) {
            //插件默认选项
            var that = $(this);
            var thatParents = that.parents(".content").parent(); //
            var docType = $(this).is('input');
            $.fn.date.defaultOptions = {
                    beginyear: 1900, //日期--年--份开始
                    endyear: 2100, //日期--年--份结束
                    beginmonth: 1, //日期--月--份结束
                    endmonth: 12, //日期--月--份结束
                    beginday: 1, //日期--日--份结束
                    endday: 31, //日期--日--份结束
                    beginhour: 1,
                    endhour: 12,
                    beginminute: 00,
                    endminute: 59,
                    curdate: false, //打开日期是否定位到当前日期
                    theme: "date", //控件样式（1：日期，2：日期+时间）
                    mode: null, //操作模式（滑动模式）
                    event: "click", //打开日期插件默认方式为点击后后弹出日期 
                    show: true
                }
                //用户选项覆盖插件默认选项   
            var opts = $.extend(true, {}, $.fn.date.defaultOptions, options);

            var datetime = false;
            var nowdate;
            if (options.time) {
                nowdate = moment(options.time)._d;
            } else {
                nowdate = new Date();
            }
            var indexY = 1,
                indexM = 1,
                indexD = 1;
            var indexH = 1,
                indexI = 1,
                indexS = 0;
            var initY = parseInt(nowdate.getFullYear() - opts.beginyear);
            var initM = parseInt(nowdate.getMonth() + "") + 1;
            var initD = parseInt(nowdate.getDate() + "");
            var initH = parseInt(nowdate.getHours());
            var initI = parseInt(nowdate.getMinutes());
            // var initS = parseInt(nowdate.getYear());
            var yearScroll = null,
                monthScroll = null,
                dayScroll = null;
            var HourScroll = null,
                MinuteScroll = null,
                SecondScroll = null;

            if (opts.theme === "datetime") {
                datetime = true;
            }
            if (!opts.show) {
                that.unbind('click');
            } else {
                //绑定事件（默认事件为获取焦点）

                that.bind(opts.event, function() {
                    if (me.time) {
                        nowdate = moment(me.time)._d;
                        indexY = 1;
                        indexM = 1;
                        indexD = 1;
                        indexH = 1;
                        indexI = 1;
                        indexS = 0;
                        initY = parseInt(nowdate.getFullYear() - opts.beginyear);
                        initM = parseInt(nowdate.getMonth() + "") + 1;
                        initD = parseInt(nowdate.getDate() + "");
                        initH = parseInt(nowdate.getHours());
                        initI = parseInt(nowdate.getMinutes());
                        // initS = parseInt(nowdate.getYear());
                    }
                    createUL(); //动态生成控件显示的日期
                    init_iScrll(); //初始化iscrll
                    extendOptions(); //显示控件
                    that.blur();
                    if (datetime) {
                        showdatetime();
                        refreshTime();
                    } else {
                        $("#timemark").hide();
                    }
                    refreshDate();
                    bindButton();
                })
            };

            function refreshDate() {
                yearScroll.refresh();
                monthScroll.refresh();
                dayScroll.refresh();

                resetInitDete();
                yearScroll.scrollTo(0, initY * 40, 0, true);
                monthScroll.scrollTo(0, initM * 40 - 40, 0, true);
                dayScroll.scrollTo(0, initD * 40 - 40, 0, true);
            }

            function refreshTime() {
                HourScroll.refresh();
                MinuteScroll.refresh();
                SecondScroll.refresh();
                if (initH > 12) { //判断当前时间是上午还是下午
                    SecondScroll.scrollTo(0, initD * 40 - 40, 100, true); //显示“下午”
                    initH = initH - 12 - 1;
                }
                HourScroll.scrollTo(0, (initH - 1) * 40, 100, true);
                MinuteScroll.scrollTo(0, initI * 40, 100, true);
                initH = parseInt(nowdate.getHours());
            }

            function resetInitDete() {
                if (opts.curdate) {
                    return false;
                } else if (that.val() === "") {
                    return false;
                }
                initY = parseInt(that.val().substr(2, 2));
                initM = parseInt(that.val().substr(5, 2));
                initD = parseInt(that.val().substr(8, 2));
            }

            function bindButton() {
                thatParents.find("#dateconfirm").unbind('click').click(function() {
                    console.info("dateconfirm "+indexD);

                    var datestr = thatParents.find("#yearwrapper ul li:eq(" + indexY + ")").html() + "-" +
                        thatParents.find("#monthwrapper ul li:eq(" + indexM + ")").html() + "-" +
                        thatParents.find("#daywrapper ul li:eq(" + Math.round(indexD) + ")").html();
                    if (datetime) {
                        if (Math.round(indexS) === 1) { //下午
                            thatParents.find("#Hourwrapper ul li:eq(" + indexH + ")").html(parseInt(thatParents.find("#Hourwrapper ul li:eq(" + indexH + ")").html().substr(0, thatParents.find("#Hourwrapper ul li:eq(" + indexH + ")").html().length - 1)) + 12)
                        } else {
                            thatParents.find("#Hourwrapper ul li:eq(" + indexH + ")").html(parseInt(thatParents.find("#Hourwrapper ul li:eq(" + indexH + ")").html().substr(0, thatParents.find("#Hourwrapper ul li:eq(" + indexH + ")").html().length - 1)))
                        }
                        datestr += " " + thatParents.find("#Hourwrapper ul li:eq(" + indexH + ")").html().substr(0, thatParents.find("#Minutewrapper ul li:eq(" + indexH + ")").html().length - 1) + ":" +
                            thatParents.find("#Minutewrapper ul li:eq(" + indexI + ")").html().substr(0, thatParents.find("#Minutewrapper ul li:eq(" + indexI + ")").html().length - 1);
                        indexS = 0;
                    }

                    if (Ycallback === undefined) {
                        if (docType) {
                            that.val(datestr);
                        } else {
                            that.html(datestr);
                        }
                    } else {
                        Ycallback(datestr);
                    }
                    thatParents.find("#datePage").hide();
                    thatParents.find("#dateshadow").hide();
                });
                thatParents.find("#datecancle").click(function() {
                    thatParents.find("#datePage").hide();
                    thatParents.find("#dateshadow").hide();
                    Ncallback(false);
                });
            }

            function extendOptions() {
                    thatParents.find("#datePage").show();
                    thatParents.find("#dateshadow").show();
                }
                //日期滑动
            function init_iScrll() {
                var strY = thatParents.find("#yearwrapper ul li:eq(" + indexY + ")").html().substr(0, thatParents.find("#yearwrapper ul li:eq(" + indexY + ")").html().length - 1);
                var strM = thatParents.find("#monthwrapper ul li:eq(" + indexM + ")").html().substr(0, thatParents.find("#monthwrapper ul li:eq(" + indexM + ")").html().length - 1)
                var yearwrapperArr = thatParents.find("#yearwrapper");
                var yearwrapperEl = yearwrapperArr[yearwrapperArr.length - 1];
                yearScroll = new iScroll(yearwrapperEl, {
                    snap: "li",
                    vScrollbar: false,
                    onScrollEnd: function() {
                        indexY = Math.round(this.y / 40) * (-1) + 1;
                        opts.endday = checkdays(strY, strM);
                        thatParents.find("#daywrapper ul").html(createDAY_UL());
                        thatParents.find("#yearwrapper").find("li").removeClass("activeYear");
                        thatParents.find("#y" + (indexY + opts.beginyear - 1)).addClass("activeYear");
                        thatParents.find("#daywrapper").find("li").removeClass("activeDay");
                        thatParents.find("#d" + indexD).addClass("activeDay");
                        dayScroll.refresh();
                    }
                });
                var monthwrapperArr = thatParents.find("#monthwrapper");
                var monthwrapperEl = monthwrapperArr[monthwrapperArr.length - 1];
                monthScroll = new iScroll(monthwrapperEl, {
                    snap: "li",
                    vScrollbar: false,
                    onScrollEnd: function() {
                        indexM = Math.round(this.y / 40) * (-1) + 1;
                        opts.endday = checkdays(strY, strM);
                        // var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                        // opts.endday = monthDays[indexM - 1];
                        // var year = parseInt("20" + "" + (indexY - 1));
                        // var isLeapYearIndex = year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
                        // if (isLeapYearIndex && indexM == 2) {
                        //     opts.endday = 29;
                        // }
                        thatParents.find("#daywrapper ul").html(createDAY_UL());
                        thatParents.find("#monthwrapper").find("li").removeClass("activeMonth");
                        var month = indexM > 9 ? indexM : "0" + indexM;
                        thatParents.find("#m" + month).addClass("activeMonth");
                        thatParents.find("#daywrapper").find("li").removeClass("activeDay");
                        thatParents.find("#d" + indexD).addClass("activeDay");
                        dayScroll.refresh();
                    }
                });
                var daywrapperArr = thatParents.find("#daywrapper");
                var daywrapperEl = daywrapperArr[daywrapperArr.length - 1];
                dayScroll = new iScroll(daywrapperEl, {
                    snap: "li",
                    vScrollbar: false,
                    onScrollEnd: function() {
                        indexD = Math.round(this.y / 40) * (-1) + 1;
                        console.info("onScrollEnd day "+indexD);
                        
                        thatParents.find("#daywrapper").find("li").removeClass("activeDay");
                        thatParents.find("#d" + indexD).addClass("activeDay");
                    }
                });
            }

            function showdatetime() {
                init_iScroll_datetime();
                addTimeStyle();
                thatParents.find("#datescroll_datetime").show();
                thatParents.find("#Hourwrapper ul").html(createHOURS_UL());
                thatParents.find("#Minutewrapper ul").html(createMINUTE_UL());
                thatParents.find("#Secondwrapper ul").html(createSECOND_UL());
            }

            //日期+时间滑动
            function init_iScroll_datetime() {
                HourScroll = new iScroll("Hourwrapper", {
                    snap: "li",
                    vScrollbar: false,
                    onScrollEnd: function() {
                        indexH = Math.round((this.y / 40) * (-1)) + 1;
                        HourScroll.refresh();
                    }
                })
                MinuteScroll = new iScroll("Minutewrapper", {
                    snap: "li",
                    vScrollbar: false,
                    onScrollEnd: function() {
                        indexI = Math.round((this.y / 40) * (-1)) + 1;
                        HourScroll.refresh();
                    }
                })
                SecondScroll = new iScroll("Secondwrapper", {
                    snap: "li",
                    vScrollbar: false,
                    onScrollEnd: function() {
                        indexS = Math.round((this.y / 40) * (-1));
                        HourScroll.refresh();
                    }
                })
            }

            function checkdays(year, month) {
                var new_year = year; //取当前的年份        
                var new_month = month++; //取下一个月的第一天，方便计算（最后一天不固定）        
                if (month > 12) //如果当前大于12月，则年份转到下一年        
                {
                    new_month -= 12; //月份减        
                    new_year++; //年份增        
                }
                var new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天        
                return (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate(); //获取当月最后一天日期    
            }

            function createUL() {
                createDateUI();
                thatParents.find("#yearwrapper ul").html(createYEAR_UL());
                thatParents.find("#monthwrapper ul").html(createMONTH_UL());
                thatParents.find("#daywrapper ul").html(createDAY_UL());
            }

            function createDateUI() {
                var str = '' +
                    '<div id="datePage" class="page">' +
                    '<section>' +
                    '<div id="datetitle"><h1>请选择时间（公历）</h1></div>' +
                    '<div id="datemark"><span id="markyear" class="dateMarker">年</span><span id="markmonth" class="dateMarker">月</span><span id="markday" class="dateMarker">日</span></div>' +
                    '<div id="datescroll">' +
                    '<div id="yearwrapper">' +
                    '<ul></ul>' +
                    '</div>' +
                    '<div id="monthwrapper">' +
                    '<ul></ul>' +
                    '</div>' +
                    '<div id="daywrapper">' +
                    '<ul></ul>' +
                    '</div>' +
                    '</div>' +
                    '<div id="datescroll_datetime">' +
                    '<div id="Hourwrapper">' +
                    '<ul></ul>' +
                    '</div>' +
                    '<div id="Minutewrapper">' +
                    '<ul></ul>' +
                    '</div>' +
                    '<div id="Secondwrapper">' +
                    '<ul></ul>' +
                    '</div>' +
                    '</div>' +
                    '</section>' +
                    '<footer id="dateFooter">' +
                    '<div id="setcancle">' +
                    '<ul>' +
                    '<li id="dateconfirm">确定</li>' +
                    '<li id="datecancle">取消</li>' +
                    '</ul>' +
                    '</div>' +
                    '</footer>' +
                    '</div>';
                that.parents('.content').parent().find("#datePlugin").html(str);
            }

            function addTimeStyle() {
                    thatParents.find("#datePage").css("height", "380px");
                    thatParents.find("#datePage").css("top", "60px");
                    thatParents.find("#yearwrapper").css("position", "absolute");
                    thatParents.find("#yearwrapper").css("bottom", "200px");
                    thatParents.find("#monthwrapper").css("position", "absolute");
                    thatParents.find("#monthwrapper").css("bottom", "200px");
                    thatParents.find("#daywrapper").css("position", "absolute");
                    thatParents.find("#daywrapper").css("bottom", "200px");
                }
                //创建 --年-- 列表
            function createYEAR_UL() {
                    var str = "<li>&nbsp;</li>";
                    for (var i = opts.beginyear; i <= opts.endyear; i++) {
                        str += '<li id="y' + i + '">' + i + '</li>'
                    }
                    return str + "<li>&nbsp;</li>";;
                }
                //创建 --月-- 列表
            function createMONTH_UL() {
                    var str = "<li>&nbsp;</li>";
                    for (var i = opts.beginmonth; i <= opts.endmonth; i++) {
                        if (i < 10) {
                            i = "0" + i
                        }
                        str += '<li id="m' + i + '">' + i + '</li>'
                    }
                    return str + "<li>&nbsp;</li>";;
                }
                //创建 --日-- 列表
            function createDAY_UL() {
                    var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                    opts.endday = monthDays[indexM - 1];
                    var year = parseInt("20" + "" + (indexY - 1));
                    var isLeapYearIndex = year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
                    if (isLeapYearIndex && indexM == 2) {
                        opts.endday = 29;
                    }

                    thatParents.find("#daywrapper ul").html("");
                    var str = "<li>&nbsp;</li>";
                    for (var i = opts.beginday; i <= opts.endday; i++) {
                        str += '<li id="d' + i + '">' + i + '</li>'
                    }
                    return str + "<li>&nbsp;</li>";;
                }
                //创建 --时-- 列表
            function createHOURS_UL() {
                    var str = "<li>&nbsp;</li>";
                    for (var i = opts.beginhour; i <= opts.endhour; i++) {
                        str += '<li>' + i + '时</li>'
                    }
                    return str + "<li>&nbsp;</li>";;
                }
                //创建 --分-- 列表
            function createMINUTE_UL() {
                    var str = "<li>&nbsp;</li>";
                    for (var i = opts.beginminute; i <= opts.endminute; i++) {
                        if (i < 10) {
                            i = "0" + i
                        }
                        str += '<li>' + i + '分</li>'
                    }
                    return str + "<li>&nbsp;</li>";;
                }
                //创建 --分-- 列表
            function createSECOND_UL() {
                var str = "<li>&nbsp;</li>";
                str += "<li>上午</li><li>下午</li>"
                return str + "<li>&nbsp;</li>";;
            }

        }
        return me;
    };
    return DatePick;
});