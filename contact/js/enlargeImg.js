define(
	function(){
		return {
			enlargeImg: function(imgUrl, container, smallImgNode){
				var me = this;
				var ceng = "<div class='ceng-img'><img src='"+imgUrl+"'></div>";
				container.append(ceng);			
				//获得小图片的位置
				var smallWidth =  smallImgNode.width();
				var smallheight = smallImgNode.height();
				var smallX = smallImgNode.offset().left + smallWidth/2;
				var smallY = smallImgNode.offset().top + smallheight/2;
				console.log("-----"+smallX+","+smallY);
				var cengNode = $(".ceng-img");
				cengNode.css({"width":"100%","height":"100%","position":"fixed","background-color":"black"})
				cengNode.find("img").css({"width":"100%"});
				var bigH = cengNode.height();
				var imgH = cengNode.find("img").height();
				var marginTop = (bigH-imgH)/2+"px";
				cengNode.find("img").css({"margin-top":marginTop});
				cengNode.css("left",smallX);
				cengNode.css("top", smallY);
				cengNode.animate({
					left:0+"px",
					top: 0+"px",
					width: 100+"%",
					height: 100+"%"
				}, 200,'linear');
				cengNode.on("click",function(){
					cengNode.animate({
						left:smallX+"px",
						top:smallY+"px",
						width:0+"px",
						height:0+"px"
					},200,'linear', function(){cengNode.remove();});
					

				});
			}
		}
	}
)