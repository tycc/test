/*
 * 保存最近聊天列表
 *   Create By Huang Li
 */
define([],function () {
    var RecentlyChat=function(){ 
        //localStrage中的名称
        this.dataName="recentlyChats";
    } 
    
    var insertToArr = function (arr, _uid) {
        var obj = {
            uid: _uid,
            time: new Date().getTime()
        };
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].uid === _uid) {
                    arr.splice(i, 1);
                    break;
                }
            }
            arr.push(obj);
        } else {
            arr = [];
            arr.push(obj);
        }
        return arr;
    };
 
    RecentlyChat.prototype.insert=function (_uid) {
            var im=navigator.chameleonIM;
            var arr = window.localStorage.getItem(this.dataName+"-"+im._currentUser);
            var newArr = insertToArr(JSON.parse(arr), _uid);
            window.localStorage.setItem(this.dataName+"-"+im._currentUser,JSON.stringify(newArr));
        };
    RecentlyChat.prototype.getArrary= function () {
            var im=navigator.chameleonIM;
            var arr = window.localStorage.getItem(this.dataName+"-"+im._currentUser);
            return JSON.parse(arr);
        };
    var recentlyChat=new RecentlyChat();
    return recentlyChat;
});