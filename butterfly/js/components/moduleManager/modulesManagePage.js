define(['butterfly/view',
        'iscroll', 'backbone', 'components/moduleManager/moduleManager'],
       function (View, IScroll, Backbone, ModuleManager) {
    return View.extend({
        events: {
            'click .module-list': 'goDetail',
            'click .edit': 'getAll',
            'click .goback':'goBack'
        },
        render: function () {
            View.prototype.render.call(this);
            return this;
        },
        goBack:function(){
          window.history.back();  
        },
        onShow: function () {
            if(!this.hasShown) {
                var me = this;
                me.$el.parent().find('.content').append("<div class='chrysanthemum-shadom'><div class='chrysanthemum active'><div></div></div></div>");
                //请求模块信息队列。
                var task = 2;
                me.initializeInstalledModules(function () { //请求已安装模块
                    me.initializeNotInstallModules(function () { //获取未安装模块时，要先获取到已安装的模块。
                        if (--task == 0) {
                            me.taskAfter();
                        }
                    });
                });

                me.initializeUpdateModules(function () { //请求需要更新与安装的模块
                    if (--task == 0) {
                        me.taskAfter();
                    }
                });
            }
            this.hasShown = true;
        },
        taskAfter: function () { //模块信息请求完后.
            var me = this;
            //result3 = result1 + result2; result3为未安装模块与已安装模块的集合
            //result 已安装模块（本地模块）
            //result1未安装模块
            //result2待更新模块
 
            _.map(me.result1, function (item) {
                item['type'] = 'install';
            })

            var localModulesMapping = _.object(_.map(me.result1, function (module) {
                return module.identifier;
            }), me.result1);

            _.map(me.result2, function (item, key) { //特殊情况处理
                item['type'] = 'update';
                if (localModulesMapping[item.identifier]) { //在ModuleManager中已经把待安装的模块 添加到了待更新中，所以要在这里剔除
                    me.result2.splice(key, 1);
                }
            })
            me.result3 = me.result1.concat(me.result2); 
            me.$el.parent().find('.chrysanthemum-shadom').remove();

            this.myScroll = new IScroll('#modules-wrapper');

            // me.listInitialize(me.result,'hidden');
            me.listInitialize(me.result3, 'category'); //
            //如果是自动检查更新跳入则直接更新
            if (me.request('auto') && this.result3.length > 0) { 
                new ModuleManager().downloadModules(this.result3);
            }
            me.uiEditButton('update');

        },
        initializeInstalledModules: function (success) { //初始化，本地已安装模块
            var me = this;
            new ModuleManager().getLocalModulesInfo(function (result) { 
                if (result.length > 0) {
                    me.result = result;
                }
                success();
            }, function () {
                me.uiAjaxError();
            });

        },
        initializeNotInstallModules: function (success) { //初始化，未安装模块
            var me = this;
            new ModuleManager().getLastestModulesUpdateInfo(function (result) { 
                //<identifier, module>的映射，方便下面一步过滤使用
                var localModulesMapping = _.object(_.map(me.result, function (module) {

                    return module.identifier;
                }), me.result);

                me.result1 = _.reject(result, function (item) { //过滤，未安装的模块
                    return localModulesMapping[item.identifier];
                })
                success();

            }, function (error) {
                me.uiAjaxError();
            });
        },
        initializeUpdateModules: function (success) { //初始化，待更新模块
            var me = this;
            new ModuleManager().checkModulesUpdate(function (result) { 
                if (result.length > 0) {
                    me.result2 = result;
                    //此处作用是过滤，不显示已经更新的模块(因为更新文件需要重启应用),且需要更新的版本要大于 更新过的模块版本(缓存中的)
                    var updateCompleteModules = JSON.parse(window.sessionStorage.getItem('updateCompleteModules'));
                    if (updateCompleteModules != null && updateCompleteModules != '') {
                        var updateModules = _.object(_.map(updateCompleteModules, function (module) {
                            return module.identifier;
                        }), updateCompleteModules);

                        me.result2 = _.filter(me.result2, function (item) {
                            if (item.version > updateModules[item.identifier].version) {
                                return updateModules[item.identifier]
                            }
                        })

                    }
                } else {
                    me.result2 = [];
                }
                success();

            }, function () {
                me.uiAjaxError();
            });
        },
        uiAjaxError: function () { //网络请求失败
            var me = this;
            me.$el.parent().find('.chrysanthemum-shadom').remove();
            var prompt = '<div style="height:40px;width:100%;text-align:center;vertical-align: middle;padding-top:7px;">网络请求失败，请检查网络</div>';
            me.$el.find("#modules-temp").empty();
            me.$el.find("#modules-temp").append(prompt);
        },
        listInitialize: function (dateSource, filterValue) { //数据源，分类标识
            var me = this; 
            var moduleCategory = _.uniq(_.pluck(dateSource, filterValue));
            _.each(moduleCategory, function (value) {
                var classificationName;
                if (value === true) { //已安装页面，根据hidden(true,false)分类，需要处理。
                    classificationName = '业务模块';
                } else if (value === false) {
                    classificationName = '功能模块';
                } else {
                    classificationName = value;
                }
                me.$el.find('#modules-temp').append('<div class=' + value + '><div class="temp-category">' + classificationName + '</div></div>');
            })
            if (dateSource && dateSource.length > 0) {
                dateSource.forEach(function (value) {
                    var list = _.template(me.$el.find("#modules-template").html(), value);
                    var classification;
                    if (filterValue === 'category') { //未安装与待更新是根据category分类，已安装是根据hidden分类
                        classification = value.category;
                    } else {
                        classification = value.hidden;
                    }
                    me.$el.find("#modules-temp").find('.' + classification).append(list);
                    me.myScroll.refresh();
                })
            } else { //无更新模块提示
                me.$el.find("#modules-temp").empty();
                var prompt = '<div style="height:40px;width:100%;text-align:center;vertical-align: middle;padding-top:7px;">无模块更新</div>'
                me.$el.find("#modules-temp").append(prompt);
            }

        },
        uiEditButton: function (category) { //右上角 编辑按钮样式
            if (category === 'update' && this.result3.length > 0) {
                this.$el.find('.edit').show();
                this.$el.find('.edit').find('span').html('安装全部');
            } else {
                this.$el.find('.edit').hide();
            }
        },
        getAll: function (e) {
            var target = $(e.currentTarget);
            var name = $(target).find('span').text();
            if (name === '安装全部') {
                new ModuleManager().downloadModules(this.result3);
            }
        },
        goDetail: function (e) {
            var me = this;
            var target = $(e.currentTarget)[0];
            var identifier = $(target).attr('data-identifier');

            var detailInfo = _.find(me.result3, function (item) { //从result3中选取到点击的模块信息
                return item.identifier == identifier
            })
            window.sessionStorage.setItem('moduleManageDetail', JSON.stringify(detailInfo));
            butterfly.navigate('components/moduleManager/modulesManageDetail.html?update', {
                trigger: true,
                effect: 'slideInDown'
            });
        },
        request: function (paras) {
            var url = location.href;
            var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
            var returnValue;
            for (i = 0; i < paraString.length; i++) {
                var tempParas = paraString[i].split('=')[0];
                var parasValue = paraString[i].split('=')[1];
                if (tempParas === paras)
                    returnValue = parasValue;
            }

            if (typeof (returnValue) == "undefined") {
                return "";
            } else {
                return returnValue;
            }
        }
    })
})