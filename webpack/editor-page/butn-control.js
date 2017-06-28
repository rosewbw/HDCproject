(function($) {
	
	var options = null;

	function BtnControlInterface(obj, callback) {
		this.id = null;
		options = initOptions();
		if(obj.info) {
			if(typeof callback === 'function') {
				setEvent(obj, callback, this);
			} else {
				setEvent(obj, null, this);
			}
		} else {
			console.log('error! miss info!');
			return false;
		}
	}

	BtnControlInterface.prototype.destroy = function() {
		$('#'+options.btnLayer).unbind();
		options.video.unbind();
		options = null;
	};

	function setEvent(obj, callback, response) {
		var control = new butn(obj);
		control.layoutButton(obj.info);
		control.butnLayer.bind({
			'mousedown': function(e) {
				var elm = getSrc(e);				
				if(elm.hasClass('editor-button')) {
					var oriPosition = getOriPosition(e, elm);
					var elmPosition = getElmPosition(elm);
					$(document).bind({
						'mousemove': function(e) {
							control.moveButton(e, elm, oriPosition);
						},
						'mouseup': function() {
							$(document).unbind();
							var newElmPosition = getElmPosition(elm);
							if(newElmPosition.left !== elmPosition.left || newElmPosition.top !== elmPosition.top) {
								callback ? callback('changeButnPosition', {id: elm.attr('id').match(/[^\_]+/)[0], position: newElmPosition}) : '';
							}							
						}
					});
				} else if(/\-square$/.test(elm.attr('class'))) {
					var clickPosition = getClickPosition(e);
					var originSize = getSize(elm.parent().parent());
					var padding = parseInt(elm.parent().css('padding-left').match(/\d+/));
					var border = parseInt(elm.parent().parent()[0].style.borderWidth.match(/\d+/));
					var reduce = padding - border;
					$(document).bind({
						'mousemove': function(e) {
							zoomButton.apply(control,[e, elm.parent().parent(), clickPosition, elm.attr('class'), originSize, reduce]);
						},
						'mouseup': function(e) {
							$(document).unbind();
							var newSize = getSize(elm.parent().parent());
							var id = elm.parent().parent().attr('id').match(/[^\_]+/)[0];
							if(newSize.width !== originSize.width || newSize.height !== originSize.height) {
								callback ? callback('changeButnSize', {id: id, size: newSize}) : '';
							}							
						}
					});
				}
			},
			'click': function(e) {
				var elm = getSrc(e);
				if(elm.hasClass('editor-button')) {
					elmHighLight.apply(control, [elm]);
					initializeOpitons(elm);

					response.id = elm.attr('id');
				} else if(elm.is('input')) {
					elmHighLight.apply(control, [elm.parent()]);
					initializeOpitons(elm.parent());
					response.id = elm.parent().attr('id');
				}
				options.video.bind('click', videoClick.bind(response));
			},
			'change': function(e) {
				var input = getSrc(e);
				var id = input.parent().attr('id').match(/[^\_]+/)[0];
				callback? callback('changeButnName', {id: id, name: input.val()}) : '';
			}
		});
	}

	function butn(obj) {
		this.Info = obj.Info;
		this.butnLayer = $('#'+obj.butnLayer);
		this.videoBox = $('#'+obj.videobox);
		this.frameClass = obj['frame-class'];
		this.nwSquareClass = obj['nw-square-class'];
		this.neSquareClass = obj['ne-square-class'];
		this.swSquareClass = obj['sw-square-class'];
		this.seSquareClass = obj['se-square-class'];
		options.video = $('#'+obj.video);
		options.btnLayer = obj.butnLayer;
		options.frameClass = obj['frame-class'];
		options.props.opacityId = obj.opacityId || 'Opacity';
		options.props.fontSizeId = obj.fontSizeId || 'Font-Size';
		options.props.radiusId = obj.radiusId || 'Radius';
		options.props.borderWidthId = obj.borderWidthId || 'Border-Width';
		options.props.uploadImageViewId = obj['upload-image-view-id'] || 'upload-img-view';
	}

	butn.prototype.layoutButton = function(elmInfo) {
		var butn = getChangeOrNoChangeButn(elmInfo);
		layoutNoChangedButn(butn.noChanged, this);
		layoutChangedButn(butn.changed, this);
	}

	butn.prototype.removeButton = function() {
		this.butnLayer.children().remove();
	}

	butn.prototype.moveButton = function(e, elm, oriPosition) {
		elm.offset({
			left: e.clientX-oriPosition.clickLeft,
			top: e.clientY-oriPosition.clickTop
		});
	}

	function getChangeOrNoChangeButn(elmInfo) {
		var changedButn = [];
		var noChangedButn = [];
		elmInfo.buttons.map(function(butn) {
			if(butn.buttonOptions.position.x === null) {
				noChangedButn.push(butn);
			} else {
				changedButn.push(butn);
			}
		});
		return {changed: changedButn, noChanged: noChangedButn};
	}

	function layoutNoChangedButn(butnInfo, _this) {
		var left = 15;
		var auto = getAutoSizeAndPosition(butnInfo.length, _this.videoBox);
		butnInfo.map(function(info) {
			info.buttonOptions.position.x = left;
			info.buttonOptions.position.y = auto.top;
			info.buttonOptions.size.x = auto.width;
			_this.butnLayer.append(createButn.apply(_this,[info]));
			info.buttonOptions.position.x = null;
			info.buttonOptions.position.y = null;
			left += auto.width + 30;
		});
	}

	function layoutChangedButn(butnInfo, _this) {
		butnInfo.map(function(info) {
			_this.butnLayer.append(createButn.apply(_this,[info]));
		});
	}

	function getAutoSizeAndPosition(counts, videoBox) {
		var width = Math.floor(videoBox.width()/counts - 30);
		var top = Math.floor(videoBox.height()*0.75);
		return {width: width, top: top};
	}

	function createButn(info) {
		var button = create('div');
		var frame = layoutZoomFrame(create('div'), this);
		var input = create('input');
		setButnCss(button, input, info);
		return button.append(input, frame);
	}

	function setButnCss(butn, input, info) {
		butn.css({
			'position': 'absolute',
			'text-align': 'center',
			'cursor': 'pointer',
			'background-color': info.buttonOptions.color,
			'background-image': 'url('+info.buttonOptions.backgroundImage+')',
			'background-size': '100% 100%',
			'border-radius': info.buttonOptions.radius,
			'width': info.buttonOptions.size.x,
			'height': info.buttonOptions.size.y,
			'left': info.buttonOptions.position.x,
			'top': info.buttonOptions.position.y,
			'line-height': info.buttonOptions.size.y+'px',
			'border-width': info.buttonOptions.borderWidth,
			'border-color': info.buttonOptions.borderColor,
			'border-style': info.buttonOptions.borderStyle
		})
		.attr('id',info.targetId+'_')
		.addClass('editor-button');
		input.css({
			'width': '80%',
			'border-style': 'none',
			'background': 'transparent',			
			'text-align': 'center',
			'color': info.buttonOptions.fontColor,
			'font-size': info.buttonOptions.fontSize,
			'vertical-align': 'middle'
		}).attr({
			'value': info.buttonOptions.name,
			'type': 'text'
		});
	}

    function getSrc(e) {
        e = e || window.event;
        var src = e.srcElement || e.target;
        return $(src);
    }

    function getOriPosition(e, elm) {
    	return ({
    		clickLeft: e.clientX-elm.offset().left, 
    		clickTop: e.clientY-elm.offset().top
    	});
    }

    function getClickPosition(e) {
    	return ({left: e.clientX, top: e.clientY});
    }

    function getSize(elm) {
    	return ({width: elm.width(), height: elm.height()});
    }

    function getElmPosition(elm) {
    	return ({left: elm.css('left'), top: elm.css('top')});
    }

    function layoutZoomFrame(frame, obj) {
    	var nwSquare = create('div').addClass(obj.nwSquareClass);
    	var neSquare = create('div').addClass(obj.neSquareClass);
    	var seSquare = create('div').addClass(obj.seSquareClass);
    	var swSquare = create('div').addClass(obj.swSquareClass);
    	frame.append(nwSquare, neSquare, seSquare, swSquare)
    	.addClass(obj.frameClass);
    	return frame;
    }

    function zoomButton(e, butn, clickPosition, squareClass, originSize, reduce) {
    	var width = 0, height = 0;
    	if(squareClass === this.nwSquareClass || squareClass === this.swSquareClass) {
    		width = originSize.width - e.clientX + clickPosition.left;
    	} else {
    		width = originSize.width + e.clientX - clickPosition.left;
    	}
    	if(squareClass === this.nwSquareClass || squareClass === this.neSquareClass) {
			height = originSize.height - e.clientY + clickPosition.top;
    	} else {
    		height = originSize.height + e.clientY - clickPosition.top;
    	}
		butn.css({'height': height, 'width': width, 'line-height': height+'px'});

    	if(squareClass === this.nwSquareClass) {
    		butn.offset({'left': e.clientX + reduce, 'top': e.clientY + reduce});
    	} else if(squareClass === this.neSquareClass) {
    		butn.offset({top: e.clientY + reduce});
    	} else if(squareClass === this.swSquareClass) {
    		butn.offset({'left': e.clientX + reduce});
    	}
    }

    function initializeOpitons(elm) {
    	$.each(options.props, function(index, value) {
    		var slider = $('#'+value);
    		var barWidth = slider.parent().width();
    		var input = $('input[name='+slider.attr('id')+']');
    		if(index === 'opacityId') {    			
    			initOpacity(elm, slider, input, barWidth);
    		} else if(index === 'uploadImageViewId') {
				slider.css('background-image', setUploadImgView(elm));
			} else  {
    			initOption(elm, slider, input, barWidth, value);
    		}
    	});
    }

    function initOpacity(elm, slider, input, barWidth) {
    	var colorArray;
    	if(elm.css('background-color') === 'transparent') {
    		colorArray = 'transparent';
    	} else {
    		colorArray = elm.css('background-color').match(/\d+/g);
    	}
    	if(colorArray === 'transparent' || colorArray.length === 4) {
    		slider.css('left', 0);
    		input.val('0');
    	} else if(colorArray.length === 3) {
    		slider.css('left', barWidth);
    		input.val('100');

    	} else if(colorArray.length === 5) {
    		var opacity = colorArray[3]+'.'+colorArray[4];
    		var value = Math.floor(opacity*slider.attr('max'));
    		slider.css('left', opacity*barWidth);
    		input.val(value);
    	}
    }

    function initOption(elm, slider, input, barWidth, select) {
    	var cssNative, cssjQuery;
    	if(select === 'Font-Size') {
    		cssNative = 'fontSize';
    		cssjQuery = 'font-size';
    		elm = elm.children('input');
    	} else if(select === 'Radius') {
    		cssNative = 'borderRadius';
    		cssjQuery = 'border-radius';    		
    	} else if(select === 'Border-Width') {
    		cssNative = 'borderWidth';
    		cssjQuery = 'border-width';
    	}
    	var value = Math.floor((elm[0].style[cssNative] || elm.css(cssjQuery)).match(/\d+/));
    	slider.css('left', Math.floor(value/slider.attr('max')*barWidth));
    	input.val(value);
    }

	function setUploadImgView(btn) {
		return btn.css('background-image');
	}

    function videoClick() {
		this.id = null;
    	cancleElmHightLight(options.frameClass);
		options.video.unbind('click');
    }

    function elmHighLight(elm) {
    	$('.'+this.frameClass).css('display','none');
    	elm.children('.'+this.frameClass).css('display','block');
    }

    function cancleElmHightLight(className) {
    	$('.'+className).css('display','none');
    }

	function initOptions() {
		return {
			video: 'video',
			frameClass: 'butn-frame',
			btnLayer: '',
			props: {}
		}
	}

    function create(table) {
        var xmlns = 'http://www.w3.org/2000/svg';
        switch (table) {
        case 'p':
            return $('<p></p>');
        case 'img':
            return $('<img>');
        case 'div':
            return $('<div></div>');
        case 'span':
            return $('<span></span>');
        case 'input':
            return $('<input></input>');
        case 'svg':
            return $(document.createElementNS(xmlns, 'svg'));
        case 'path':
            return $(document.createElementNS(xmlns, 'path'));
        case 'rect':
            return $(document.createElementNS(xmlns, 'rect'));
        case 'svg-ori':
            return document.createElementNS(xmlns, 'svg');
        case 'path-ori':
            return document.createElementNS(xmlns, 'path');
        case 'rect-ori':
            return document.createElementNS(xmlns, 'rect');
        }
    }

    window.butnContol = BtnControlInterface;

})(jQuery);

if(typeof module !== 'undefined') {
	module.exports = window.butnContol;
}