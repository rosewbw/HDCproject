/**
 * Created by Administrator on 2015/12/12.
 */

var animation = function(){
    var OpacityAnimationSetTimeId;
    function OpacityAnimation(startOpacity,EndOpacity,ms,Element,RGB){
        var speed = (startOpacity-EndOpacity)/ms*2;
        speed>0? OpDecrease():OpEnlarge();
        function OpDecrease(){
            startOpacity -= speed;
            Element.style.background = 'rgba(' + RGB[0] + ',' + RGB[1] + ',' + RGB[2] + ',' + startOpacity + ')';
            if(startOpacity < EndOpacity){
               return startOpacity;
            }
            OpacityAnimationSetTimeId = setTimeout(OpDecrease,0);
        }
        function OpEnlarge(){
            startOpacity -= speed;
            Element.style.background = 'rgba(' + RGB[0] + ',' + RGB[1] + ',' + RGB[2] + ',' + startOpacity + ')';
            if(startOpacity>EndOpacity){
                return startOpacity;
            }
            OpacityAnimationSetTimeId = setTimeout(OpEnlarge,1);
        }
    }
    function clearOpacityAnimation(){
        clearTimeout(OpacityAnimationSetTimeId);
    }
    function displacementAnimation(Ox,Oy,x,y,Element,time,rescale,ori_scale){
        var XSpeed,YSpeed;
        XSpeed = (Ox-x)/800*6/time;
        YSpeed = (Oy-y)/800*6/time;
        scale_speed = (1-ori_scale)/800*6/time;
        if(XSpeed>=0 && YSpeed>=0){
            XYDecrease();
        }
        else if(XSpeed<=0 && YSpeed<=0){
            XYEnlarge();
        }
        else if(XSpeed>=0 && YSpeed<=0){
            XDecYEnlarge();
        }
        else{
            YDecXEnlarge();
        }
        function XYDecrease(){
            Oy -= YSpeed;
            Ox -= XSpeed;
            ori_scale += scale_speed;
            // Element.style.top = Oy + 'px';
            // Element.style.left = Ox + 'px';
            Element.offset(function(index,oldoffset){
                return {left:Ox,top:Oy};
            });
            rescale? Element.css('transform','scale('+ori_scale+')'):'';
            if(Ox<=x && Oy<=y){
                // Element.style.top = y + 'px';
                // Element.style.left = x + 'px';
                Element.offset(function(index,oldoffset){
                    return {left:x,top:y};
                });
                Element.remove();
                return [Ox,Oy];
            }
            //displacementAnimationSetTimeId = setTimeout(XYDecrease,1);
            Element.clearId = setTimeout(XYDecrease,1);
        }
        function XYEnlarge(){
            Ox -= XSpeed;Oy -= YSpeed;
            ori_scale += scale_speed;
            // Element.style.left = Ox + 'px';
            // Element.style.top = Oy + 'px';
            Element.offset(function(index,oldoffset){
                return {left:Ox,top:Oy};
            });
            rescale? Element.css('transform','scale('+ori_scale+')'):'';
            if(Ox>=x && Oy>=y){
                // Element.style.top = y + 'px';
                // Element.style.left = x + 'px';
                Element.offset(function(index,oldoffset){
                    return {left:x,top:y};
                });
                Element.remove();
                return [Ox,Oy];
            }
            //displacementAnimationSetTimeId = setTimeout(XYEnlarge,1);
            Element.clearId = setTimeout(XYEnlarge,1);
        }
        function XDecYEnlarge(){
            Ox -= XSpeed;Oy -= YSpeed;
            ori_scale += scale_speed;
            // Element.style.left = Ox + 'px';
            // Element.style.top = Oy + 'px';
            Element.offset(function(index,oldoffset){
                return {left:Ox,top:Oy};
            });
            rescale? Element.css('transform','scale('+ori_scale+')'):'';
            if(Oy>=y && Ox<=x){
                // Element.style.top = y + 'px';
                // Element.style.left = x + 'px';
                Element.offset(function(index,oldoffset){
                    return {left:x,top:y};
                });
                Element.remove();
                return [Ox,Oy];
            }
            //displacementAnimationSetTimeId = setTimeout(XDecYEnlarge,1);
            Element.clearId = setTimeout(XDecYEnlarge,1);
        }
        function YDecXEnlarge(){
            Ox -= XSpeed;Oy -= YSpeed;
            ori_scale += scale_speed;
            // Element.style.top = Oy + 'px';
            // Element.style.left = Ox + 'px';
            Element.offset(function(index,oldoffset){
                return {left:Ox,top:Oy};
            });
            rescale? Element.css('transform','scale('+ori_scale+')'):'';
            if(Oy<=y && Ox>=x){
                // Element.style.top = y + 'px';
                // Element.style.left = x + 'px';
                Element.offset(function(index,oldoffset){
                    return {left:x,top:y};
                });
                Element.remove();
                return [Ox,Oy];
            }
            //displacementAnimationSetTimeId = setTimeout(YDecXEnlarge,1);
            Element.clearId = setTimeout(YDecXEnlarge,1);
        }
    }
    function clearDisplacementAnimation(ClearId){
        clearTimeout(ClearId);
    }
    return{
        OpacityAnimation:function(startOpacity,EndOpacity,ms,Element,RGB){
            OpacityAnimation(startOpacity,EndOpacity,ms,Element,RGB);
        },
        clearOpacityAnimation:function(){
            clearOpacityAnimation();
        },
        displacementAnimation:function(Ox,Oy,x,y,Element,time,rescale,ori_scale){
            displacementAnimation(Ox,Oy,x,y,Element,time,rescale,ori_scale);
        },
        clearDisplacementAnimation:function(clearId){
            clearDisplacementAnimation(clearId);
        }
    }
}();





















