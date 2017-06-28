(function($) {

	function publicInterface(obj) {
		if(obj.elmInfo) {
			setEvent(obj);
		} else {
			console.log('miss elmInfo');
			return false;
		}
	}

	function setEvent(obj) {
		var control = new butn(obj);
		control.update(control.getStartElmInfo());
		control.butnLayer.bind('click',function(e) {
			var id = getSrc(e).id;
			control.update(control.getNextElmInfo(id));
		});
	}

	function butn(obj) {
		this.elmInfo = obj.elmInfo;
		this.butnLayer = $('#'+obj.butnLayer);
		this.video = $('#'+obj.video);
		this.videoBox = $('#'+obj.videobox);
	}

	butn.prototype.update = function(elmInfo) {
		this.removeButton();
		this.switchVideo(elmInfo.videoUrl);
		this.layoutButton(elmInfo);
	}

	butn.prototype.getStartElmInfo = function() {
		var element = null ;
		this.elmInfo.map(function(elm) {
			if(elm && elm.isStart) element = elm; 
		});
		if(element) {
			return element;
		} else {
			return null;
		}
	}

	butn.prototype.getNextElmInfo = function(id) {
		var element = null ;
		this.elmInfo.map(function(elm) {
			if(elm && elm.id === id) element = elm;
		});
		if(element) {
			return element;
		} else {
			return null;
		}
	}

	butn.prototype.switchVideo = function(url) {
		this.video.attr('src', url);
		this.video[0].play();
	}

	butn.prototype.layoutButton = function(elmInfo) {
		var butn = getChangeOrNoChangeButn(elmInfo);
		layoutNoChangedButn(butn.noChanged, this.butnLayer, this.videoBox);
		layoutChangedButn(butn.changed, this.butnLayer);
	}

	butn.prototype.removeButton = function() {
		this.butnLayer.children().remove();
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

	function layoutNoChangedButn(butnInfo, butnLayer, videoWidth) {
		var left = 15;
		var auto = getAutoSizeAndPosition(butnInfo.length, videoWidth);		
		butnInfo.map(function(info) {
			info.buttonOptions.position.x = left;
			info.buttonOptions.position.y = auto.top;
			info.buttonOptions.size.x = auto.width;
			butnLayer.append(createButn(info));
			left += auto.width + 30;
		});
	}

	function layoutChangedButn(butnInfo, butnLayer) {
		butnInfo.map(function(info) {
			butnLayer.append(createButn(info));
		});
	}

	function getAutoSizeAndPosition(counts, videoBox) {
		var width = Math.floor(videoBox.width()/counts - 30);
		var top = Math.floor(videoBox.height()*0.75);
		return {width: width, top: top};
	}

	function createButn(info) {
		var button = create('div');
		setButnCss(button, info);
		return button;
	}

	function setButnCss(div, info) {
		div.css({
			'position': 'absolute',
			'text-align': 'center',
			'cursor': 'pointer',
			'background-color': info.buttonOptions.color,
			'background-image': 'url('+info.buttonOptions.backgroundImage+')',
			'background-size': '100% 100%',
			'border-radius': info.buttonOptions.radius,
			'font-size': info.buttonOptions.fontSize,
			'color': info.buttonOptions.fontColor,
			'width': info.buttonOptions.size.x,
			'height': info.buttonOptions.size.y,
			'left': info.buttonOptions.position.x,
			'top': info.buttonOptions.position.y,
			'line-height': info.buttonOptions.size.y+'px',
			'border-width': info.buttonOptions.borderWidth,
			'border-color': info.buttonOptions.borderColor,
			'border-style': info.buttonOptions.borderStyle
		})
		.text(info.buttonOptions.name)
		.attr('id',info.targetId);
	}

    function getSrc(e) {
        e = e || window.event;
        var src = e.srcElement || e.target;
        return src;
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

	window.preview = publicInterface;

})(jQuery);