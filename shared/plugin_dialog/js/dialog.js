/**
 * @file 弹出框组件
 * 用法：     引入插件为dialog后,详细参数请见下面的 this._options
             同一个页面只能同时显示一个弹出框
              var  d=dialog.createDialog({
                        autoOpen: false, //默认为true
                        closeBtn: false,
                        buttons: {
                            '取消': function(){
                                this.close();
                            },
                            '确定': function(){
                                me.alertexit();
                                this.close(); //所有逻辑最好放在关闭之前
                            }
                        },
                        content:'是否退去程序?',
                        title:'提示'
                    }); 
                d.open();
 */
 define([
    'zepto',
    './parseTpl',
    'css!../css/dialog.css',
    'css!../css/dialog.default.css' ],
    function($){ 
        function dialog(opts){

            this.tpl = {
                close: '<a class="ui-dialog-close" title="关闭"><span class="ui-icon ui-icon-delete"></span></a>',
                mask: '<div class="ui-mask"></div>',
                title: '<div class="ui-dialog-title">'+
                '<h3><%=title%></h3>'+
                '</div>',
                wrap: '<div class="ui-dialog">'+
                '<div class="ui-dialog-content"></div>'+
                '<% if(btns){ %>'+
                '<div class="ui-dialog-btns">'+
                '<% for(var i=0, length=btns.length; i<length; i++){var item = btns[i]; %>'+
                '<a class="ui-btn ui-btn-<%=item.index%>" data-key="<%=item.key%>"><%=item.text%></a>'+
                '<% } %>'+
                '</div>'+
                '<% } %>' +
                '</div> '
            };
            
            this._options= {
            /**
             * @property {Boolean} [autoOpen=true] 初始化后是否自动弹出
             * @namespace options
             */
             autoOpen: true,
            /**
             * @property {Array} [buttons=null] 弹出框上的按钮
             * @namespace options
             */
             buttons: null,
            /**
             * @property {Boolean} [closeBtn=true] 是否显示关闭按钮
             * @namespace options
             */
             closeBtn: true,
            /**
             * @property {Boolean} [mask=true] 是否有遮罩层
             * @namespace options
             */
             mask: true,
            /**
             * @property {Number} [width=300] 弹出框宽度
             * @namespace options
             */
             width: 300,
            /**
             * @property {Number|String} [height='auto'] 弹出框高度
             * @namespace options
             */
             height: 'auto',
            /**
             * @property {String} [title=null] 弹出框标题
             * @namespace options
             */
             title: null,
            /**
             * @property {String} [content=null] 弹出框内容
             * @namespace options
             */
             content: null,
            /**
             * @property {Boolean} [scrollMove=true] 是否禁用掉scroll，在弹出的时候
             * @namespace options
             */
             scrollMove: true,
            /**
             * @property {Element} [container=null] 弹出框容器
             * @namespace options
             */
             container: null,
            /**
             * @property {Function} [maskClick=null] 在遮罩上点击时触发的事件
             * @namespace options
             */
             maskClick: null,
            position: null //需要dialog.position插件才能用
        };
        /**
         * 获取最外层的节点
         * @method getWrap
         * @return {Element} 最外层的节点
         */ 
         this.getWrap= function(){
            return this._options._wrap;
        };

        this._init= function(){  
            //判断新建弹出框的时候，是否已经有在显示的弹出框
            var dList=$('.ui-dialog'); 
            if(dList.length!==0&&
                window.getComputedStyle(dList[dList.length-1]).getPropertyValue('visibility')==='visible') return;
            
            var me = this, opts = me._options, btns,
            i= 0, eventHanlder = $.proxy(me._eventHandler, me), vars = {};

            $(document).ready(function() {
                opts._container = $(opts.container || document.body);
                (opts._cIsBody = opts._container.is('body')) || opts._container.addClass('ui-dialog-container');
                vars.btns = btns= [];
                opts.buttons && $.each(opts.buttons, function(key){
                    btns.push({
                        index: ++i,
                        text: key,
                        key: key
                    });
                });
                opts._mask = opts.mask ? $(me.tpl.mask).appendTo(opts._container) : null;
                opts._wrap = $($.parseTpl(me.tpl.wrap, vars)).appendTo(opts._container);
                opts._content = $('.ui-dialog-content', opts._wrap);

                opts._title = $(me.tpl.title);
                // opts._close = opts.closeBtn && $(tpl.close).highlight('ui-dialog-close-hover');
                me.$el = me.$el || opts._content;//如果不需要支持render模式，此句要删除

                me.title(opts.title);
                me.content(opts.content);

                btns.length && $('.ui-dialog-btns .ui-btn', opts._wrap).highlight('ui-state-hover');
                opts._wrap.css({
                    width: opts.width,
                    height: opts.height
                });

                //bind events绑定事件
                $(window).on('ortchange', eventHanlder);
                opts._wrap.on('click', eventHanlder);
                opts._mask && opts._mask.on('click', eventHanlder);
                opts.autoOpen && me.open();
                });
                //绑定动画播放完毕触发的回调
                 opts._wrap.bind("animationend  webkitAnimationEnd  oAnimationEnd  MSAnimationEnd",
                 function(args){
                    if(args.animationName==='disappear'){
                        opts._wrap.css('visibility','hidden');
                        if(opts.autoOpen) me.destroy();
                    };
                 }); 
            };

            this._create= function(){
                var opts = this._options;

                if( this._options.setup ){
                    opts.content = opts.content || this.$el.show();
                    opts.title = opts.title || this.$el.attr('title');
                }
            };

            this._eventHandler=function(e){
                var me = this, match, wrap, opts = me._options, fn;
                switch(e.type){
                    case 'ortchange':
                    this.refresh();
                    break;
                    case 'touchmove':
                    opts.scrollMove && e.preventDefault();
                    break;
                    case 'click':
                    if(opts._mask && ($.contains(opts._mask[0], e.target) || opts._mask[0] === e.target )){
                        // this.close();
                        return;
                    }
                    wrap = opts._wrap.get(0);
                    if( (match = $(e.target).closest('.ui-dialog-close', wrap)) && match.length ){
                        me.close();
                    } else if( (match = $(e.target).closest('.ui-dialog-btns .ui-btn', wrap)) && match.length ) {
                        fn = opts.buttons[match.attr('data-key')];
                        fn && fn.apply(me, arguments);
                    }
                }
            };

            this._calculate= function(){
                var me = this, opts = me._options, size, $win, root = document.body,
                ret = {}, isBody = opts._cIsBody, round = Math.round;

                opts.mask && (ret.mask = isBody ? {
                    width:  '100%',
                height: Math.max(root.scrollHeight, root.clientHeight)-1//不减1的话uc浏览器再旋转的时候不触发resize.奇葩！
                    }:{
                        width: '100%',
                        height: '100%'
                    });

                size = opts._wrap.offset();
                $win = $(window);
                ret.wrap = {
                    left: '50%',
                    marginLeft: -round(size.width/2) +'px',
                    top: isBody?round($win.height() / 2) + window.pageYOffset:'50%',
                    marginTop: -round(size.height/2) +'px'
                }
                return ret;
            };

        /**
         * 用来更新弹出框位置和mask大小。如父容器大小发生变化时，可能弹出框位置不对，可以外部调用refresh来修正。
         * @method refresh
         * @return {self} 返回本身
         */
         this.refresh= function(){
            var me = this, opts = me._options, ret, action;
            if(opts._isOpen) {

                action = function(){
                    opts._wrap.css("-webkit-animation","null");
                    opts._wrap.css("animation","null");
                    ret = me._calculate();
                    ret.mask && opts._mask.css(ret.mask);
                    opts._wrap.css(ret.wrap);
                    opts._wrap.css("-webkit-animation"," bounceOut 0.1s");
                    opts._wrap.css("animation"," bounceOut 0.1s");
                }

                //如果有键盘在，需要多加延时
                if( $.os.ios &&
                    document.activeElement &&
                    /input|textarea|select/i.test(document.activeElement.tagName)){

                    document.body.scrollLeft = 0;
                    setTimeout(action, 200);//do it later in 200ms.

                } else {
                    action();//do it now
                }
            }
            return me;
        };

        var _this = this;

        this._listenDomRemoved = function(e) {
            var me =  _this;
            if (e.target) {
                var elems = $(e.target).find(me.$el);
                if (elems && elems.length > 0) {
                    $(document).off('touchmove', me._eventHandler);
                    document.removeEventListener('DOMNodeRemoved', me._listenDomRemoved); 
                }
            }
        };

        /**
         * 弹出弹出框，如果设置了位置，内部会数值转给[position](widget/dialog.js#position)来处理。
         * @method open
         * @param {String|Number} [x] X轴位置
         * @param {String|Number} [y] Y轴位置
         * @return {self} 返回本身
         */
        this.open= function(x, y){
            var opts = this._options;
            if(opts._isOpen) return;
            opts._isOpen = true;

            opts._wrap.css('visibility', 'visible');
            opts._mask && opts._mask.css('visibility', 'visible');

            x !== undefined && this.position ? this.position(x, y) : this.refresh();

            var me = this;
            $(document).on('touchmove', $.proxy(me._eventHandler, me));

            document.addEventListener('DOMNodeRemoved', this._listenDomRemoved , false); 
            /*me.$el.on('remove', function(){
                alert('remove dialog');
                $(document).off('touchmove', me._eventHandler); 
            });*/
        };

        /**
         * 关闭弹出框
         * @method close
         * @return {self} 返回本身
         */
        this.close=function(){
            var  opts = this._options;

            opts._isOpen = false;
            opts._wrap.css("-webkit-animation"," disappear 0.2s");
            opts._wrap.css("animation"," disappear 0.2s"); 
            opts._mask && opts._mask.css('visibility', 'hidden');

            $(document).off('touchmove', this._eventHandler); 
            
        };

        /**
         * 设置或者获取弹出框标题。value接受带html标签字符串
         * @method title
         * @param {String} [value] 弹出框标题
         * @return {self} 返回本身
         */
         this.title= function(value) {
            var opts = this._options, setter = value !== undefined;
            if(setter){
                value = (opts.title = value) ? '<h3>'+value+'</h3>' : value;
                opts._title.html(value)[value?'prependTo':'remove'](opts._wrap);
                opts._close && opts._close.prependTo(opts.title? opts._title : opts._wrap);
            }
            return setter ? this : opts.title;
        };

        /**
         * 设置或者获取弹出框内容。value接受带html标签字符串和zepto对象。
         * @method content
         * @param {String|Element} [val] 弹出框内容
         * @return {self} 返回本身
         */
         this.content= function(val) {
            var opts = this._options, setter = val!==undefined;
            setter && opts._content.empty().append(opts.content = val);
            return setter ? this: opts.content;
        };

        /**
         * @desc 销毁组件。
         * @name destroy
         */
        this.destroy= function(){
            var opts = this._options, _eventHander = this._eventHandler;
            $(window).off('ortchange', _eventHander);
            $(document).off('touchmove', _eventHander);
            opts._wrap.off('click', _eventHander).remove();
            opts._mask && opts._mask.off('click', _eventHander).remove();
            opts._close && opts._close.highlight(); 
        };
        
        opts.autoOpen!==undefined&&(this._options.autoOpen=opts.autoOpen); 
        opts.buttons&&(this._options.buttons=opts.buttons);
        opts.mask!==undefined&&(this._options.mask=opts.mask);
        opts.closeBtn!==undefined&&(this._options.closeBtn=opts.closeBtn);
        opts.width&&(this._options.width=opts.width);
        opts.height&&(this._options.height=opts.height);
        opts.title&&(this._options.title=opts.title);
        opts.content&&(this._options.content=opts.content);
        opts.scrollMove!==undefined&&(this._options.scrollMove=opts.scrollMove);
        opts.container&&(this._options.container=opts.container);
        opts.maskClick&&(this._options.maskClick=opts.maskClick);
        opts.position&&(this._options.position=opts.position);
    };
    
    function  createDialog(opts){  
            var d=new dialog(opts);
            d._init();
            return d;
        };
    return {
        createDialog:createDialog
    };
});
