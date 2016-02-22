/**
 *
 *  FileName: messagesDetail.js
 *  CreateDate: 2015-10-8
 *  Author: lichanglong
 *  缓存数据的判断。  1.数据是否成功  2 数据是否为空
 *
 */
define([
		'butterfly/view',
		'butterfly',
		'iscroll',
		'listview/DataSource',
		'listview/ListView',
		'listview/ListViewItem',
		'contact/js/recentlyChatArr',
		'swipe'
	],
	function(View, Butterfly,IScroll,DataSource,ListView,ListViewItem,RecentlyChats) {

	return View.extend({
		events: {
			"click .back": "goBack",
			"click #smile": 'onSmile',//表情
			"click #more": 'onMore',//展开更多功能列表
			"click .smileIconDiv":'addSmile',//添加表情
			"click .sendBtn":'onSendMessages',//发送聊天记录
			"touchstart .scroller":"onHideSmileMore",//单击消息时隐藏表情及更多功能
			'click .eseIconDiv':'onGoMore',//进入更多功能
			"click .meSetMsgContentTextBox": "onResendMsg",
		},
		myScroll: null,
		mySwipe: null,
		msgType: "meSetMsg", //有两种类型  meSetMsg:自己消息   acceptedMsg:其他人消息
		datasource:null,
		statLoadMore:true,
		goBack: function(){
			window.removeEventListener('im.receive', window.imMsgDetail, false);
			history.go(-1);

		},
		initMyScroll: function() { //初始化iScroll
				var me = this;
				me.myScroll = new IScroll('#wrapper', {
					mouseWheel: true,
					zoom: true,
					scrollX: false,
					probeType: 1,
					scrollY: true,
					lockDirection: true,

				});
				me.myScroll.refresh();
		},
		loadUnreadMsg: function(){
			var me = this;
			var im = navigator.chameleonIM;
		    var unreadMsgArr = me.getMsgArr(me.source);

		    var  meSource;
		    if(im){
		    	meSource = im._currentUser;//自己
		    }else{
		    	meSource = "admin";
		    }
		    var  newArr = [];
		    if (unreadMsgArr.length>0) {
		   	    for (var i = 0,len = unreadMsgArr.length; i <len; i++) {

		   			var msg = unreadMsgArr[i];
					var msgtype = "acceptedMsg";//有两种类型  meSetMsg:自己消息   acceptedMsg:其他人消息
					var messageContent = me.onHandleStr(msg.messageContent);

					msg.read = true;//设置为已读
                    newArr.push(msg);

					if (msg.source === meSource) {
						msgtype = "meSetMsg";
					}

				    me.addInputValueMsgContn(messageContent,msgtype,msg);//把消息添加到页面上
		   		};
		   		me.setMsgArr(me.source,newArr);

		   }
		},
		loadData: function() {
			var me = this;
			me.datasource = new DataSource({
				storage: 'local',
				identifier: 'messagesDetail-list',
				url: '../im/messages.json',
				pageParam: 'pageIndex',
				startParam:2
			});
		},
		_initListView: function() {

		  /**
		    *    TODO
			*    1.缓存最近聊天记录?缓存几条记录？
			*      假设缓存十条最近的聊天记录。
			*            取得拉取聊天记录的所有数据，拿出最后十条 放入缓存
			*            如果有消息发送或接收时  更改本地输缓存数据
			*            如果说本地有缓存记录  则不加载数据。除非点击加载跟多。
			*     QQ 在登陆的时候就就已经拉取了 最近用户聊天的信息
 			*
			*/

		  	   var me = this,
			   listEl = me.el.querySelector("#ChatHistoyDetail-list"),
			 template = _.template(me.$("#ChatHistoyDetail-template").html());
			 me.loadData();

			this.listview = new ListView({
				id: 'messagesDetail',
				el: listEl,
				autoLoad: 'true',
				itemTemplate: template,
				dataSource: me.datasource,
				requestParams: {
					isSimpleList: 0,
				},
				pageSize:10
			});
			me.listview.IScroll.isAddTop = true;//listview的IScroll加上一个属性 ，确定列表是从哪里加上去  从listview头部插入记录

		},
		insertText:function(obj,str){//根据光标位置插入消息
			if (document.selection) {
				   var sel = document.selection.createRange();
			      sel.text = str;
			} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
			  var startPos = obj.selectionStart,
					endPos = obj.selectionEnd,
			     cursorPos = startPos,
					tmpStr = obj.value;
				 obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
				cursorPos += str.length;
				obj.selectionStart = obj.selectionEnd = cursorPos;
			} else {
				obj.value += str;
			}
		},
		loadMoreMessages:function(){//加载更多消息
			var me = this,
		 $pullDown = me.$el.find('.loadMore');
			me.statLoadMore = false;//加载结束

			/**
			  *
			  *
			  *   TODO 从缓存获取数据
			  *       此数据为模拟数据。以后可能会有更改
			  *
			  */
             var msgArr = JSON.parse(window.localStorage.getItem('datasource-messagesDetail-list')),
              acceptedMsgTemplate = me.$("#acceptedMsg-template").html();

             msgArr.forEach(function(data){
                     acceptedMsgTemplateView = _.template(acceptedMsgTemplate, data);
					 me.msgListViewItem = new ListViewItem();
          			 me.msgListViewItem.$el.find(".item-content").append(acceptedMsgTemplateView)
					 me.listview.addfirstItem(me.msgListViewItem);
             });
            me.listview.IScroll.refresh();
			if (!me.statLoadMore) {
				me.listview.IScroll.minScrollY = -$pullDown.outerHeight();
			}
            me.listview.IScroll.scrollToElement("li:nth-child("+(msgArr.length+1)+")", 100);
            me.$el.find('.loadMore').find('.iconMore')[0].style.display='none';
			me.$el.find('.loadMore').find('.labelMore').html('点击加载跟多...');
			me.listview.refresh();
			me.statLoadMore = true;

		},
		onGoMore: function(e) {//进入更多功能

			var me = this,
		 dataIdent = $(e.currentTarget).find(".module-name").attr('data-ident');

			 switch(true) {
			 	case (dataIdent === "photo"):

			 		console.log("照片");
			 		break;
			 	case (dataIdent === "video"):

			 		console.log("视屏");
		 			break;
		 		case (dataIdent === "file"):

		 			console.log("文件");
		 			break;
		 		case (dataIdent === "email"):

		 			console.log("邮箱");
		 			break;
		 		default:

		 		    console.log("其他种可能");
		 		    break;
			 }
		},

		//给定一个字符串。把指定格式的文本 转换为 固定的 图片的标签（img 标签）
		onHandleStr: function(msgStr){//处理字符串
			//\[[^a-zA-Z0-9_][^a-zA-Z0-9_]\]
		          var me = this,
		          isOver = true,
		         newMesg = msgStr,
		           rgexp = /\[[\u4E00-\u9FFF]{1,3}\]/,
		    smileDataArr = JSON.parse(window.localStorage.getItem('smileDataArr'));

            if (rgexp.test(msgStr)) {

            	while(isOver){
	               _newMesg = newMesg.replace(rgexp,me.test(newMesg));
	               if (_newMesg === "undefined") {
	               	 isOver = false;
	               }else{
	               	 isOver = rgexp.test(_newMesg);
	                newMesg = _newMesg;
	               }
				}
            }

	  		return newMesg;

		},
		test: function(msgStr){
		       var rgexp = /\[[\u4E00-\u9FFF]{1,3}\]/g,
			smileDataArr = JSON.parse(window.localStorage.getItem('smileDataArr')),
			newMsgStrArr = msgStr.match(rgexp);//获取到匹配的数组

	         for (var i = 0,len = newMsgStrArr.length;i < len ; i++) {

	         	for (var j = 0,leng = smileDataArr.data.length; j < leng; j++) {
	         		 if (newMsgStrArr[i] === smileDataArr.data[j].title) {
	         		    return "<img src='../im/image/qq/"+(j+1)+".gif'>"

	         		 }
	         	};

        	 };
		},
		onHideSmileMore: function(){//单击消息时隐藏表情及更多功能

			var me = this;
			me.$el.find('.footerLine2').hide();

            var node=me.$el.find("#swipe")[0];
            if(node&&node.hasChildNodes()){
                me.mySwipe.kill();
                while (node.hasChildNodes()) {
                    node.removeChild(node.lastChild);
                }
            }
			me.myScroll.refresh();

		},
		checkInputValue: function() { //校验input框的值是否符合规则

		           var me = this;
			me.inputValue = $.trim(me.$el.find("#messagesInput").val());
			if (me.inputValue === '') {
				console.log('Error: inputValue null');
				return false;
			}
			return true;

		},
		addInputValueMsgContn: function(messagesInputStr,type,msgObj) { //添加input的值到消息  有两种类型  meSetMsg自己消息   acceptedMsg其他人消息

	       				  var me = this,
		        meSetMsgTemplate = me.$("#" + type + "-template").html(),
							 obj = {
								   		inputValue: messagesInputStr,
								   		msgObj: msgObj
							       },
			meSetMsgTemplateView = _.template(meSetMsgTemplate, obj);
            me.$el.find(".memberList").append(meSetMsgTemplateView);
            me.myScroll.refresh();
            var iscrollY = me.myScroll.maxScrollY;
			me.myScroll.scrollTo(0, iscrollY, 0, false);
			 me.myScroll.refresh();



		},
		onSendMessages: function(){//发送聊天信息

                     var me = this,
      messagesInputStrFirst = me.$el.find('#messagesInput').val(),
   		   messagesInputStr = me.onHandleStr(messagesInputStrFirst),
   		            msgType = "meSetMsg",//有两种类型  meSetMsg:自己消息   acceptedMsg:其他人消息
						 im = navigator.chameleonIM,
			   unreadMsgArr = me.getMsgArr(me.source);

			if (me.checkInputValue()) {

				var messageTimestamp = Date.parse(new Date());
				// source = im._currentUser;
			    if(im){
			    	source = im._currentUser;//自己
			    }else{
			    	source = "admin";
			    }
				var obj = {};
				obj.messageContent = messagesInputStrFirst; //messageContent
				obj.messageType = 1;    //消息类型
				obj.messageId = messageTimestamp;//消息ID
				obj.messageTimestamp = messageTimestamp;//消息时间戳
				obj.source = source;  //我自己的id
				obj.read = true;//是否已读

 				me.$el.find('#messagesInput').val('');
				// if(typeof cordova != "undefined"){
				// 	    im.send({
				// 			target: me.userid, // 消息目标的id
				// 			targetType: 1, //具体类型请见constants.js的MessageTarget
				// 			messageContent: messagesInputStrFirst, //消息主体内容
				// 			messageType: 1, //具体类型请见constants.js的messageType
				// 							  根据type的不同,messageContent为不同的内容.
				// 							 *   messageType=1: messageContent为文本内容
				// 							 *   messageType=2: messageContent为文件的上传成功后返回的文件id
				// 							 *   messageType=3: messageContent为语音上传成功后返回的文件id
				// 							 *   messageType=4: messageContent为图片上传成功后返回的文件id

				// 		},
				// 		function(result) {
				// 			if (result.code === 200) {
				// 				obj.sendOk = true;
				// 			}else{
				// 				obj.sendOk = false;
				// 			}
							unreadMsgArr.push(obj);
							me.setMsgArr(me.source,unreadMsgArr);
							// RecentlyChats.insert(me.source);
							me.addInputValueMsgContn(messagesInputStr,msgType,obj);//把消息添加到页面上

				// 		});
				// }
			};


		},
		onResendMsg: function(e){
			var me = this;
			var im = navigator.chameleonIM;
			var el = $($(e.currentTarget).find(".redSigh"));
			var messageId = el.attr("data-id");
			var msgArr = me.getMsgArr(me.source);
			var msg = null;
			var index = 0;
			for (var i = msgArr.length-1; i >=0; i--) {
				if(msgArr[i].messageId == parseInt(messageId)){
					msg = msgArr[i];
					index = i;
					break;
				}
			}
			if(msg == null){
				return;
			}
			// im.send({
			// 		target: me.userid, // 消息目标的id
			// 		targetType: 1, //具体类型请见constants.js的MessageTarget
			// 		messageContent: msg.messageContent, //消息主体内容
			// 		messageType: 1, //具体类型请见constants.js的messageType

			// 	},
			// 	function(result) {
			// 		if (result.code === 200) {
			// 			msg.sendOk = true;
			// 		}else{
			// 			msg.sendOk = false;
			// 		}
					el.parents(".meSetMsgBox").parent().remove();
					msgArr.splice(index,1);
					msgArr.push(msg);
					me.setMsgArr(me.source,msgArr);
					// RecentlyChats.insert(me.source);

					me.addInputValueMsgContn(me.onHandleStr(msg.messageContent),"meSetMsg",msg);//把消息添加到页面上

				// });

		},
		addSmile: function(e){//添加表情

		            var me = this,
		          smileStr = $(e.currentTarget).attr('data-title'),
          messagesInputStr = me.$el.find('#messagesInput').val();
          me.insertText( me.$el.find('#messagesInput')[0],smileStr);
          console.log('添加表情 src: '+$(e.currentTarget).children().attr('src')+"title: "+smileStr);

		},
		onSmile: function(){//打开表情面板

			var me = this;
				me.$el.find('.footerLine2').hide();
                var node=me.$el.find("#swipe")[0];
            if(node&&node.hasChildNodes()){
                me.mySwipe.kill();
               while (node.hasChildNodes()) {
                    node.removeChild(node.lastChild);
                }
            } else{
                 me.initSmile();
				me.$el.find('.footerLine3').show();
            }
			me.myScroll.refresh();

		},
		onMore: function(){//展开更多功能面板

			var me = this;
            var more=me.$el.find('.footerLine2');
            var display=more[0].style.display;
			if (display.length==0||display==="none") {
                more.show();
			}else{
                more.hide();
			}
			var node=me.$el.find("#swipe")[0];
            if(node&&node.hasChildNodes()){
                 me.mySwipe.kill();
                while (node.hasChildNodes()) {
                    node.removeChild(node.lastChild);
                }
            }

		},
		onShow: function(op) {

			var me = this;
			var im = navigator.chameleonIM;
			if(im){
				me.myId = im._currentUser;
			}else{
				me.myId = "admin";
			}

			if(typeof cordova != "undefined"){
				me.userid = op.uid;
				me.nickname = op.nickname;
				me.source =op.source;
			}else{
				me.userid = op.uid;
				me.nickname = op.nickname;
				me.source =op.source;
			}
			// var im = navigator.chameleonIM;

    		me.$el.find('.title').html(me.nickname);
			 me.initMyScroll();
			 me.loadUnreadMsg();
		 	me.getSmileData();//获取表情数据


              me.ListenerMsg();// 监听消息

              if(op.msg){
              	me.addInputValueMsgContn(op.msg.alert,"acceptedMsg",{
              		sendOk:true,
              		messageId:"test"
              	});
              }

			// RecentlyChats.insert(me.source);
			View.prototype.onShow.apply(this, arguments);

		},
		//组装消息
		assemblyMsg: function(msg){
			//msg = ["[饼干][伤心]",1,154,1446514382754,"wwww"]
			var obj = {};
			obj.messageContent = msg[0];
		    obj.messageType = msg[1];
		    obj.messageId = msg[2];
		    obj.messageTimestamp = msg[3];
			obj.source = msg[4];
			obj.read = true;//将消息设置为已读
			obj.sendOk = true;//发送成功的消息
			return obj;
		},
		setMsgArr: function(source,msgArr){
			var me = this;
			window.localStorage.setItem(me.myId+"-"+source,JSON.stringify(msgArr));
		},
		//得到已有消息的数组
		getMsgArr: function(source){
			var me = this;
			var msgArr = [];
			var msgArrSession = window.localStorage.getItem(me.myId+"-"+source);
			if(msgArrSession){
				msgArr = JSON.parse(msgArrSession);
			}
			return msgArr;
		},
		ListenerMsg:function(){//监听消息
			var me = this;
			if(typeof cordova != "undefined"){

			window.imMsgDetail = function(r){
				var hash = window.location.hash;
			    if(hash !== "#im/messagesDetail.html"){
			    	return;
			    }
				  //例子
				r.route="chat.chatHandler.onSend" //聊天数据

					    // r.msg=[messageContent,messageType,messageId,messageTimestamp,source,target]
				var msg = me.assemblyMsg(JSON.parse(r.msg));//重新组装消息格式
				var msgtype = "acceptedMsg";//有两种类型  meSetMsg:自己消息   acceptedMsg:其他人消息

				var messageContent = me.onHandleStr(msg.messageContent);
				var unreadMsgArr = me.getMsgArr(me.source);

				me.addInputValueMsgContn(messageContent,msgtype,msg);//把消息添加到页面上

				unreadMsgArr.push(msg);
				me.setMsgArr(me.source,unreadMsgArr)
				// RecentlyChats.insert(me.source);
			}
            window.removeEventListener('im.receive', window.imMsgDetail, false);
			window.addEventListener('im.receive', window.imMsgDetail, false);
			}
		},
		initSmile: function(){//初始化微笑（表情）
			var me = this;
			var $smileBox = me.$el.find('.footerLine3').find('.swipe-wrap');
			var domTree = window.sessionStorage.getItem("smile_domtree");
			if(domTree){
				$smileBox.html(domTree);
			}else{
				me.createSmileDom();
			}

         	 //初始化swipe
         	 me.initSmileSwipe();

		},
		createSmileDom: function(){
			/**
				*  TODO : 这个表情包是保存在本地还是服务器.
				*         个人觉得保存在本地好，所以这里直接加载本地的表情包
				*         img:  30*20  tr 高度  22px   table 高度:22px*4 一页40个表情 一行 10个表情
				*         根据数据长度，算出需要多少个table   table=wrap;
				*         十个 td一个tr  一个页面 4个tr
				*/

                       var me = this,
			 	 smileDataArr = JSON.parse(window.localStorage.getItem('smileDataArr')),
			 	   wrapNumber = parseInt((smileDataArr.data.length)/40);
			        $smileBox = me.$el.find('.footerLine3').find('.swipe-wrap'),
			         smileArr = [];//存放所有TD标签

                //解析TD标签
                _.forEach(smileDataArr.data,function(value,i){
                	var $smileIconDivImg = $("<div class='smileIconDiv' data-title='"+value.title+"'><img src='"+value.url+"'></div>");
                   	smileArr.push($smileIconDivImg);
                });

                //解析wrap 和table
                for (var j = 0; j <= wrapNumber; j++) {
                	var $Wrap = $("<div class='wrap' id='smileWrap_"+j+"'></div>");
                	$smileBox.append($Wrap);
                };

                //获取到 wrap
               wrapArr = $smileBox.find('.wrap');

               //创建四张 4*10的表格
               var tableArr = [],
                   $table1 = me.initWrapTable(4,10,'smileWTable_0','smileWTr_0'),
	               $table2 = me.initWrapTable(4,10,'smileWTable_1','smileWTr_1'),
	               $table3 = me.initWrapTable(4,10,'smileWTable_2','smileWTr_2'),
	               $table4 = me.initWrapTable(4,10,'smileWTable_3','smileWTr_3');

                   tableArr = [$table1,$table2,$table3,$table4];

                //把相应的图片放到已经创建好了的表格之中
	            for (var i = 0; i < smileArr.length; i++) {

	               		switch(true) {
	               			case i<40:
	               						$($table1.find('.smileTd')[i]).append(smileArr[i]);
	               				break;
	               			case i<80:
										$($table2.find('.smileTd')[i-40]).append(smileArr[i]);
	               				break;
	               			case i<120:
										$($table3.find('.smileTd')[i-80]).append(smileArr[i]);
	               				break;
	               			case i<160:
										$($table4.find('.smileTd')[i-120]).append(smileArr[i]);
								break;
	               		}

	            };

	            //把相应的表格放在相应的wrap之中
				wrapArr.each(function(i,warpObj) {
					 $(warpObj).append(tableArr[i]);
				})

				//得到创建好的dom树,存入local中
				window.sessionStorage.setItem("smile_domtree",$smileBox.html());
		},
		initWrapTable: function(row,col,tableId,trId){//初始化wrapTable row:int col:int

  			var $table = $("<table id='"+tableId+"' style='margin: 0 auto;margin-bottom:10px'></table>");
  			for (var i = 0; i < row; i++) {
  				var $tr = $("<tr class='eseIconRow'></tr>");
  				for (var j = 0; j < col; j++) {
  					$tr.append("<td class='smileTd'></td>")
  				};
  				$table.append($tr);
  				$tr='';
  			};
  			return $table;

		},
		initSmileSwipe: function(){
			var me = this,
			  elem = me.$el.find("#slider");
				me.mySwipe = Swipe(elem[0], {
					startSlide: 0,
					continuous: false,
					width:88,
				});
		},
		getSmileData: function(){//获取微笑数据(表情)

			//图片处理
			var me = this;
        	$.getJSON("../contact/image/qq/img.json",function(data){
        		console.log(data);
        		window.localStorage.setItem("smileDataArr", JSON.stringify(data));
//				me.initSmile();
		        }
		    )
		}
	}); //view define

});
