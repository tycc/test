//author:lihaohao

define(['underscore', 'jquery', 'notification', 
    'components/task/Task', 'components/task/TaskQueue', 'components/downloadManager', 'dialog', 'iscroll'], function (_, $, Notification, Task, TaskQueue, DownLoad, dialog) {
    
    var ModuleManager = function (appConfig) {
        if(appConfig === undefined) 
            appConfig = butterfly.config;

        this.appConfig = appConfig; 
        this.appKey= appConfig.appKey;
        this.secret= appConfig.appSecret;
        this.serverUrl = appConfig.chameleonUrl; 
        this.appRootPath = appConfig.appRootPath;
        this.identifier = appConfig.identifier;
        this.appVersion = appConfig.version;

        this.androidDownloadUrl= appConfig.androidDownloadUrl + '/bsl-web/mam/apps/download/'+ this.identifier +'/android?appKey=' + this.appkey;
        this.iOSDownloadUrl= appConfig.iosDownloadUrl + '/bsl-web/mam/apps/download/'+ this.identifier + '/ios?appKey=' + this.appkey;
    };

    var AjaxTask = Task.extend({

        constructor: function (url) {
            this.url = url;
        },

        execute: function (success, fail) {
            var me = this;
            this.ajax = $.ajax({
                url: this.url,

                success: function (ajaxCont) {
                    success(JSON.parse(ajaxCont));
                },
                error: fail
            });
        },

        abort: function () {
            this.ajax.abort();
        }

    });

    var DownloadModuleTask = Task.extend({
        storageDirectory: function () {
            return this.appConfig.appRootPath;
        },

        wwwDirecotry: function () {
            return this.storageDirectory() + this.appConfig.appFolderName;
        },

        constructor: function (fs, module, appConfig) {
            this.fs = fs;
            this.module = module;
            this.appConfig = appConfig;
        },
        execute: function (success, fail) {
            var url = this.appConfig.chameleonUrl + '/mam/api/mam/clients/files/' + this.module.bundle + '?appkey=' + this.appConfig.appkey;
            var target = this.wwwDirecotry() + this.module.identifier + '.zip';
            var me = this;
            DownLoad.onDownload(
                this.module.identifier, url, this.module.identifier, target,
                function (identifier, progress) {
                    //emmit onprogress event
                    // me.trigger('progress', identifier, progress);
                },
                function (url, filename, entry) {
                    console.log('DownLoad success'); 
                    zip.unzip(target, me.wwwDirecotry() + me.module.identifier.split('.')[1] + '/', function () {
                        console.log('unzip success'); //android 不要加sdc;ard
                        // 包名加路径(android路径);
                        var devicePath = me.appConfig.appRootPath + this.appConfig.appFolderName + '/' + entry.name;
                        //var devicePath = (device.platform == 'iOS') ? 'app/' + entry.name : androidPath+"app/" + entry.name;
                       
                        DownLoad.removeTask(me.module.identifier); //删除下载缓存记录；
                        DownLoad.saveState();
                        if(device.platform==='iOS'){
                             me.fs.root.getFile(devicePath, {}, function (f) { 
                                f.remove(function () {
                                    success();

                                }, fail); //remove

                            }, function (error) {
                                console.log('压缩包删除失败');
                            }); // 
                        }else{ 
                            window.resolveLocalFileSystemURI(devicePath, function (f) { 
                                
                                f.remove(function () {
                                    success();

                                }, fail); //remove

                            }, function (error) {
                                console.log('压缩包删除失败');
                            }); //  
                        }
                      

                    }); //unzip

                },
                function () {
                    fail();
                    console.log('下载失败')
                });
        },

        abort: function () {

        }
    });

    _.extend(ModuleManager.prototype, {

        storageDirectory: function () {
            return this.appConfig.appRootPath;
        },

        wwwDirecotry: function () {
            return this.storageDirectory() + this.appConfig.appFolderName;
        },

        errorHandler: function (e) {
            var msg = '';

            switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
            };

            console.log('Error: ' + msg);
        },
        //一次调用完成对应用和模块的更新，以及弹出提示框
        //isStartByUser参数用于判断是否由用户主动点击发起，
        //从而确定是否弹出”已经是最新版本的提示框“
        checkUpdates: function (isStartByUser, success, fail) {
            var me = this;

            me.checkAppUpdate(function (newVersion) {
                me.getUpdateMsgList(function (msg) {
                    var updateListDiv; 
                    if (msg && msg.success) {
                        var screenHeight = window.innerHeight;
                        updateListDiv = "<div id='update_wrapper' style='max-height:" + screenHeight * 0.5 + "px; overflow: hidden;'><div class='scroll' style='position:relative'>" + msg.features + "</div></div>";
                    }
                    me.checkModulesUpdate(function (result) { 
                        success();
                        if (result.length > 0) {
                            dialog.createDialog({ //外壳，H5都有更新时
                                closeBtn: false,
                                buttons: {
                                    '更新应用': function () {
                                        if (device.platform == 'iOS') {
                                            window.location.href = me.iOSDownloadUrl;
                                        } else {
                                            navigator.ChameleonUtil.download(me.androidDownloadUrl, null, null);
                                        }
                                        this.close();
                                    },
                                    '只更新模块': function () {
                                        butterfly.navigate('components/moduleManager/modulesManagePage.html?auto=true');
                                        this.close();
                                    },
                                    '以后再说': function () {
                                        this.close();
                                    },
                                },
                                content: updateListDiv ? updateListDiv : '检测到有应用与模块更新',
                                title: '更新'
                            });
                            if (updateListDiv) {
                                new IScroll('#update_wrapper');
                            }
                        } else {
                            dialog.createDialog({ //只有外壳更新时
                                closeBtn: false,
                                buttons: {
                                    '更新应用': function () {
                                        if (device.platform == 'iOS') {
                                            window.location.href =  me.iOSDownloadUrl;
                                        } else {
                                            navigator.ChameleonUtil.download(me.androidDownloadUrl, null, null);
                                        }
                                        this.close();
                                    },
                                    '以后再说': function () {
                                        this.close();
                                    }
                                },
                                content: updateListDiv ? updateListDiv : '检测到有应用更新',
                                title: '更新'
                            });
                            if (updateListDiv) {
                                new IScroll('#update_wrapper');
                            }
                        }
                    }, fail);

                });

            }, function (oldVersion) { 
                me.getUpdateMsgList(function (msg) {
                    var updateListDiv; 
                    if (msg && msg.success) {
                        var screenHeight = window.innerHeight;
                        updateListDiv = "<div id='update_wrapper' style='max-height:" + screenHeight * 0.5 + "px; overflow: hidden;'><div class='scroll' style='position:relative'>" + msg.features + "</div></div>";
                    }
                    me.checkModulesUpdate(function (result) {
                        success();
                        if (result.length > 0) {
                            dialog.createDialog({ //只有H5更新时
                                closeBtn: false,
                                buttons: {
                                       '立即更新': function () {
                                        Backbone.history.navigate('components/moduleManager/modulesManagePage.html?auto=true', {
                                            trigger: true
                                        });
                                        this.close();
                                    },
                                    '以后再说': function () {
                                        this.close();
                                    }
                                 
                                },
                                content: updateListDiv ? updateListDiv : '检测到有模块更新',
                                title: '更新'
                            });
                            if (updateListDiv) {
                                new IScroll('#update_wrapper');
                            }
                        } else {
                            if (!isStartByUser) return;
                            dialog.createDialog({ //都无更新时
                                closeBtn: false,
                                buttons: {
                                    '确定': function () {
                                        this.close(); //所有逻辑必须放在关闭之前
                                    }
                                },
                                content: '已经是最新模块',
                                title: '提示'
                            });
                        }
                    }, fail);
                });

            });

        },
        //获取更新的信息列表
        getUpdateMsgList: function (callback) {
            var me = this;
            $.ajax({
                type: 'get',
                url: me.serverUrl + '/mam/api/mam/appMains/versionFeature?appId='+ me.appConfig.identifier,
                timeOut: 3000,
                success: function (result) {
                    callback(result);
                },
                error: function (error) {
                    callback(null);
                }
            });
        },

        //检查应用程序是否需要更新
        checkAppUpdate: function (success, fail) {
            var me = this;   
            if (!window.cordova) return;
            me.getAppBuild(function (remoteBuild) { 
                                navigator.appInfo.getAppInfo(function (appinfo) { 
                                    if (remoteBuild > appinfo.build) {
                                        success(remoteBuild);
                                    } else {
                                        fail(appinfo.build);
                                    }
                                },function(e){
                                    console.log('Get app build error:'+e);
                                });
            }, function () {
                fail();
            });
        },
        //检查模块是否需要更新
        checkModulesUpdate: function (success, fail) {

            if (!window.cordova) return;
            var me = this;

            var task = 2;
            var localModules, remoteModules;
            me.getLocalModulesInfo(function (modules) {
                localModules = modules; 
                if (--task == 0) {
                    var diff = me.diffModules(localModules, remoteModules);
                    success(diff);
                };
            }, fail);
            me.getLastestModulesUpdateInfo(function (modules) {
                remoteModules = modules;
                 console.log("got remote: %s", JSON.stringify(remoteModules));

                if (--task == 0) {
                    var diff = me.diffModules(localModules, remoteModules);
                    success(diff);
                };
            }, fail);
        },
        //获得服务器上的模块版本信息
        getLastestModulesUpdateInfo: function (success, fail) {
            var me = this;
            me.getAppTokenFromServer(function (token) {
                me.getModulesInfoFromServer(token, success, fail);
            }, fail);
        },
        //对比两个模块信息数组，返回可更新的模块数组
        diffModules: function (local, remoteModules) { 
            var diff = [];
            //<identifier, module>的映射，方便下面一步过滤使用
            var localModulesMapping = _.object(_.map(local, function (module) {
                return module.identifier;
            }), local);
            //过滤掉不需要更新的模块
            var updatableModuleArray = _.filter(remoteModules, function (remoteModule) {
                //根据远程模块的identifier，尝试找出相应的本地模块
                var localModule = localModulesMapping[remoteModule.identifier];
                //有同样identifier的本地模块存在，且版本号不相同，返回远程模块信息。
                return localModule && (localModule.build < remoteModule.build) || !localModule;
            });
            return updatableModuleArray;
        },

        //获取本地模块信息
        getLocalModulesInfo: function (success, fail) {
 

            var me = this;
            window.resolveLocalFileSystemURL(me.wwwDirecotry(), function (fs) {
 

                var dirReader = fs.createReader();
                dirReader.readEntries(function (entries) {

                    var packageJSONArray =
                        _.chain(entries)
                        .filter(function (entry) {
                            return entry.isDirectory;
                        })
                        .value();

                    me.loadModulesInfoFromDirectories(fs, packageJSONArray, function (moduleNameArray) {

                        var moduleInfoArray = _.map(moduleNameArray, function (moduleName) {
                            return '../' + moduleName + '/package.json';
                        });

                        //AJAX 队列
                        var q = new TaskQueue();
                        moduleInfoArray.forEach(function (json) {
                            var task = new AjaxTask(json);
                            q.add(task);
                        });
                        var jsonArray = [];

                        q.success(function (arr) {
                            me.dependenciesModules(arr, function (newArr) { //处理依赖
                                success(newArr);
                            });

                        });

                        q.fail(function (error) {
                            Notification.show({
                                type: 'error',
                                message: "读取本地模块信息失败"
                            });
                        });

                        q.execute();
                    });



                }, fail);
            });

        },

        //给出一个文件夹列表，返回（回调方式）文件夹数组
        loadModulesInfoFromDirectories: function (fs, folderEntries, success) {

            var result = [];
            var tasks = folderEntries.length;
            folderEntries.forEach(function (folderEntry) {
                fs.getFile(folderEntry.name + '/package.json', {
                    create: false
                }, function (fileEntry) {
                    //TODO: 把结果存到result
                    result.push(folderEntry.name);
                    if (--tasks == 0) success(result);
                }, function () {
                    if (--tasks == 0) success(result);
                });
            });
        },

        // //获取上架的应用版本号
        getAppBuild: function (getAppVersionSuccess, fail) {
            var me = this; 
            $.ajax({
                type: 'get',
                url: me.serverUrl + '/mam/api/mam/clients/update/' + device.platform.toLowerCase() + '/'+ me.appConfig.identifier +'/',
                data: {
                    'appKey': me.appKey
                },
                success: function (appInfo) {
                    if (appInfo) {
                        getAppVersionSuccess(appInfo.build);
                    }
                },
                error: fail
            })
        },
        //获取应用token
        getAppTokenFromServer: function (success, fail) {
            var me = this; 
            $.ajax({
                type: 'post',
                url: me.serverUrl + '/mam/api/mam/clients/apps/' + device.platform.toLowerCase() + '/'+ me.appConfig.identifier +'/' + me.appVersion + '/validate',
                data: {        
                    appKey: me.appKey,
                    secret: me.secret
                },
                success: function (serverResult) {
                    success(serverResult.token);
                },
                error: fail
            }); 
        },
        //获取更新模块的信息
        getModulesInfoFromServer: function (token, success, fail) {
            var me = this;
            $.ajax({
                type: 'get',
                url: me.serverUrl + '/mam/api/mam/clients/apps/modules/' + token,
                data: {
                    'timeStamp': new Date().getTime(),
                },
                success: function (ModelResult) {
                    success(ModelResult.modules);
                },
                error: fail
            })
        },
        dependenciesModules: function (arr, success) {
            var newArr = _.clone(arr);
            //提取依赖模块信息，再与本地模块合并成一个新的数组；
            _.each(newArr, function (item) {
                if (_.keys(item.dependencies).length > 0) { //如果模块中有依赖，再与本地模拟对比版本号;
                    var obj = { //先将依赖转换为对象
                        'identifier': _.keys(item.dependencies)[0],
                        'version': _.values(item.dependencies)[0]
                    };
                    _.each(arr, function (localItem, k) { //再次遍历本地模块数组
                        if (localItem.identifier === obj.identifier && localItem.version < obj.version) {
                            delete newArr[k]; //如果在依赖模块，在本地模块信息数组中有，则对比，如果本地的版本低于依赖的，则删除本地的，添加依赖。
                            newArr.push(obj);
                        }
                    });
                }
            });
            success(_.compact(newArr));
        },
        deleteModel: function (moduleName) { //模块删除
            var directoryName = moduleName;
            var me = this;
            if (window.cordova) {
                navigator.notification.confirm(
                    ("是否删除此模块"), // message
                    function (button) {
                        if (button == "1" || button == 1) {
                            $.ajax({
                                url:  me.appConfig.chameleonUrl + '/mam/api/mam/clients/apps/'+ me.appConfig.identifier +'/guest/auth',
                                data: {
                                    'appKey': me.appConfig.appkey
                                },
                                success: function (priviligesResult) {
                                    var priviligesModulesArray = _.groupBy(priviligesResult.priviliges, function (value) {
                                        return value[1];
                                    }); //权限分组（根据模块名）;
                                    var priviligesModules = _.keys(priviligesModulesArray); //拿取有读取权限的模块数组;
                                    if (_.contains(priviligesModules, directoryName)) {
                                        var priviligesGet = priviligesModulesArray[directoryName];
                                        var allow = _.find(priviligesGet, function (item) {
                                            return item[0] == 'UNAVAILABLE';
                                        })

                                        if (allow != undefined) {
                                            navigator.notification.alert(
                                                '此模块无法删除', // 显示信息 
                                                function () {}, // 警告被忽视的回调函数 
                                                '提示', // 标题 
                                                '确定' // 按钮名称 
                                            );
                                        } else {
                                            window.resolveLocalFileSystemURL(cordova.file.documentsDirectory + 'app/' + directoryName, function (fs) {
                                                fs.removeRecursively(function () {
                                                    navigator.notification.alert(
                                                        '删除成功，请重启应用。', // 显示信息 
                                                        function () {}, // 警告被忽视的回调函数 
                                                        '提示', // 标题 
                                                        '确定' // 按钮名称 
                                                    );
                                                    window.history.go(-1);
                                                }, function (error) {
                                                    console.log(error)
                                                });
                                            })
                                        }

                                    } else {
                                        navigator.notification.alert(
                                            '此模块无法删除', // 显示信息 
                                            function () {}, // 警告被忽视的回调函数 
                                            '提示', // 标题 
                                            '确定' // 按钮名称 

                                        );
                                    }


                                }
                            })
                        }
                    }, // callback
                    '提示', // title
                    '确定,取消' // buttonName
                );
            }

        },
        downloadModules: function (modulesArray) { //下载，更新模块；队列；
            var me = this;  
            //提示
            me.loadingNotification = Notification.show({
                autoDismiss: false,
                showSpin: true,
                message: "正在下载中..."
            });

            function errorHandler(error) {
                console.error(error);
            }
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                
                var q = new TaskQueue();

                modulesArray.forEach(function (module) {
                    var task = new DownloadModuleTask(fs, module, me.appConfig);
                    // me.listenTo(task, 'progress', me.onProgress);
                    q.add(task);
                });

                q.success(function () {
                    console.log('queue success');
                    me.loadingNotification.remove(); //删除压缩包后，提示成功，删除提示。
                    var d = dialog.createDialog({
                        autoOpen: false, //默认为true
                        closeBtn: false,
                        buttons: {
                            '确定': function () {
                                window.sessionStorage.setItem('updateCompleteModules', JSON.stringify(modulesArray)); //更新完成的模块，存储起来，等待应用重启
                                window.localStorage.setItem('updateCompleteTime', new Date().getTime()); //更新完成时间
                                window.history.go(-1);
                                navigator.ChameleonUtil.removeWebviewCache(true); //清理缓存
                                this.close(); //所有逻辑必须放在关闭之前
                            }
                        },
                        content: '成功！请重新打开应用体验最新版本。',
                        title: '更新完成'
                    });
                    d.open();

                });

                q.fail(function (error) {
                    me.loadingNotification.remove();
                    Notification.show({
                        type: 'error',
                        message: "下载失败"
                    });
                });

                q.execute();

            });
        }

    });
    return ModuleManager;

})