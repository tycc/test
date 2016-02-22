
define(['shared/js/client'], function(BaseClient) {
	return _.extend(BaseClient,{
		path_getParkingLotInfo: BaseClient.basePath + "/APP/APPParkingLotController/getParkingLotById", //获取停车场信息
		path_getUserInfo: BaseClient.basePath + "/APP/APPDriverCarInfoController/getDriverCarInfoList", //获取用户常用的车牌号
		path_orderSubmit: BaseClient.basePath + "/APP/APPOrderInfoController/addOrUpdateOrderInfo", //提交预约订单
		
		path_portList: BaseClient.basePath+"/APP/APPParkingLotController/getAllParkingLotList",//获取车库信息
		path_validateDriverInfo: BaseClient.basePath+"/APP/APPDriverInfoController/validateDriverInfo",//获取手机号码信息
		path_validateCode: BaseClient.basePath+"/APP/APPDriverInfoController//APP/APPDriverInfoController/validateTelephoneAndCode",//获取短信验证信息

		/*
		* 获取停车场信息（车位预约）
		*/
		getParkingLotInfo:function(params){ 
			var me = this;
			var data = params.data; //请求参数
			me.ajax({
				url:me.path_getParkingLotInfo,
				data:{
					"driverInfo.id":"40288121515ca54f01515cc4bca30005",
					"id":data.id, //停车场id
				},
				success:params.success,
				error:params.error
			})
		},
		
		getMapPortList: function(params) { //获取订单详情数据
			this.ajax({
				url: this.path_portList,
				data: params.data,
				success: params.success,
				error: params.error,
				complete: params.complete,
				beforeSend: params.beforeSend,
			});
		},


		/*
		*	获取用户常用的车牌号（车位预约）
		*/
		getUserInfo:function(params){
			var me = this;
			var data = params.data;//请求参数
			me.ajax({
				url:me.path_getUserInfo,
				data:{
					"driverInfo.id":"40288121515ca54f01515cc4bca30005",
				},
				success:params.success,
				error:params.error
			})
		},

		/*
		* 提交预约单(车位预约)
		*/
		orderSubmit:function(params){
			var me = this;
			var data = params.data;
			me.ajax({
				url:me.path_orderSubmit,
				data:{
					"driverInfo.id":"40288121515ca54f01515cc4bca30005",
					"type":"ADD",
					"parkingLot.id":data.parkingLotId, //停车场id
					"appointmentStartTime":data.appointmentStartTime, //开始时间
					"appointmentEndTime":data.appointmentEndTime, //结束时间
					"cost":data.cost, //总价格
					"appointmentMoney":data.appointmentMoney //预约金	
				},
				success:params.success,
				error:params.error
			})
		},

		/*手机号码验证信息*/
		validateDriverInfo:function(params){
			var me = this;
			var data = params.data;//请求参数
			me.ajax({
				url:me.path_validateDriverInfo,
				data:{
					telephone:telephone
				},
				success:params.success,
				error:params.error
			})
		},

		/*短信验证码验证信息*/
		validateCode:function(params){
			var me = this;
			var data = params.data;//请求参数
			me.ajax({
				url:me.path_validateCode,
				data:{
					code:code
				},
				success:params.success,
				error:params.error
			})
		}





















	});
})

















