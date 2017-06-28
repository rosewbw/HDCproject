(function($) {

	var options = {
		butn: null,
		basicOptionsId: 'editor-basic-options',
		sliderClass: 'option-bar-slider',
		optionBarClass: 'option-bar',
		colorBlockClass: 'color-block',
		colorOptionsFormId: 'color-options-form',
		controllerId: 'editor-butn-options-controller',
		maxValue: {
			'Font-Size': 100,
			'Radius': 100,
			'Opacity': 100,
			'Border-Width': 30
		}
	};

	function OptionsControlInterface(obj, callback) {
		getOptions(obj);
		setEvents(this, callback);
	}

	function setEvents(fn, callback) {
		$('#'+options.controllerId).bind({
			'mousedown': function(e) {
				var elm = getSrc(e);
				if(elm.hasClass(options.sliderClass)) {
					var bar = elm.parent();
					var initialData = getInitalData(bar, elm.attr('id'));
					var finalValue = null;
					$(document).bind({
						'mousemove': function(e) {
							var left = e.clientX;
							fn.moveSlider(left, initialData.barLeft, initialData.barWidth, elm);
							var value = setInputValue(elm, initialData.barWidth, initialData.maxValue, initialData.input);
							finalValue = options.butn.id ? setAttr(initialData.option, value, options.butn.id, initialData.butnOriginPosition, initialData.butnOriginBorderWidth) : null;
						},
						'mouseup': function() {
							$(document).unbind();
							if(callback && options.butn.id) {
								callback(initialData.option, {id: getBtnId(), value: finalValue});
							}
						}
					});
				}
			},
			'click': function (e) {
				var elm = getSrc(e);
				if(elm.hasClass(options.colorBlockClass)) {
					removeHighlight();
					highlight(elm);
					var colorChanged = changeColor(options.colorOptionsFormId, options.butn.id, elm);
					if(callback && colorChanged && options.butn.id) {
						callback(colorChanged.type, {id: getBtnId(), value: colorChanged.color});
					}
				} else if(elm.hasClass(options.optionBarClass)) {
					var slider = elm.children('.'+options.sliderClass);
					var left = e.clientX;
					var initialData = getInitalData(elm, slider.attr('id'));
					fn.moveSlider(left, initialData.barLeft, initialData.barWidth, slider);
					var value = setInputValue(slider, initialData.barWidth, initialData.maxValue, initialData.input);
					if(options.butn.id && callback) {
						var finalValue = setAttr(initialData.option, value, options.butn.id, initialData.butnOriginPosition, initialData.butnOriginBorderWidth);
						callback(initialData.option, {id: getBtnId(), value: finalValue});
					}
				}
			}
		});
	}

	OptionsControlInterface.prototype.moveSlider = function(left, barLeft, barWidth, slider) {
		if(left <= barLeft) {
			left = barLeft;
		} else if(left >= barLeft + barWidth) {
			left = barLeft + barWidth;
		}
		slider.offset({left: left});
	};

	OptionsControlInterface.prototype.destroy = function() {
		$('#'+options.controllerId).unbind();
		options.butn = null;
	};

	function getInitalData(bar, sliderId) {
		return {
			barLeft: parseInt(bar.offset().left),
			barWidth: bar.width(),
			input: $('input[name=' + sliderId + ']'),
			option: sliderId,
			maxValue: getMaxValue(sliderId),
			butnOriginPosition: options.butn.id? getBtnOriginPosition(options.butn.id):'',
			butnOriginBorderWidth: options.butn.id? getBtnOriginBorderWidth(options.butn.id):''
		}
	}

	function getBtnOriginPosition(id) {
		var btn = $('#'+id);
		return {left: parseInt(btn.css('left').match(/\d+/)), top: parseInt(btn.css('top').match(/\d+/))}
	}

	function getBtnOriginBorderWidth(id) {
		return parseInt($('#'+id)[0].style.borderWidth.match(/\d+/))
	}

	function setInputValue(slider, barWidth, maxValue, input) {
		var value = Math.floor(slider.css('left').match(/\d+/)/barWidth*maxValue);
		input.val(value);
		return value;
	}

	function setAttr(option, value, id, originPosition, originBorderWidth) {
		var butn = $('#'+id);
		if(option === 'Opacity') {
			var RGB = getRGB(butn);
			var opacity = value/100;
			butn.css('background-color','rgba('+RGB.R+','+RGB.G+','+RGB.B+','+opacity+')');
			return butn.css('background-color');
		} else if(option === 'Font-Size') {
			butn.children('input').css('font-size',value);
			return value;
		} else if(option === 'Radius') {
			butn.css('border-radius',value+'px');
			return value;
		} else if(option === 'Border-Width') {
			butn.css({
				'border-width': value+'px',
				'left': originPosition.left + (originBorderWidth - value),
				'top': originPosition.top + (originBorderWidth - value)
			});
			return value+'px';
		}
	}

	function getMaxValue(option) {
		return options.maxValue[option];
	}

	function getRGB(butn) {
		var rgb = (butn[0].style.backgroundColor || butn.css('background-color')).match(/\d+/g);
		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];
		return ({R: r, G: g, B: b});
	}

	function removeHighlight() {
		$('.'+options.colorBlockClass).css({
			'border-color':'#bbb',
			'background-image': 'url(#)'
		});
	}

	function highlight(elm) {
		elm.css({
			'border-color':'#32ff45',
			'background-image': 'url(/images/correct.png)',
			'background-size': '100% 100%'
		});
	}

	function changeColor(formId, btnId, colorBlock) {
		var type = getColorChangeType(formId);
		var btn = $('#'+btnId);
		if(type && btn[0]) {
			var color = colorBlock.css('background-color');
			if(type === 'font') {
				btn.children('input').css('color', color);
			} else if(type === 'button') {
				btn.css('background-color', color);
				return {type: 'Opacity', color: color}
			} else if(type === 'border') {
				btn.css('border-color', color);
			}
			return {type: type, color: color}
		}
		return false
	}

	function getColorChangeType(formId) {
		var inputs = $('#'+formId).children('input');
		var type = false;
		inputs.map(function (index) {
			if(inputs[index].checked === true) {
				type = inputs[index].id.match(/[^\-]+$/)[0];
			}
		});
		return type
	}

	function getBtnId() {
		return options.butn.id.match(/[^\_]+/)[0]
	}

	function getOptions(obj) {
		for(var option in obj) {
			options[option] = obj[option];
		}
	}

	function getSrc(e) {
		return $(e.srcElement || e.target);
	}

	window.optionsControl = OptionsControlInterface;

})(jQuery);

if(typeof module !== 'undefined') {
	module.exports = window.optionsControl;
}