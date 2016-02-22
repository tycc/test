define(['underscore', 'zepto'], function(_, $) {
	var calendarManager = function() {

		/*****************************************************************************
                                   日期资料
*****************************************************************************/
		this.lunarInfo = new Array(
			0x4bd8,0x4ae0,0xa570,0x54d5,0xd260,0xd950,0x5554,0x56af,0x9ad0,0x55d2,
			0x4ae0,0xa5b6,0xa4d0,0xd250,0xd295,0xb54f,0xd6a0,0xada2,0x95b0,0x4977,
			0x497f,0xa4b0,0xb4b5,0x6a50,0x6d40,0xab54,0x2b6f,0x9570,0x52f2,0x4970,
			0x6566,0xd4a0,0xea50,0x6a95,0x5adf,0x2b60,0x86e3,0x92ef,0xc8d7,0xc95f,
			0xd4a0,0xd8a6,0xb55f,0x56a0,0xa5b4,0x25df,0x92d0,0xd2b2,0xa950,0xb557,
			0x6ca0,0xb550,0x5355,0x4daf,0xa5b0,0x4573,0x52bf,0xa9a8,0xe950,0x6aa0,
			0xaea6,0xab50,0x4b60,0xaae4,0xa570,0x5260,0xf263,0xd950,0x5b57,0x56a0,
			0x96d0,0x4dd5,0x4ad0,0xa4d0,0xd4d4,0xd250,0xd558,0xb540,0xb6a0,0x95a6,
			0x95bf,0x49b0,0xa974,0xa4b0,0xb27a,0x6a50,0x6d40,0xaf46,0xab60,0x9570,
			0x4af5,0x4970,0x64b0,0x74a3,0xea50,0x6b58,0x5ac0,0xab60,0x96d5,0x92e0,
			0xc960,0xd954,0xd4a0,0xda50,0x7552,0x56a0,0xabb7,0x25d0,0x92d0,0xcab5,
			0xa950,0xb4a0,0xbaa4,0xad50,0x55d9,0x4ba0,0xa5b0,0x5176,0x52bf,0xa930,
			0x7954,0x6aa0,0xad50,0x5b52,0x4b60,0xa6e6,0xa4e0,0xd260,0xea65,0xd530,
			0x5aa0,0x76a3,0x96d0,0x4afb,0x4ad0,0xa4d0,0xd0b6,0xd25f,0xd520,0xdd45,
			0xb5a0,0x56d0,0x55b2,0x49b0,0xa577,0xa4b0,0xaa50,0xb255,0x6d2f,0xada0,
			0x4b63,0x937f,0x49f8,0x4970,0x64b0,0x68a6,0xea5f,0x6b20,0xa6c4,0xaaef,
			0x92e0,0xd2e3,0xc960,0xd557,0xd4a0,0xda50,0x5d55,0x56a0,0xa6d0,0x55d4,
			0x52d0,0xa9b8,0xa950,0xb4a0,0xb6a6,0xad50,0x55a0,0xaba4,0xa5b0,0x52b0,
			0xb273,0x6930,0x7337,0x6aa0,0xad50,0x4b55,0x4b6f,0xa570,0x54e4,0xd260,
			0xe968,0xd520,0xdaa0,0x6aa6,0x56df,0x4ae0,0xa9d4,0xa4d0,0xd150,0xf252,
			0xd520);

		this.solarMonth=new Array(31,28,31,30,31,30,31,31,30,31,30,31);
		this.Gan=new Array("甲","乙","丙","丁","戊","己","庚","辛","壬","癸");
		this.Zhi=new Array("子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥");
		this.Animals=new Array("鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪");
		this.solarTerm = new Array("小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至");
		this.sTermInfo = new Array(0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758);
		this.nStr1 = new Array('日','一','二','三','四','五','六','七','八','九','十');
		this.nStr2 = new Array('初','十','廿','卅','□');
		this.monthName = new Array("JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC");
		this.cmonthName = new Array('正','二','三','四','五','六','七','八','九','十','十一','腊');

		//公历节日 *表示放假日
		this.sFtv = new Array(
			"0101*元旦",
			"0214 情人节",
			"0308 妇女节",
			"0312 植树节",
			"0401 愚人节",
			"0501 劳动节",
			"0504 青年节",
			"0701 建党节",
			"0801 建军节",
			"0910 教师节",
			"1001*国庆节",
			"1224 平安夜",
			"1225 圣诞节"
		);

		//某月的第几个星期几。 5,6,7,8 表示到数第 1,2,3,4 个星期几
		this.wFtv = new Array(
			"0520 母亲节",
			"0630 父亲节",
			"1144 感恩节");

		//农历节日
		this.lFtv = new Array(
			"0101*春节",
			"0115 元宵节",
			"0505 端午节",
			"0707 七夕节",
			"0815 中秋节",
			"0909 重阳节",
			"1208 腊八",
			"1223 小年",
			"0100*除夕");
	};


	_.extend(calendarManager.prototype, {
		/*****************************************************************************
                                      日期计算
	*****************************************************************************/

	//====================================== 返回农历 y年的总天数
	lYearDays: function(y) {
	 var i, sum = 348;
	 for(i=0x8000; i>0x8; i>>=1) sum += (this.lunarInfo[y-1900] & i)? 1: 0;
	 return(sum + this.leapDays(y));
	},

	//====================================== 返回农历 y年闰月的天数
	leapDays: function(y) {
	 if(this.leapMonth(y)) return( (this.lunarInfo[y-1899]&0xf)==0xf? 30: 29);
	 else return(0);
	},

	//====================================== 返回农历 y年闰哪个月 1-12 , 没闰返回 0
	leapMonth: function(y) {
	 var lm = this.lunarInfo[y-1900] & 0xf;
	 return(lm==0xf?0:lm);
	},

	//====================================== 返回农历 y年m月的总天数
	monthDays: function(y,m) {
	 return( (this.lunarInfo[y-1900] & (0x10000>>m))? 30: 29 );
	},


	getSolarDate: function(lyear, lmonth, lday, isLeap) {
	  var offset = 0;
	  
	  // increment year
	  for(var i = 1900; i < lyear; i++) {
	    offset += this.lYearDays(i);
	  }

	  // increment month
	  // add days in all months up to the current month
	  for (var i = 1; i < lmonth; i++) {
	    // add extra days for leap month
	    if (i == this.leapMonth(lyear)) {
	      offset += this.leapDays(lyear);
	    }
	    offset += this.monthDays(lyear, i);
	  }
	  // if current month is leap month, add days in normal month
	  if (isLeap) {
	    offset += this.monthDays(lyear, i);
	  }
	   
	  // increment 
	  offset += parseInt(lday) - 1;

	  var baseDate = new Date(1900,0,31);
	  var solarDate = new Date(baseDate.valueOf() + offset * 86400000);
	  return solarDate;
	},


	//==============================返回公历 y年某m+1月的天数
	solarDays: function(y,m) {
	   if(m==1)
	      return(((y%4 == 0) && (y%100 != 0) || (y%400 == 0))? 29: 28);
	   else
	      return(this.solarMonth[m]);
	},

	//============================== 传入 offset 返回干支, 0=甲子
	cyclical: function(num) {
	   return(this.Gan[num%10] + this.Zhi[num%12]);
	},

	//===== 某年的第n个节气为几日(从0小寒起算)
	sTerm: function(y,n) {
	   var offDate = new Date( ( 31556925974.7*(y-1900) + this.sTermInfo[n]*60000  ) + Date.UTC(1900,0,6,2,5) );
	   return(offDate.getUTCDate());
	},


	
	//====================== 中文日期
	cDay: function(d){
	   var s;

	   switch (d) {
	      case 10:
	         s = '初十'; break;
	      case 20:
	         s = '二十'; break;
	         break;
	      case 30:
	         s = '三十'; break;
	         break;
	      default :
	         s = this.nStr2[Math.floor(d/10)];
	         s += this.nStr1[d%10];
	   }
	   return(s);
	},


			month_day : function(date){
				var d = date || new Date();
				return d.getDate();
			},


			//获得公历、农历的日历和各种节日
			lunar_Info_detail : function(date){
				
				var cld = this.getCld(date.getFullYear(), date.getMonth());
				var year = date.getFullYear();
				var day = date.getDate();
				var cld_day = cld[day - 1];
				var info = {
					lunar: "",
					lunarDay: this.cDay(cld_day.lDay),
					lunarMonth: (cld_day.isLeap ? '闰' : '') + this.getChinaNum(cld_day.lMonth) + "月",
					y_Info: "",
					lunarFestival: cld_day.lunarFestival, //农历节日
	      	solarFestival: cld_day.solarFestival, //公历节日
	      	solarTerms: cld_day.solarTerms, //节气
					huangliY:"无",
					huangliJ:"无"
				};

				info.lunar = '农历' + (cld_day.isLeap ? '闰' : '')+this.getChinaNum(cld_day.lMonth)+"月"+ this.cDay(cld_day.lDay);
				info.y_Info = cld_day.cYear + '年 '+ cld_day.cMonth + '月 ' + cld_day.cDay + '日';

				return info;
			},

			lunar_year : function(date){

				var l_year;
	      if(localObj["zh-cn"])
	        l_year = date.getFullYear()+'年'+(date.getMonth()+1)+'月 ';
	      else l_year = date.getFullYear()+' '+ localObj.months[(date.getMonth()+1)];
				//+cyclical(date.getFullYear() - 1900 + 36) + '年【'+ Animals[(date.getFullYear() - 4) % 12] + '年】';
				return l_year;
			},

			// 根据公历日期获取农历或者节日名称,如"立秋","初二","建军节"
			getLunarTextByDate: function(date) {	
				var lunarText;
				var lunar = this.lunar_Info_detail(date);
				
				if (!lunar) return "";

				if(lunar.lunarFestival) {
					lunarText = lunar.lunarFestival;
				} else if(lunar.solarFestival) {
					lunarText = lunar.solarFestival;
				} else if(lunar.solarTerms) {
					lunarText = lunar.solarTerms;
				} else {
					lunarText = lunar.lunarDay == "初一" ? lunar.lunarMonth: lunar.lunarDay;
				}	

				return lunarText;
			},

			getChinaNum :function(Num) {
				var monthEn;
				switch(Num){
					case 1 : monthEn = "一";break;
					case 2 : monthEn = "二";break;
					case 3 : monthEn = "三";break;
					case 4 : monthEn = "四";break;
					case 5 : monthEn = "五";break;
					case 6 : monthEn = "六";break;
					case 7 : monthEn = "七";break;
					case 8 : monthEn = "八";break;
					case 9 : monthEn = "九";break;
					case 10 : monthEn = "十";break;
					case 11 : monthEn = "十一";break;
					case 12 : monthEn = "腊";break;
				}
				return monthEn;
			},
		
			getCld : function(year, month) {
				this.cldCache  = {};// 注意！这里存的是calendarObj.js中定义的calendar对象，不是数据文件载入的cldObj
				var key = this.getMonthKey(year, month);
				var cld = this.cldCache[key];
				if (typeof cld == 'undefined') {
					cld = new calendar(year, month);
					this.cldCache[key] = cld;
				}
				return cld;
			},

		getMonthKey: function(year, month) { // 传入的month为0-11的数值
				return year.toString() + (month + 1).toString().leftpad(2) // 返回yyyyMM格式的字符串
		},

		date_part: function(date){
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);	
			return date;
		},
		
		week_start: function(date){
				var shift=date.getDay();
				if (config.start_on_monday){
					if (shift==0) shift=6
					else shift--;
				}
				return date_part(add_date(date,-1*shift,"day"));
		},

		add_date: function(date,inc,mode){
			var ndate=new Date(date.valueOf());
			switch(mode){
				case "day": ndate.setDate(ndate.getDate()+inc); break;
				case "week": ndate.setDate(ndate.getDate()+7*inc); break;
				case "month": ndate.setMonth(ndate.getMonth()+inc); break;
				case "year": ndate.setYear(ndate.getFullYear()+inc); break;
				case "hour": ndate.setHours(ndate.getHours()+inc); break;
				case "minute": ndate.setMinutes(ndate.getMinutes()+inc); break;
				default:
					return new Date();
			}
			return ndate;
		},

		start_date: function(date){
			date.setDate(1);
			return date_part(date);
		}
	});
	

	//====================================== 算出农历, 传入日期控件, 返回农历日期控件
	//                                       该控件属性有 .year .month .day .isLeap
	var Lunar = function(objDate) {
		 var calManager = new calendarManager();
	   var i, leap=0, temp=0;
	   var offset   = (Date.UTC(objDate.getFullYear(),objDate.getMonth(),objDate.getDate()) - Date.UTC(1900,0,31))/86400000;

	   for(i=1900; i<2100 && offset>0; i++) { temp = calManager.lYearDays(i); offset -= temp; }

	   if(offset<0) { offset += temp; i--; }

	   this.year = i;

	   leap = calManager.leapMonth(i); //闰哪个月
	   this.isLeap = false;

	   for(i=1; i<13 && offset>0; i++) {
	      //闰月
	      if(leap>0 && i==(leap+1) && this.isLeap==false)
	         { --i; this.isLeap = true; temp = calManager.leapDays(this.year); }
	      else
	         { temp = calManager.monthDays(this.year, i); }

	      //解除闰月
	      if(this.isLeap==true && i==(leap+1)) this.isLeap = false;

	      offset -= temp;
	   }

	   if(offset==0 && leap>0 && i==leap+1)
	      if(this.isLeap)
	         { this.isLeap = false; }
	      else
	         { this.isLeap = true; --i; }

	   if(offset<0){ offset += temp; --i; }

	   this.month = i;
	   this.day = offset + 1;
	};

	//============================== 返回阴历控件 (y年,m+1月)
	/*
	功能说明: 返回整个月的日期资料控件

	使用方式: OBJ = new calendar(年,零起算月);

	  OBJ.length      返回当月最大日
	  OBJ.firstWeek   返回当月一日星期

	  由 OBJ[日期].属性名称 即可取得各项值

	  OBJ[日期].isToday  返回是否为今日 true 或 false

	  其他 OBJ[日期] 属性参见 calElement() 中的注解
	*/
	var calendar = function(y,m) {
		 var calManager = new calendarManager();
	   var sDObj, lDObj, lY, lM, lD=1, lL, lX=0, tmp1, tmp2, tmp3;
	   var cY, cM, cD; //年柱,月柱,日柱
	   var lDPOS = new Array(3);
	   var n = 0;
	   var firstLM = 0;

	   sDObj = new Date(y,m,1,0,0,0,0);    //当月一日日期

	   this.length    = calManager.solarDays(y,m);    //公历当月天数
	   this.firstWeek = sDObj.getDay();    //公历当月1日星期几

	   ////////年柱 1900年立春后为庚子年(60进制36)
	   if(m<2) {
	   	cY = calManager.cyclical(y-1900+36-1);
	   }else {
	   	cY = calManager.cyclical(y-1900+36);
	   }
	   var term2 = calManager.sTerm(y,2); //立春日期

	   ////////月柱 1900年1月小寒以前为 丙子月(60进制12)
	   var firstNode = calManager.sTerm(y,m*2) //返回当月「节」为几日开始
	   cM = calManager.cyclical((y-1900)*12+m+12);

	   //当月一日与 1900/1/1 相差天数
	   //1900/1/1与 1970/1/1 相差25567日, 1900/1/1 日柱为甲戌日(60进制10)
	   var dayCyclical = Date.UTC(y,m,1,0,0,0,0)/86400000+25567+10;

	   for(var i=0;i<this.length;i++) {

	      if(lD>lX) {
	         sDObj = new Date(y,m,i+1);    //当月一日日期
	         lDObj = new Lunar(sDObj);     //农历
	         lY    = lDObj.year;           //农历年
	         lM    = lDObj.month;          //农历月
	         lD    = lDObj.day;            //农历日
	         lL    = lDObj.isLeap;         //农历是否闰月
	         lX    = lL? calManager.leapDays(lY): calManager.monthDays(lY,lM); //农历当月最后一天

	         if(n==0) firstLM = lM;
	         lDPOS[n++] = i-lD+1;
	      }

	      //依节气调整二月分的年柱, 以立春为界
	      if(m==1 && (i+1)==term2) cY = calManager.cyclical(y-1900+36);
	      //依节气月柱, 以「节」为界
	      if((i+1)==firstNode) cM = calManager.cyclical((y-1900)*12+m+13);
	      //日柱
	      cD = calManager.cyclical(dayCyclical+i);

	      //sYear,sMonth,sDay,week,
	      //lYear,lMonth,lDay,isLeap,
	      //cYear,cMonth,cDay
	      this[i] = new calElement(y, m+1, i+1, calManager.nStr1[(i+this.firstWeek)%7],
	                               lY, lM, lD++, lL,
	                               cY ,cM, cD );
	   }

	   //节气
	   tmp1 = calManager.sTerm(y,m*2  )-1;
	   tmp2 = calManager.sTerm(y,m*2+1)-1;
	   this[tmp1].solarTerms = calManager.solarTerm[m*2];
	   this[tmp2].solarTerms = calManager.solarTerm[m*2+1];
	   //if(m==3) this[tmp1].color = 'red'; //清明颜色

	   //公历节日
	   for(i in calManager.sFtv)
	      if(calManager.sFtv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/))
	         if(Number(RegExp.$1)==(m+1)) {
	            this[Number(RegExp.$2)-1].solarFestival += RegExp.$4;
	         }

	   //月周节日
	   for(i in calManager.wFtv)
	      if(calManager.wFtv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/))
	         if(Number(RegExp.$1)==(m+1)) {
	            tmp1=Number(RegExp.$2);
	            tmp2=Number(RegExp.$3);
	            if(tmp1<5)
	               this[((this.firstWeek>tmp2)?7:0) + 7*(tmp1-1) + tmp2 - this.firstWeek].solarFestival += RegExp.$5;
	            else {
	               tmp1 -= 5;
	               tmp3 = (this.firstWeek+this.length-1)%7; //当月最后一天星期?
	               this[this.length - tmp3 - 7*tmp1 + tmp2 - (tmp2>tmp3?7:0) - 1 ].solarFestival += RegExp.$5;
	            }
	         }

	   //农历节日
	   for(i in calManager.lFtv)
	      if(calManager.lFtv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
	         tmp1=Number(RegExp.$1)-firstLM;
	         if(tmp1==-11) tmp1=1;
	         if(tmp1 >=0 && tmp1<n) {
	            tmp2 = lDPOS[tmp1] + Number(RegExp.$2) -1;
	            if( tmp2 >= 0 && tmp2<this.length && this[tmp2].isLeap!=true) {
	               this[tmp2].lunarFestival += RegExp.$4;
	            }
	         }
	      }

	   //今日
	   //if(y==g_tY && m==g_tM) {this[g_tD-1].isToday = true;}

	};

	//============================== 阴历属性
	var calElement = function(sYear,sMonth,sDay,week,lYear,lMonth,lDay,isLeap,cYear,cMonth,cDay) {

	      this.isToday    = false;
	      //瓣句
	      this.sYear      = sYear;   //公元年4位数字
	      this.sMonth     = sMonth;  //公元月数字
	      this.sDay       = sDay;    //公元日数字
	      this.week       = week;    //星期, 1个中文
	      //农历
	      this.lYear      = lYear;   //公元年4位数字
	      this.lMonth     = lMonth;  //农历月数字
	      this.lDay       = lDay;    //农历日数字
	      this.isLeap     = isLeap;  //是否为农历闰月?
	      //八字
	      this.cYear      = cYear;   //年柱, 2个中文
	      this.cMonth     = cMonth;  //月柱, 2个中文
	      this.cDay       = cDay;    //日柱, 2个中文

	      this.color      = '';

	      this.lunarFestival = ''; //农历节日
	      this.solarFestival = ''; //公历节日
	      this.solarTerms    = ''; //节气
	};

	var StringBuffer = function() {
			this._strings = new Array();
	};

	_.extend(StringBuffer.prototype,{
		toString: function() {
			var str = arguments.length == 0 ? '' : arguments[0];
			return this._strings.join(str);
		},

		append:function(str) {
			this._strings.push(str);
			return this;
		}
	});

	_.extend(String.prototype, {
		leftpad: function(len, str) {
			if (!str) {
				str = '0';
			}
			
			var s = '';
			for (var i = 0; i < len - this.length; i++) {
				s += str;
			}
			return s + this;
		}
	});
	return new calendarManager();
});