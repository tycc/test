define(['butterfly/view','components/moduleManager/moduleManager'],function(View,ModuleManager){
	return View.extend({
		events:{
			'click .buttFunction':'buttonFunction',
			'click .goback':'goBack'
		},
		render:function(){
			View.prototype.render.call(this);
			return this;
		},
		onShow:function(){
			var me = this;
			//数据处理;
			me.result = JSON.parse(window.sessionStorage.getItem('moduleManageDetail'));
			var detail = _.template(me.$el.find("#detail-template").html(), me.result);
			me.$el.find(".detail").append(detail);
			//处理按钮样式;
			me.buttonStyle();
		},
		buttonStyle:function(){
			var me = this;
			var ident = window.location.hash.slice(1);
			if(ident==='changan/modulesManageDetail?installed'){

				me.$el.find('.buttFunction').addClass('buttRed');

			}else if(ident === 'changan/modulesManageDetail?notInstalled'){

				me.$el.find('.buttFunction').addClass('buttGreen');

			}else{
				me.$el.find('.buttFunction').addClass('buttGreen');
			}
		},
		buttonFunction:function(e){
			var me = this;
			var target = $(e.currentTarget)[0];
			var ident = $(target).text();
			if(ident ==='删除'){
				var name = this.$el.find('.module-info').attr('data-identifier');
				me.deleteModule(name);

			}else if(ident === '安装'){

				var arr = [];//转化成数组,虽然只有一个。
				arr.push(this.result);
				me.installModule(arr);

			}else{  //更新
				var arr = [];//转化成数组,虽然只有一个。
				arr.push(this.result);
				me.updateModule(arr);

			}
		},
		deleteModule:function(result){
			new ModuleManager().deleteModel(result);
		},
		installModule:function(result){
			new ModuleManager().downloadModules(result);
		},
		updateModule:function(result){
			new ModuleManager().downloadModules(result);
		}

	})
})