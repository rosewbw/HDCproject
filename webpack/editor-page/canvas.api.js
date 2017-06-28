(function($) {
    
    var ctrl = {
        canvas: null ,
        trans: null ,
        imgCont: null ,
        svgCont: null ,
        start: null ,
        list: null ,
        remove: null
    };
    
    var basic_options = {
        imgClassOnList: 'canvas-api-img-main',
        imgClassOnCanvas: 'canvas-api-img-main',
        imgBoxClass: 'canvas-api-imgbox',
        imgBoxClassOnCanvas: 'canvas-api-imgbox',
        startClass: 'canvas-api-start',
        pathCollect: 'canvas-api-path-collect',
        butnEditorId: 'start-butn-editor',
        removeButtonClass: 'canvas-api-remove-butn',
        removeButtonPosition: null,
        removeButnColor: '#23df67',
        circle: 'canvas-api-circle',
        circleSize: [20, 20],
        floatImgOpacity: 0.7,
        hightLightColor: '#34a3cf',
        pathAboveColor: '#000',
        pathBottomColor: '#fff',
        pathAboveWidth: 2,
        pathHighLight: '#fff',
        pathBottomWidth: 3,
        arrowBottom: 4,
        arrowHeight: 6
    };
    
    var targetUrl = null ;
    var img_ori_position = {};
    var scale = 1;
    var path_container = [];
    var path_from = null ;
    var elements = [];
    
    
    function canvas_constructor(canvas, list, obj, callback) {
        this.data = [];
        this.list = list;
        this.canvas = canvas;
        if (arguments.length === 4) {
            update_basic_options(obj);
            create_canvas(canvas, list);
            set_event(canvas, list, this, obj.info, callback);
        } else if (typeof (obj) === 'function') {
            callback = obj;
            update_basic_options({});
            create_canvas(canvas, list);
            set_event(canvas, list, this, null , callback);
        } else if (typeof (obj) === 'object') {
            update_basic_options(obj);
            create_canvas(canvas, list);
            set_event(canvas, list, this, obj.info);
        }
    }
    
    function ElementOptions(_videoUrl, _imgUrl, _Name, _Id, _x, _y, _Duration) {
        this.videoUrl = _videoUrl;
        this.imgUrl = _imgUrl;
        this.name = _Name;
        this.id = _Id;
        this.duration = _Duration;
        this.position = {
            x: _x,
            y: _y
        };
        this.button = [];
        this.isStart = false;
    }
    
    function ButtonConstructor(_TargetId, _Name) {
        this.targetId = _TargetId;
        this.buttonOptions = new ButtonOptions(_Name);
    }
    
    function ButtonOptions(_Name) {
        this.name = _Name;
        this.hideAnimationSpeed = 500;
        this.backgroundImage = null;
        this.position = {
            x: null,
            y: null
        };
        this.color = 'rgba(100,149,237,0.7)';
        this.size = {
            x: null,
            y: 40
        };
        this.fontSize = 18;
        this.radius = 5;
        this.borderWidth = '0';
        this.borderColor = '#ffffff';
        this.borderStyle = 'solid';
        // this.ButtonType = null ;
        this.fontColor = '#ffffff';
        this.start = 0;
        this.end = 0;
    }
    
    function create_canvas(canvas, list) {
        if (typeof (canvas) === 'string' && typeof (list) === 'string' && canvas !== null  && list !== null ) {
            init_canvas(canvas, list);
        } else {
            console.log('error,canvas/list undefined');
        }
    }
    
    function init_canvas(canvas, list) {
        var transform = create('div').addClass('canvas-api-trans').attr('id', 'canvas-transform');
        var start = create('div').addClass(basic_options.startClass).attr('id', 'trans-start').text('Start');
        var imgContainer = create('div').addClass('canvas-api-trans').attr('id', 'trans-img-cont');
        var svgContainer = create('div').addClass('canvas-api-trans').attr('id', 'trans-svg-cont');
        var remove = create('div').addClass(basic_options.removeButtonClass).attr('id','canvas-remove-butn').text('Delete');
        $(canvas).append(transform.append(start, imgContainer, svgContainer)).css('overflow', 'hidden');
        basic_options.removeButtonPosition ? $('#'+basic_options.removeButtonPosition).append(remove) : $(canvas).append(remove);
        get_canvas_ctrl(canvas, transform, svgContainer, imgContainer, start, list, remove);
    }
    
    function get_canvas_ctrl(canvas, trans, svgCont, imgCont, start, list, remove) {
        ctrl.canvas = $(canvas);
        ctrl.list = $(list);
        ctrl.trans = trans;
        ctrl.svgCont = svgCont;
        ctrl.imgCont = imgCont;
        ctrl.start = start;
        ctrl.remove = remove;
        ctrl.butnEditor = $('#'+basic_options.butnEditorId);
    }
    
    function set_event(canvas, list, canv, info, callback) {
        
        var css_trans_origin = $(ctrl.trans).css('transform-origin').match(/\d+/g);
        var css_trans_offset = $(ctrl.trans).offset();
        var fn = new func();
        
        fn.init(info);
        
        fn.hover(ctrl.svgCont);
        
        fn.mediaList.bind({
            'mousedown': function(e) {
                var ele = fn.getsrc(e);
                if (ele.attr('class') === basic_options.imgBoxClass || ele.parents(basic_options.imgBoxClass)[0]) {
                    ele.parents(basic_options.imgBoxClass)[0] ? ele = ele.parents(basic_options.imgBoxClass) : '';
                    var floatImg = fn.add_float_img(e, ele);
                    $(document).bind({
                        'mousemove': function(e) {
                            fn.move_floatImg(e, floatImg);
                        },
                        'mouseup': function(e) {
// No.1 发送添加新元素请求，发送新元素的信息，id、name、position等
                            var newElementInfo = fn.put_or_release_floatImg(e, floatImg);
                            callback && newElementInfo ? callback('pushNewElm', newElementInfo) : '';
                            $(document).unbind();
                        }
                    });
                }
            }
        });
        
        fn.canvas.bind({
            'mousedown': function(e) {
                var ele = fn.getsrc(e);
                var trans_position = fn.trans.offset();
                var click_position = fn.get_click_position(e);
                var click_position_on_img = fn.get_click_position_on_img(e, ele);
                if (ele.hasClass(basic_options.imgBoxClass) || ele.attr('id') === ctrl.start.attr('id')) {
                    fn.canvas_input_disabled($(this), ele);
                    $(document).bind({
                        'mousemove': function(e) {
                            fn.move_canvas_ele(e, ele, click_position_on_img);
                        },
                        'mouseup': function(e) {
//No.2 发送元素移动信息，发送元素移动后的新位置信息 position{x: , y: }
                            var newPositionInfo = fn.canvas_input_abled(fn.imgContainer, ele);
                            if (ele.attr('id') === ctrl.start.attr('id')) {
                                callback ? callback('pushStartPosition', newPositionInfo) : '';
                            } else {
                                callback ? callback('pushNewPosition', newPositionInfo) : '';
                            }
                            $(document).unbind();
                        }
                    });
                } else if (ele.attr('id') === ctrl.canvas.attr('id')) {
                    fn.canvas_input_disabled($(this));
                    $(document).bind({
                        'mousemove': function(e) {
                            fn.move_canvas(e, click_position, trans_position, css_trans_origin, css_trans_offset);
                        },
                        'mouseup': function(e) {
                            fn.canvas_input_abled(fn.imgContainer);
                            $(document).unbind();
                        }
                    });
                }
            
            },
            'click': function(e) {
                var ele = fn.getsrc(e);
                if (ele.attr('class') === basic_options.imgBoxClass) {
                    fn.ele_highLight(ele, this);
                    removeButnHighLight(true);
                    editorButnHighLight(true);
                    path_highLight_ended();
                } else if (ele.hasClass(basic_options.circle) || ele.parents('.' + basic_options.circle)[0]) {
                    var svgobj;
                    ele = fn.search_ele(ele.parents('.' + basic_options.circle));
                    svgobj = fn.ready_for_path(ele);
                    removeButnHighLight(false);
                    editorButnHighLight(false);
                    path_highLight_ended();
                    $(document).bind({
                        'mousemove': function(e) {
                            fn.path_moving(e, svgobj, ele);
                        }
                    });
                } else if (ele.attr('class') === basic_options.pathCollect) {
//No.3 发送添加新路径请求，发送新路径的 fromId 和 targetId
                    var newPathInfo = fn.staticed_path(ele.parent());
                    callback ? callback('pushNewPath', newPathInfo) : '';
                    $(document).unbind();
                } else if(ele[0].tagName === 'path') {
                    cancle_img_highLight(fn);
                    fn.path_highLight(ele.parent());
                    removeButnHighLight(true);
                    editorButnHighLight(false);
                } else {
                    fn.recover_canvas();
                    removeButnHighLight(false);
                    editorButnHighLight(false);
                    path_highLight_ended();
                }
            },
            'mousewheel': function(e, delta) {
                fn.zoom(delta);
            }
        });

        fn.removeButn.bind('click', function(e) {
            var type = '' ;
            var elmId = '' ;
            var butnId = '' ;
            var butnArray = [] ;
            e.stopPropagation();
            if($(this).hasClass('remove-active')) {
                var ele = fn.canvas.find('.chosen');
                if(ele.hasClass(fn.imgBox)) {
                    type = 'delElement';
                } else if(ele[0].tagName === 'svg') {
                    type = 'delPath';
                }
                path_container.map(function(c) {
                    if(c.from == ele[0]) {
                        remove_ele(c, fn);
                    } else if(c.to == ele[0]) {                        
                        if(c.from.id === fn.start.attr('id')) {
                            butnArray.push({elmId: 'isStart', butnId: c.to.id});
                        } else {
                           butnArray.push({elmId: c.from.id, butnId: c.to.id}); 
                       }
                       remove_ele(c, fn);                     
                    } else if(c.path == ele[0]) {
                        butnId = c.to.id;
                        if(c.from.id === fn.start.attr('id')) {
                            elmId = 'isStart';
                        } else {
                            elmId = c.from.id;
                        }
                        remove_ele(c, fn);
                    }
                });
//No.4 发送删除元素或路径的信息，发送要删除元素的id，或要删除路径的目标id，type='delElement'为删除元素，type='delPath'为删除路径
                if(type === 'delElement') {
                    ele.remove();
                    $(ele[0].circle).remove();
                    callback ? callback(type, {elmId: ele.attr('id'), butn: butnArray}) : '' ;                     
                } else if (type === 'delPath') {
                    callback? callback(type, {butn: [{elmId: elmId, butnId: butnId}]}) : '' ;
                } else {
                    console.log('error! no such element!');
                }
                removeButnHighLight(false);
                editorButnHighLight(false);
            }
        });
    
    }
    
    
    
    
    
    
    
    function func(obj) {
        this.trans = ctrl.trans;
        this.canvas = ctrl.canvas;
        this.svgContainer = ctrl.svgCont;
        this.imgContainer = ctrl.imgCont;
        this.mediaList = ctrl.list;
        this.removeButn = ctrl.remove;
        this.circleCover = basic_options.circle;
        this.start = ctrl.start;
        this.imgBox = basic_options.imgBoxClass;
        this.pathCollect = basic_options.pathCollect;
    }
    
    func.prototype.getsrc = function(e) {
        e = e || window.event;
        return $(e.srcElement || e.target);
    }
    
    func.prototype.stop_broswer = function(e) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        } 
        else {
            e.returnValue = false;
        }
    }
    
    func.prototype.get_click_position = function(e) {
        e = e || window.event;
        return {
            left: e.clientX,
            top: e.clientY
        };
    }
    
    func.prototype.init = function(info) {
        var fun = this;
        fun.start[0].circle = create_circle(fun.start, fun);
        if (info) {
            fun.start.css({
                'left': info.startPosition.x,
                'top': info.startPosition.y
            });
            circle_comewith_ele(fun.start);
            info.elements.map(function(elm) {
                var div = createNewElement(fun, elm.id, elm.imgUrl, elm.videoUrl);
                div.css({
                    'left': elm.position.x,
                    'top': elm.position.y
                });
                div[0].circle = create_circle(div, fun);
                div.children('input').attr('value', elm.name);
            });
            info.elements.map(function(elm) {
                elm.buttons.map(function(butn) {
                    var svg = add_path($('#' + elm.id), fun);
                    static_path($('#' + butn.targetId), $('#' + elm.id), fun);
                });
                if (elm.isStart) {
                    var svg = add_path(fun.start, fun);
                    static_path($('#' + elm.id), fun.start, fun);
                }
            });
        }
    }
    
    func.prototype.get_click_position_on_img = function(e, ele) {
        var click_position = this.get_click_position(e);
        var ele_position = get_ele_position_of_window(ele);
        return {
            left: click_position.left - ele_position.left,
            top: click_position.top - ele_position.top
        };
    }
    
    func.prototype.add_float_img = function(e, _this) {
        var float_img = create('div');
        this.mediaList.append(float_img);
        targetUrl = set_floatImg_css(e, float_img, this, _this);
        return float_img;
    }
    
    func.prototype.move_floatImg = function(e, floatImg) {
        var imgSize = get_img_size();
        floatImg.offset({
            left: e.clientX - imgSize[0] * scale,
            top: e.clientY - imgSize[1] * scale
        });
    }
    
    func.prototype.put_or_release_floatImg = function(e, floatImg) {
        if (this.getsrc(e).attr('id') === this.canvas.attr('id')) {
            floatImg.remove();
            return addImgOnCanvas(floatImg, e, this);
        } else if (typeof(animation) === 'object') {
            animation.displacementAnimation(floatImg.offset().left, floatImg.offset().top, img_ori_position.left, img_ori_position.top, floatImg, 0.8, true, scale);
            return null ;
        } else {
            floatImg.remove();
            return null ;
        }
    }
    
    func.prototype.move_canvas_ele = function(e, ele, click_position_on_img) {
        var mouse_position = this.get_click_position(e);
        var trans_position = get_ele_position_of_window(this.trans);
        ele.css({
            'left': (mouse_position.left - trans_position.left - click_position_on_img.left) / scale,
            'top': (mouse_position.top - trans_position.top - click_position_on_img.top) / scale
        });
        for (var i in path_container) {
            if (ele[0] == path_container[i].from || ele[0] == path_container[i].to) {
                path_move_with_img($(path_container[i].from), $(path_container[i].to), $(path_container[i].path));
            }
        }
        circle_comewith_ele(ele);
    }
    
    func.prototype.release_canvas_ele = function(e, _this) {
        unBind($(_this));
    }
    
    func.prototype.move_canvas = function(e, old_client_position, trans_position, css_trans_origin, css_trans_offset) {
        var originX, originY, trans_offset;
        var mouse_position = this.get_click_position(e);
        this.trans.offset(function(index, oldoffset) {
            return {
                left: trans_position.left + mouse_position.left - old_client_position.left,
                top: trans_position.top + mouse_position.top - old_client_position.top
            };
        });
        trans_offset = get_ele_position_of_window(this.trans);
        originX = (parseInt(css_trans_origin[0]) + css_trans_offset.left - trans_offset.left) / scale;
        originY = (parseInt(css_trans_origin[1]) + css_trans_offset.top - trans_offset.top) / scale;
        this.trans.css('transform-origin', originX + 'px ' + originY + 'px 0');
    }
    
    func.prototype.release_canvas = function(_this) {
        unBind($(_this));
    }
    
    func.prototype.ele_highLight = function(ele, _this) {
        $(_this).find('.' + this.imgBox).css({
            'box-shadow': '0 0 3px #000',
            'z-index': '10'
        }).removeClass('chosen');
        ele.css({
            'box-shadow': '0 0 0 5px #34a3cf',
            'z-index': '1000'
        }).addClass('chosen');
    }
    
    func.prototype.recover_canvas = function() {
        cancle_img_highLight(this);
        clear_path(this);
        recover_pointer_path_ended(this);
        path_from = null ;
    }
    
    func.prototype.ready_for_path = function(ele) {
        var svg_ori_position = get_path_from_position(ele);
        var svg = add_path(ele, this);
        path_from = ele;
        add_mask(this);
        ele_block($('.' + this.pathCollect));
        ignore_pointer_during_path(this);
        return {
            svg: svg,
            svg_ori_position: svg_ori_position
        };
    }
    
    func.prototype.search_ele = function(ele) {
        if (this.start[0].circle == ele[0]) {
            return this.start;
        } else {
            var allImg = this.imgContainer.children(this.imgBoxClass);
            for (var i in allImg) {
                if (allImg[i].circle == ele[0]) {
                    return $(allImg[i]);
                }
            }
        }
    }
    
    func.prototype.path_moving = function(e, svgobj, ele) {
        var start_point = {
            left: ele.offset().left + ele.width() * scale,
            top: ele.offset().top + ele.height() / 2 * scale
        };
        var deltaX = (e.clientX - parseInt(start_point.left)) / scale;
        var deltaY = (e.clientY - parseInt(start_point.top)) / scale;
        makeSvg(deltaX, deltaY, svgobj.svg, svgobj.svg_ori_position.left, svgobj.svg_ori_position.top);
        makePath(deltaX, deltaY, svgobj.svg.children('.path'), svgobj.svg.children('.arrow'));
    }
    
    func.prototype.staticed_path = function(ele) {
        var pathInfo = static_path(ele, path_from, this);
        recover_pointer_path_ended(this);
        cancle_img_highLight(this);
        ele_none($('.' + this.pathCollect));
        path_from = null ;
        return pathInfo;
    }

    func.prototype.path_highLight = function(svg) {
        path_highLight_ended();
        svg.children('path').map(function(index) {
            svg.children('path')[index].setAttribute('stroke', basic_options.pathHighLight);
        });
        svg.children('.arrow')[0].setAttribute('fill', basic_options.pathHighLight);
        svg[0].setAttribute('class','chosen');
    }
    
    func.prototype.canvas_input_disabled = function(_this, ele) {
        input_disabled(_this);
    }
    
    func.prototype.canvas_input_abled = function(_this, ele) {
        input_abled(_this);
        if (ele) {
            return {
                id: ele.attr('id'),
                position: {
                    x: parseInt(ele.css('left').match(/[^px]+/)),
                    y: parseInt(ele.css('top').match(/[^px]+/))
                }
            }
        }
    }
    
    func.prototype.zoom = function(delta) {
        scale = delta > 0 ? zoomIn(this) : zoomOut(this);
    }
    
    func.prototype.hover = function(eventobj) {
        var _this = this;
        eventobj.hover(
        function(e) {
            if (_this.getsrc(e).hasClass(_this.circleCover)) {
                _this.getsrc(e).children('svg')[0].setAttribute('display', 'block');
                _this.svgContainer.find('.path').css('pointer-events', 'none');
            }
        }, function(e) {
            if (_this.getsrc(e).parents('.' + _this.circleCover)[0]) {
                _this.getsrc(e).parents('.' + _this.circleCover).children('svg')[0].setAttribute('display', 'none');
                !path_from ? _this.svgContainer.find('.path').css('pointer-events', 'auto') : '';
            }
        });
    }
    
    
    
    
    
    
    
    
    
    function unBind(_this, ev, f) {
        _this.unbind(ev, f);
    }
    
    function ele_block(ele) {
        ele.css('display', 'block');
    }
    
    function ele_none(ele) {
        ele.css('display', 'none');
    }
    
    function get_ele_position_of_window(ele) {
        return {
            left: ele.offset().left,
            top: ele.offset().top
        };
    }
    
    function removeButnHighLight(bool) {
        if(bool) {
            ctrl.remove.css('background', basic_options.removeButnColor).addClass('remove-active');
        } else {
            ctrl.remove.css('background', '#ccc').removeClass('remove-active');
        }
    }

    function editorButnHighLight(bool) {
        if(bool) {
            ctrl.butnEditor.css({'background':'rgba(240,240,30,0.7)', 'pointer-events':'auto'});
        } else {
            ctrl.butnEditor.css({'background':'rgba(204,204,204,0.7)', 'pointer-events':'none'});
        }
    }

    function path_highLight_ended() {
        path_container.map(function(c) {
            if(c.path) {
                $(c.path).children('path')[0].setAttribute('stroke',basic_options.pathBottomColor);
                $(c.path).children('path')[1].setAttribute('stroke',basic_options.pathAboveColor);
                $(c.path).children('.arrow')[0].setAttribute('stroke',basic_options.pathAboveColor);
                $(c.path).children('.arrow')[0].setAttribute('fill',basic_options.pathAboveColor);
                c.path.setAttribute('class', 'path-static');
            }            
        });
    }

    function start_active(from, fun) {
        if(from.id === fun.start.attr('id')) {
            $(fun.start[0].circle).css('display','block');
        }
    }

    function remove_ele(c, fun) {
        $(c.path).remove();
        start_active(c.from, fun);
        c.from = c.to = c.path = null;  
    }

    function input_disabled(_this) {
        _this.find('input').attr('disabled', 'disabled');
    }
    
    function input_abled(_this) {
        _this.find('input').attr('disabled', false);
    }
    
    function get_img_size() {
        return [ctrl.list.children('.' + basic_options.imgBoxClass).innerWidth() / 2, 
        ctrl.list.children('.' + basic_options.imgBoxClass).innerHeight() / 2];
    }
    
    function uuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    }
    
    function newElement(element, videoUrl, imgUrl) {
        var name = element.children('input').attr('value');
        var id = element.attr('id');
        var x = element.css('left').match(/\d+/)[0];
        var y = element.css('top').match(/\d+/)[0];
        return new ElementOptions(videoUrl,imgUrl,name,id,x,y,0);
    }
    
    function set_floatImg_css(e, floatImg, fun, _this) {
        var img = _this.children('img');
        var video = _this.children('span');
        var imgSize = get_img_size();
        floatImg.addClass('canvas-api-floatImg')
        .css({
            'width': imgSize[0] * 2,
            'height': imgSize[1] * 2,
            'background-image': 'url(' + img.attr('src') + ')',
            'transform': 'scale(' + scale + ')',
            'transform-origin': imgSize[0] + 'px ' + imgSize[1] + 'px 0'
        })
        .offset({
            left: e.clientX - imgSize[0],
            top: e.clientY - imgSize[1]
        });
        if (basic_options.floatImgOpacity) {
            floatImg.css('opacity', basic_options.floatImgOpacity)
        }
        img_ori_position = {
            left: _this.offset().left,
            top: _this.offset().top
        };
        return {
            imgUrl: img.attr('src'),
            videoUrl: video.text()
        };
    }
    
    function createNewElement(fun, id, imgUrl, videoUrl) {
        var div = create('div').addClass(basic_options.imgBoxClass).css({
            'position': 'absolute',
            'margin': '0'
        }).attr('id', id);
        var img = create('img').attr('src', imgUrl);
        var collect = layout_path_collect();
        var title = layout_title(fun);
        fun.imgContainer.append(div.append(img, title, collect));
        div.bind('dragstart', function(e) {
            fun.stop_broswer(e)
        });
        div[0].videoUrl = videoUrl;
        return div;
    }
    
    function addImgOnCanvas(floatImg, e, fun) {
        var id = uuid();
        var div = createNewElement(fun, id, targetUrl.imgUrl, targetUrl.videoUrl);
        var imgSize = get_img_size();
        var left = (e.clientX - fun.trans.offset().left) / scale - imgSize[0];
        var top = (e.clientY - fun.trans.offset().top) / scale - imgSize[1];
        div.css({
            'left': left,
            'top': top
        });
        div[0].circle = create_circle(div, fun);
        return newElement(div, targetUrl.videoUrl, targetUrl.imgUrl);
    }
    
    function create_circle(ele, fun) {
        var cover = create('div').addClass('img-box-circle-cover ' + fun.circleCover);
        var svg = layout_circle();
        fun.svgContainer.append(cover.append(svg));
        circle_comewith_ele(ele, cover);
        return cover[0];
    }
    
    function layout_circle() {
        var svg = create('svg');
        var path = create('path');
        var rect = create('rect');
        svg[0].setAttribute('display', 'none');
        svg.attr({
            'height': '20',
            'width': '20'
        });
        rect.attr({
            'width': '18',
            'height': '18',
            'y': '1',
            'x': '1',
            'ry': '9',
            'rx': '9',
            'fill': '#fff',
            'stroke': '#000',
            'stroke-width': '1px'
        });
        path.attr({
            'fill': '#000',
            'd': 'M 1 9 L 10 9 L 10 1 L 19 10 L 10 19 L 10 11 L 1 11 Z'
        });
        svg.append(rect, path);
        return svg;
    }
    
    function layout_title(fun) {
        var input = create('input');
        var imgSize = get_img_size();
        var node = fun.imgContainer.children('.' + basic_options.imgBoxClass).length;
        input.attr({
            'type': 'text',
            'value': 'Node ' + node
        })
        .addClass('canvas-api-img-title no-border-input')
        .css('width', imgSize[0] * 2);
        return input;
    }
    
    function layout_path_collect() {
        var collect = create('div');
        collect.addClass(basic_options.pathCollect);
        return collect;
    }
    
    function circle_comewith_ele(ele, circl) {
        var circle = circl ? circl : $(ele[0].circle);
        circle.css({
            'left': parseInt(ele.css('left')) + ele.innerWidth() - circle.width() / 2,
            'top': parseInt(ele.css('top')) + ele.innerHeight() / 2 - circle.height() / 2
        });
    }
    
    function clear_path(_this) {
        _this.svgContainer.find('.path-active') ? _this.svgContainer.find('.path-active').remove() : '';
        recover_pointer_path_ended(_this);
    }
    
    function cancle_img_highLight(_this) {
        _this.imgContainer.find('.' + _this.imgBox).css({
            'box-shadow': '0 0 3px #000',
            'z-index': '10',
            'cursor': 'pointer'
        }).removeClass('chosen');
        _this.imgContainer.find('img').css('-webkit-mask-image', 'none');
    }
    
    function recover_pointer_path_ended(fun) {
        input_abled(fun.imgContainer);
        $('body').css('pointer-events', 'auto');
        $('.' + fun.circleCover).css('pointer-events', 'auto');
        $('.' + fun.imgBox).css({
            'pointer-events': 'auto',
            'cursor': 'pointer'
        });
        $('path').css('pointer-events', 'auto');
        $('.' + fun.pathCollect).css('display', 'none');
    }
    
    function ignore_pointer_during_path(fun) {
        input_disabled(fun.imgContainer);
        fun.canvas.css('pointer-events', 'auto');
        $('body').css('pointer-events', 'none');
        $('.' + fun.circleCover).css('pointer-events', 'none');
        $('.' + fun.imgBox).css({
            'pointer-events': 'none'
        });
        $('.' + fun.pathCollect).css('pointer-events', 'auto');
        $('path').css('pointer-events', 'none');
    }
    
    function add_path(ele, fun) {
        var svg = create('svg');
        var path = create('path');
        var path_back = create('path');
        var arrow = create('path');
        fun.svgContainer.prepend(svg.append(path_back, path, arrow));
        set_path_cssAndAttr(svg, path, path_back, arrow);
        set_path_position(ele, svg);
        return svg;
    }
    
    function set_path_cssAndAttr(svg, path, path_back, arrow) {
        svg[0].style.cssText = 'pointer-events:none;position:absolute;overflow:visible;';
        arrow[0].style.cssText = path_back[0].style.cssText = path[0].style.cssText = 'pointer-events:auto;cursor:pointer';
        path[0].setAttribute('class', 'path');
        path_back[0].setAttribute('class', 'path');
        arrow[0].setAttribute('class', 'arrow');
        svg[0].setAttribute('class', 'path-active');
        svg.attr({
            'width': '90',
            'height': '90'
        });
        path_back.attr({
            'stroke-width': basic_options.pathBottomWidth,
            'fill': 'none',
            'stroke': basic_options.pathBottomColor
        });
        path.attr({
            'stroke-width': basic_options.pathAboveWidth,
            'fill': 'none',
            'stroke': basic_options.pathAboveColor
        });
        arrow.attr({
            'stroke-width': '2px',
            'fill': basic_options.pathAboveColor,
            'stroke': basic_options.pathAboveColor
        });
    }
    
    function set_path_position(ele, svg) {
        var svgPosition = get_path_from_position(ele);
        svg.offset({
            left: svgPosition.left,
            top: svgPosition.top
        });
    }
    
    function get_path_from_position(ele) {
        return {
            left: parseInt(ele.css('left')) + ele.innerWidth(),
            top: parseInt(ele.css('top')) - (90 - ele.innerHeight()) / 2
        };
    }
    
    function add_mask(_this) {
        _this.imgContainer.find('.' + _this.imgBox).css({
            'box-shadow': '0 0 0',
            'z-index': '10'
        });
        _this.imgContainer.find('img').css('-webkit-mask-image', 'url(/images/mask.png)');
    }
    
    function static_path(ele, path_from, _this) {
        var isStart = false;
        var tagSvg = $('.path-active');
        tagSvg[0].moving = path_move_with_img;
        tagSvg[0].setAttribute('class', 'path-static');
        path_move_with_img(path_from, ele, tagSvg);
        path_container.push(new path_container_construct(path_from,tagSvg,ele));
        if (path_from.attr('id') === _this.start.attr('id')) {
            $(_this.start[0].circle).css('display', 'none');
            isStart = true;
        }
        return {
            isStart: isStart,
            newPathInfo: new ButtonConstructor(ele.attr('id'),ele.children('input').attr('value')),
            fromId: path_from.attr('id')
        };
    }
    
    function path_move_with_img(from, to, path) {
        var path_from_position = get_path_from_position(from);
        var delta = get_deltaXY(from, to);
        makeSvg(delta.deltaX, delta.deltaY, path, path_from_position.left, path_from_position.top);
        makePath(delta.deltaX, delta.deltaY, path.children('.path'), path.children('.arrow'));
    }
    
    function get_deltaXY(from, to) {
        var deltaX = parseInt(to.css('left')) - parseInt(from.css('left')) - from.width();
        var deltaY = parseInt(to.css('top')) + to.height() / 2 - parseInt(from.css('top')) - from.height() / 2;
        return {
            deltaX: deltaX,
            deltaY: deltaY
        };
    }
    
    function zoomIn(fun) {
        scale < 1.95 ? scale += 0.05 : '';
        fun.trans.css('transform', 'scale(' + scale + ')');
        return scale;
    }
    
    function zoomOut(fun) {
        scale > 0.6 ? scale -= 0.05 : '';
        fun.trans.css('transform', 'scale(' + scale + ')');
        return scale;
    }
    
    function path_container_construct(_from, _path, _to) {
        this.from = _from[0];
        this.path = _path[0];
        this.to = _to[0];
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
    
    function update_basic_options(obj) {
        for (var option in obj) {
            switch (option) {
            case 'img-class':
                basic_options.imgClass = obj[option];
                break;
            case 'imgBox-class':
                basic_options.imgBoxClass = obj[option];
                break;
            case 'circle-size':
                basic_options.circleSize = obj[option];
                break;
            case 'float-opacity':
                basic_options.floatImgOpacity = obj[option];
                break;
            case 'highLight-color':
                basic_options.hightLightColor = obj[option];
                break;
            case 'pathAbove-color':
                basic_options.pathAboveColor = obj[option];
                break;
            case 'pathBottom-color':
                basic_options.pathBottomColor = obj[option];
                break;
            case 'pathAbove-width':
                basic_options.pathAboveWidth = obj[option];
                break;
            case 'pathBottom-width':
                basic_options.pathBottomWidth = obj[option];
                break;
            case 'arrowBottom':
                basic_options.arrowBottom = obj[option];
                break;
            case 'arrowHeight':
                basic_options.arrowHeight = obj[option];
                break;
            case 'start-class':
                basic_options.startClass = obj[option];
                break;
            case 'img-class-canvas':
                basic_options.imgClassOnCanvas = obj[option];
                break;
            case 'imgBox-class-canvas':
                basic_options.imgBoxClassOnCanvas = obj[option];
                break;
            case 'remove-butn-class':
                basic_options.removeButtonClass = obj[option];
                break;
            case 'remove-butn-position':
                basic_options.removeButtonPosition = obj[option];
                break;
            case 'remove-butn-color':
                basic_options.removeButnColor = obj[option];
                break;
            case 'path-highLigth':
                basic_options.pathHighLight = obj[option];
                break;
            }
        }
    }
    
    function makeSvg(deltaX, deltaY, tagSvg, X, Y) {
        if (deltaY <= 45 && deltaY >= -45) {
            tagSvg.css('top', Y);
        }
        if (deltaY < -45) {
            tagSvg.css('top', Y + deltaY + 45);
            if (deltaY < -90) {
                tagSvg.height((-deltaY));
            }
        } 
        else if (deltaY > 45) {
            tagSvg.css('top', Y + deltaY - 45);
            if (deltaY > 90) {
                tagSvg.css('top', Y + 45);
                tagSvg.height(deltaY);
            }
        }
        if (deltaX > 21) {
            tagSvg.css('left', X);
            if (deltaX > 90) {
                tagSvg.width(deltaX);
            }
        } 
        else if (deltaX >= 0 && deltaX <= 21) {
            tagSvg.css('left', X - 21 + deltaX);
        } 
        else if (deltaX < 0) {
            tagSvg.css('left', X + deltaX - 21);
            if (deltaX < -48) {
                tagSvg.width((-deltaX) + 42);
            }
        }
    }
    
    function makePath(deltaX, deltaY, path, arrow) {
        var ax = basic_options.arrowHeight, ay = basic_options.arrowBottom;
        if (deltaX > 42) {
            if (deltaY < -12 && deltaY >= -45) {
                path.attr('d', 'M 0 45 L ' + (deltaX - 12) / 2 + ' 45 A 6 6,0 0 0,' + deltaX / 2 + ' 39 L ' + deltaX / 2 + ' ' + (51 + deltaY) + ' A 6 6,0 0 1,' + (deltaX / 2 + 6) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
            } 
            else if (deltaY < -45) {
                path.attr('d', 'M 0 ' + (-deltaY) + ' L ' + (deltaX - 12) / 2 + ' ' + (-deltaY) + ' A 6 6,0 0 0,' + deltaX / 2 + ' ' + -(deltaY + 6) + ' L ' + deltaX / 2 + ' 6 A 6 6,0 0 1,' + (deltaX / 2 + 6) + ' ' + 0 + ' L ' + deltaX + ' ' + 0);
                arrow.attr('d', 'M ' + deltaX + ' 0 L ' + (deltaX - ax) + ' ' + ay + ' L ' + (deltaX - ax) + ' ' + (-ay) + ' Z');
            } 
            else if (deltaY <= 0 && deltaY > -12) {
                path.attr('d', 'M 0 45 L ' + (deltaX + deltaY) / 2 + ' 45 A ' + (-deltaY / 2) + ' ' + (-deltaY / 2) + ',0 0 0,' + deltaX / 2 + ' ' + (45 + deltaY / 2) + ' A ' + (-deltaY / 2) + ' ' + (-deltaY / 2) + ',0 0 1,' + (deltaX / 2 - deltaY / 2) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
            } 
            else if (deltaY > 0 && deltaY < 12) {
                path.attr('d', 'M 0 45 L ' + (deltaX - deltaY) / 2 + ' 45 A ' + deltaY / 2 + ' ' + deltaY / 2 + ',0 0 1,' + deltaX / 2 + ' ' + (45 + deltaY / 2) + ' A ' + deltaY / 2 + ' ' + deltaY / 2 + ',0 0 0,' + (deltaX / 2 + deltaY / 2) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + ((deltaX - ax)) + ' ' + (45 + deltaY - ay) + ' Z');
            } 
            else if (deltaY > 12 && deltaY < 45) {
                path.attr('d', 'M 0 45 L ' + (deltaX - 12) / 2 + ' 45 A 6 6,0 0 1,' + deltaX / 2 + ' 51 L ' + deltaX / 2 + ' ' + (39 + deltaY) + ' A 6 6,0 0 0,' + (deltaX / 2 + 6) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
            } 
            else if (deltaY > 45 && deltaY < 90) {
                path.attr('d', 'M 0 ' + (90 - deltaY) + ' L ' + (deltaX - 12) / 2 + ' ' + (90 - deltaY) + ' A 6 6,0 0 1,' + deltaX / 2 + ' ' + (96 - deltaY) + ' L ' + deltaX / 2 + ' 84 A 6 6,0 0 0,' + (deltaX / 2 + 6) + ' ' + 90 + ' L ' + deltaX + ' ' + 90);
                arrow.attr('d', 'M ' + deltaX + ' 90 L ' + (deltaX - ax) + ' ' + (90 + ay) + ' L ' + (deltaX - ax) + ' ' + (90 - ay) + ' Z');
            } 
            else if (deltaY >= 90) {
                path.attr('d', 'M 0 0 L ' + (deltaX - 12) / 2 + ' 0 A 6 6,0 0 1,' + deltaX / 2 + ' 6 L ' + deltaX / 2 + ' ' + (deltaY - 6) + ' A 6 6,0 0 0,' + (deltaX / 2 + 6) + ' ' + deltaY + ' L ' + deltaX + ' ' + deltaY);
                arrow.attr('d', 'M ' + deltaX + ' ' + deltaY + ' L ' + (deltaX - ax) + ' ' + (deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (deltaY - ay) + ' Z');
            }
        } 
        else if (deltaX <= 42) {
            if (deltaX > 29) {
                if (deltaY < -24 && deltaY > -45) {
                    path.attr('d', 'M 0 45 L 15 45 A 6 6,0 0 0,21 39 L 21 ' + (66 - deltaX / 2 + deltaY / 2) + ' A ' + (42 - deltaX) / 2 + ' ' + (42 - deltaX) / 2 + ',0 0 0,' + deltaX / 2 + ' ' + (45 + deltaY / 2) + 'A ' + (42 - deltaX) / 2 + ' ' + (42 - deltaX) / 2 + ',0 0 1,' + (deltaX - 21) + ' ' + (24 + deltaY / 2 + deltaX / 2) + ' L ' + (deltaX - 21) + ' ' + (51 + deltaY) + 'A 6 6,0 0 1,' + (deltaX - 15) + ' ' + (45 + deltaY) + 'L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY <= -45) {
                    path.attr('d', 'M 0 ' + (-deltaY) + ' L 15 ' + (-deltaY) + ' A 6 6,0 0 0,21 ' + (-deltaY - 6) + ' L 21 ' + (21 - deltaY / 2 - deltaX / 2) + ' A ' + (42 - deltaX) / 2 + ' ' + (42 - deltaX) / 2 + ',0 0 0,' + deltaX / 2 + ' ' + (-deltaY / 2) + ' A ' + (42 - deltaX) / 2 + ' ' + (42 - deltaX) / 2 + ',0 0 1,' + (deltaX - 21) + ' ' + (deltaX / 2 - deltaY / 2 - 21) + ' L ' + (deltaX - 21) + ' 6 A 6 6,0 0 1' + (deltaX - 15) + ' 0 L ' + deltaX + ' 0');
                    arrow.attr('d', 'M ' + deltaX + ' 0 L ' + (deltaX - ax) + ' ' + ay + ' L ' + (deltaX - ax) + ' ' + (-ay) + ' Z');
                } 
                else if (deltaY <= 0 && deltaY > -24) {
                    path.attr('d', 'M 0 45 L 15 45 A ' + (-deltaY / 4) + ' ' + (-deltaY / 4) + ',0 0 0,' + 15 + ' ' + (45 + deltaY / 2) + ' A ' + (-deltaY / 4) + ' ' + (-deltaY / 4) + ',0 0 1,' + (15 - deltaY / 4) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 0 && deltaY < 24) {
                    path.attr('d', 'M 0 45 L 15 45 A ' + deltaY / 4 + ' ' + deltaY / 4 + ',0 0 1,15 ' + (45 + deltaY / 2) + ' A ' + deltaY / 4 + ' ' + deltaY / 4 + ',0 0 0,' + (15 + deltaY / 4) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 24 && deltaY < 45) {
                    path.attr('d', 'M 0 45 L 15 45 A 6 6,0 0 1,21 51 L 21 ' + (24 + deltaY / 2 + deltaX / 2) + ' A ' + (42 - deltaX) / 2 + ' ' + (42 - deltaX) / 2 + ',0 0 1,' + deltaX / 2 + ' ' + (45 + deltaY / 2) + ' A ' + (21 - deltaX / 2) + ' ' + (21 - deltaX / 2) + ',0 0 0,' + (deltaX - 21) + ' ' + (66 + deltaY / 2 - deltaX / 2) + ' L ' + (deltaX - 21) + ' ' + (39 + deltaY) + ' A 6 6 ,0 0 0,' + (deltaX - 15) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 45 && deltaY < 90) {
                    path.attr('d', 'M 0 ' + (90 - deltaY) + ' L 15 ' + (90 - deltaY) + ' A 6 6,0 0 1,21 ' + (96 - deltaY) + ' L 21 ' + (69 - deltaY / 2 + deltaX / 2) + ' A ' + (21 - deltaX / 2) + ' ' + (21 - deltaX / 2) + ',0 0 1,' + deltaX / 2 + ' ' + (90 - deltaY / 2) + ' A ' + (21 - deltaX / 2) + ' ' + (21 - deltaX / 2) + ',0 0 0,' + (deltaX - 21) + ' ' + (111 - deltaY / 2 - deltaX / 2) + ' L ' + (deltaX - 21) + ' 86 A 6 6,0 0 0,' + (deltaX - 15) + ' 90 L ' + deltaX + ' 90');
                    arrow.attr('d', 'M ' + deltaX + ' 90 L ' + (deltaX - ax) + ' ' + (90 + ay) + ' L ' + (deltaX - ax) + ' ' + (90 - ay) + ' Z');
                } 
                else if (deltaY >= 90) {
                    path.attr('d', 'M 0 0 L 15 0 A 6 6,0 0 1,21 6 L 21 ' + (deltaY / 2 + deltaX / 2 - 21) + ' A ' + (21 - deltaX / 2) + ' ' + (21 - deltaX / 2) + ',0 0 1,' + deltaX / 2 + ' ' + deltaY / 2 + ' A ' + (21 - deltaX / 2) + ' ' + (21 - deltaX / 2) + ',0 0 0,' + (deltaX - 21) + ' ' + (deltaY / 2 - deltaX / 2 + 21) + ' L ' + (deltaX - 21) + ' ' + (deltaY - 6) + ' A 6 6,0 0 0,' + (deltaX - 15) + ' ' + deltaY + ' L ' + deltaX + ' ' + deltaY);
                    arrow.attr('d', 'M ' + deltaX + ' ' + deltaY + ' L ' + (deltaX - ax) + ' ' + (deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (deltaY - ay) + ' Z');
                }
            } 
            else if (deltaX > 20) {
                if (deltaY < -24 && deltaY > -45) {
                    path.attr('d', 'M 0 45 L 15 45 A 6 6,0 0 0,21 39 L 21 ' + (51 + deltaY / 2) + ' A 6 6,0 0 0,15 ' + (45 + deltaY / 2) + ' L ' + (deltaX - 15) + ' ' + (45 + deltaY / 2) + ' A 6 6,0 0 1,' + (deltaX - 21) + ' ' + (39 + deltaY / 2) + ' L ' + (deltaX - 21) + ' ' + (51 + deltaY) + 'A 6 6,0 0 1,' + (deltaX - 15) + ' ' + (45 + deltaY) + 'L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY <= -45) {
                    path.attr('d', 'M 0 ' + (-deltaY) + ' L 15 ' + (-deltaY) + ' A 6 6,0 0 0,21 ' + (-deltaY - 6) + ' L 21 ' + (6 - deltaY / 2) + ' A 6 6,0 0 0,15 ' + (-deltaY / 2) + ' L ' + (deltaX - 15) + ' ' + (-deltaY / 2) + ' A 6 6,0 0 1,' + (deltaX - 21) + ' ' + (-deltaY / 2 - 6) + ' L ' + (deltaX - 21) + ' 6 A 6 6,0 0 1,' + (deltaX - 15) + ' 0 L ' + deltaX + ' 0');
                    arrow.attr('d', 'M ' + deltaX + ' 0 L ' + (deltaX - ax) + ' ' + ay + ' L ' + (deltaX - ax) + ' ' + (-ay) + ' Z');
                } 
                else if (deltaY <= 0 && deltaY > -24) {
                    path.attr('d', 'M 0 45 L 15 45 A ' + (-deltaY / 4) + ' ' + (-deltaY / 4) + ',0 0 0,15 ' + (45 + deltaY / 2) + ' L ' + (deltaX - deltaY / 2 - 27) + ' ' + (45 + deltaY / 2) + ' A ' + (-deltaY / 4) + ' ' + (-deltaY / 4) + ',0 0 1,' + (deltaX - deltaY / 2 - 27) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 0 && deltaY < 24) {
                    path.attr('d', 'M 0 45 L 15 45 A ' + deltaY / 4 + ' ' + deltaY / 4 + ',0 0 1,15 ' + (45 + deltaY / 2) + ' L ' + (deltaX + deltaY / 2 - 27) + ' ' + (45 + deltaY / 2) + ' A ' + deltaY / 4 + ' ' + deltaY / 4 + ',0 0 0,' + (deltaX + deltaY / 2 - 27) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 24 && deltaY < 45) {
                    path.attr('d', 'M 0 45 L 15 45 A 6 6,0 0 1,21 51 L 21 ' + (39 + deltaY / 2) + ' A 6 6,0 0 1,15 ' + (45 + deltaY / 2) + ' L ' + (deltaX - 15) + ' ' + (45 + deltaY / 2) + ' A 6 6,0 0 0,' + (deltaX - 21) + ' ' + (51 + deltaY / 2) + ' L ' + (deltaX - 21) + ' ' + (39 + deltaY) + ' A 6 6 ,0 0 0,' + (deltaX - 15) + ' ' + (45 + deltaY) + ' L ' + deltaX + ' ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + deltaX + ' ' + (45 + deltaY) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 45 && deltaY < 90) {
                    path.attr('d', 'M 0 ' + (90 - deltaY) + ' L 15 ' + (90 - deltaY) + ' A 6 6,0 0 1,21 ' + (96 - deltaY) + ' L 21 ' + (84 - deltaY / 2) + ' A 6 6,0 0 1,15 ' + (90 - deltaY / 2) + ' L ' + (deltaX - 15) + ' ' + (90 - deltaY / 2) + ' A 6 6,0 0 0,' + (deltaX - 21) + ' ' + (96 - deltaY / 2) + ' L ' + (deltaX - 21) + ' 86 A 6 6,0 0 0,' + (deltaX - 15) + ' 90 L ' + deltaX + ' 90');
                    arrow.attr('d', 'M ' + deltaX + ' 90 L ' + (deltaX - ax) + ' ' + (90 + ay) + ' L ' + (deltaX - ax) + ' ' + (90 - ay) + ' Z');
                } 
                else if (deltaY >= 90) {
                    path.attr('d', 'M 0 0 L 15 0 A 6 6,0 0 1,21 6 L 21 ' + (deltaY / 2 - 6) + ' A 6 6,0 0 1,15 ' + deltaY / 2 + ' L ' + (deltaX - 15) + ' ' + (deltaY / 2) + ' A 6 6,0 0 0,' + (deltaX - 21) + ' ' + (deltaY / 2 + 6) + ' L ' + (deltaX - 21) + ' ' + (deltaY - 6) + ' A 6 6,0 0 0,' + (deltaX - 15) + ' ' + deltaY + ' L ' + deltaX + ' ' + deltaY);
                    arrow.attr('d', 'M ' + deltaX + ' ' + deltaY + ' L ' + (deltaX - ax) + ' ' + (deltaY + ay) + ' L ' + (deltaX - ax) + ' ' + (deltaY - ay) + ' Z');
                }
            } 
            else {
                if (deltaY < -24 && deltaY > -45) {
                    path.attr('d', 'M ' + (21 - deltaX) + ' 45 L ' + (36 - deltaX) + ' 45 A 6 6,0 0 0,' + (42 - deltaX) + ' 39 L ' + (42 - deltaX) + ' ' + (51 + deltaY / 2) + ' A 6 6,0 0 0,' + (36 - deltaX) + ' ' + (45 + deltaY / 2) + ' L 6 ' + (45 + deltaY / 2) + ' A 6 6,0 0 1,0 ' + (39 + deltaY / 2) + ' L 0 ' + (51 + deltaY) + ' A 6 6,0 0 1,6 ' + (45 + deltaY) + 'L 21 ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + ' 21 ' + (45 + deltaY) + ' L ' + (21 - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (21 - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY <= -45) {
                    path.attr('d', 'M ' + (21 - deltaX) + ' ' + (-deltaY) + ' L ' + (36 - deltaX) + ' ' + (-deltaY) + ' A 6 6,0 0 0,' + (42 - deltaX) + ' ' + (-deltaY - 6) + ' L ' + (42 - deltaX) + ' ' + (6 - deltaY / 2) + ' A 6 6,0 0 0,' + (36 - deltaX) + ' ' + (-deltaY / 2) + ' L 6 ' + (-deltaY / 2) + ' A 6 6,0 0 1,0 ' + (-deltaY / 2 - 6) + ' L 0 6 A 6 6,0 0 1,6 0 L 21 0');
                    arrow.attr('d', 'M ' + ' 21 0 L ' + (21 - ax) + ' ' + ay + ' L ' + (21 - ax) + ' ' + (-ay) + ' Z');
                } 
                else if (deltaY <= 0 && deltaY > -24) {
                    path.attr('d', 'M ' + (21 - deltaX) + ' 45 L ' + (36 - deltaX) + ' 45 A ' + (-deltaY / 4) + ' ' + (-deltaY / 4) + ',0 0 0,' + (36 - deltaX) + ' ' + (45 + deltaY / 2) + ' L ' + (-deltaY / 4) + ' ' + (45 + deltaY / 2) + ' A ' + (-deltaY / 4) + ' ' + (-deltaY / 4) + ',0 0 1,' + (-deltaY / 4) + ' ' + (45 + deltaY) + ' L 21 ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + ' 21 ' + (45 + deltaY) + ' L ' + (21 - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (21 - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 0 && deltaY < 24) {
                    path.attr('d', 'M ' + (21 - deltaX) + ' 45 L ' + (36 - deltaX) + ' 45 A ' + deltaY / 4 + ' ' + deltaY / 4 + ',0 0 1,' + (36 - deltaX) + ' ' + (45 + deltaY / 2) + ' L ' + (deltaY / 4) + ' ' + (45 + deltaY / 2) + ' A ' + deltaY / 4 + ' ' + deltaY / 4 + ',0 0 0,' + (deltaY / 4) + ' ' + (45 + deltaY) + ' L 21 ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + ' 21 ' + (45 + deltaY) + ' L ' + (21 - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (21 - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 24 && deltaY < 45) {
                    path.attr('d', 'M ' + (21 - deltaX) + ' 45 L ' + (36 - deltaX) + ' 45 A 6 6,0 0 1,' + (42 - deltaX) + ' 51 L ' + (42 - deltaX) + ' ' + (39 + deltaY / 2) + ' A 6 6,0 0 1,' + (36 - deltaX) + ' ' + (45 + deltaY / 2) + ' L 6 ' + (45 + deltaY / 2) + ' A 6 6,0 0 0,0 ' + (51 + deltaY / 2) + ' L 0 ' + (39 + deltaY) + ' A 6 6 ,0 0 0,6 ' + (45 + deltaY) + ' L 21 ' + (45 + deltaY));
                    arrow.attr('d', 'M ' + ' 21 ' + (45 + deltaY) + ' L ' + (21 - ax) + ' ' + (45 + deltaY + ay) + ' L ' + (21 - ax) + ' ' + (45 + deltaY - ay) + ' Z');
                } 
                else if (deltaY > 45 && deltaY < 90) {
                    path.attr('d', 'M ' + (21 - deltaX) + ' ' + (90 - deltaY) + ' L ' + (36 - deltaX) + ' ' + (90 - deltaY) + ' A 6 6,0 0 1,' + (42 - deltaX) + ' ' + (96 - deltaY) + ' L ' + (42 - deltaX) + ' ' + (84 - deltaY / 2) + ' A 6 6,0 0 1,' + (36 - deltaX) + ' ' + (90 - deltaY / 2) + ' L 6 ' + (90 - deltaY / 2) + ' A 6 6,0 0 0,0 ' + (96 - deltaY / 2) + ' L 0 86 A 6 6,0 0 0,6 90 L 21 90');
                    arrow.attr('d', 'M ' + ' 21 90 L ' + (21 - ax) + ' ' + (90 - ay) + ' L ' + (21 - ax) + ' ' + (90 + ay) + ' Z');
                } 
                else if (deltaY >= 90) {
                    path.attr('d', 'M ' + (21 - deltaX) + ' 0 L ' + (36 - deltaX) + ' 0 A 6 6,0 0 1,' + (42 - deltaX) + ' 6 L ' + (42 - deltaX) + ' ' + (deltaY / 2 - 6) + ' A 6 6,0 0 1,' + (36 - deltaX) + ' ' + deltaY / 2 + ' L 6 ' + (deltaY / 2) + ' A 6 6,0 0 0,0 ' + (deltaY / 2 + 6) + ' L 0 ' + (deltaY - 6) + ' A 6 6,0 0 0,6 ' + deltaY + ' L 21 ' + deltaY);
                    arrow.attr('d', 'M ' + ' 21 ' + deltaY + ' L ' + (21 - ax) + ' ' + (deltaY + ay) + ' L ' + (21 - ax) + ' ' + (deltaY - ay) + ' Z');
                }
            }
        }
    }
    
    window.canvas = canvas_constructor;

})(jQuery);


if(typeof module !== 'undefined') {
    module.exports = window.canvas;
}