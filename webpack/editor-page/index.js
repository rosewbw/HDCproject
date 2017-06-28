var React = require('react');
var ReactDOM = require('react-dom');
var butnControl = require('./butn-control');
var saveButnInfoFunction = require('./saveButnInfoFunctions');
var optionsControl = require('./options-control');
var canvas = require('./canvas.api');
var upImg = require('./uploadimage');
var upVideo = require('./uploadvideo');
require('./geturlparameter');


var Preview = React.createClass({
	previewEnded: function() {
		ReactDOM.unmountComponentAtNode(document.getElementById('react-insert-point-preview'));
	},
	render: function() {
		var url = '/html/videoview.html?proName='+$.getUrlParam('proName');
		return (
			<div id="container">
				<div id="preview">
					<div id="pre-header"><span onClick={this.previewEnded}>×</span></div>
					<div id="pre-content">
						<iframe src={url} frameBorder="0" scrolling="no" height="405px" width="720px"></iframe>
					</div>
				</div>
			</div>
		);
	}
});

var EditorHeader = React.createClass({
	render: function() {
		return (
			<div id="editor-header">
				<span onClick={this.props.close}>×</span>
			</div>
		);
	}
});

var EditorVideoPlace = React.createClass({
	render: function() {
		return (
			<div id="editor-video-area">				
				<video id="editor-video" src={this.props.videoUrl} controls="controls"></video>
				<div id="editor-butn-layer"></div>
			</div>
		);
	}
});

var EditorMainController = React.createClass({
	render: function() {
		return (
			<div id="editor-main-controller"></div>
		);
	}
});

var EditorButnOptionsController = React.createClass({
	getInitialState: function() {
		return ({
			style: {
				'title-basic': {'background': 'transparent','borderBottom': '0'},
				'basic-options': {'display': 'block'}
			}
		});
	},
	changeTitle: function(e) {
		var style = {};
		var title = $(e.srcElement || e.target).attr('id');
		var option = title.match(/[^\-]+$/)+'-options';
		style[title] = {'background': 'transparent','borderBottom': '0'};
		style[option] = {'display': 'block'};
		this.setState({style: style});
	},
	render: function() {
		return (
			<div id="editor-butn-options-controller">
				<EditorOptionsTitle style={this.state.style} changeTitle={this.changeTitle}/>
				<EditorBasicOptions style={this.state.style}/>
				<EditorExpandOptions style={this.state.style}/>
				<EditorSeniorOptions style={this.state.style}/>
			</div>
		);
	}
});

var EditorOptionsTitle = React.createClass({
	render: function() {
		return (
			<div id="editor-butn-options-title" onClick={this.props.changeTitle}>
				<div id="title-basic" className="butn-options-title" style={this.props.style['title-basic']}>Basic</div>
				<div id="title-expand" className="butn-options-title" style={this.props.style['title-expand']}>Expand</div>
				<div id="title-senior" className="butn-options-title" style={this.props.style['title-senior']}>Senior</div>
				<div className="clear-float"></div>
			</div>
		);
	}
});



var EditorBasicOptions = React.createClass({
	render: function() {
		return (
			<div id="editor-basic-options" style={this.props.style['basic-options']}>
				<Bar_options name="Opacity" unit="%" max="100"/>
				<Bar_options name="Radius" unit="px" max="100"/>
				<Bar_options name="Font-Size" unit="px" max="100"/>
				<Bar_options name="Border-Width" unit="px" max="30"/>
				<Color_options/>
				<Back_image_options/>
			</div>
		);
	}
});

var EditorExpandOptions = React.createClass({
	render: function() {
		return (
			<div id="editor-expand-options" style={this.props.style['expand-options']}></div>
		);
	}
});

var EditorSeniorOptions = React.createClass({
	render: function() {
		return (
			<div id="editor-senior-options" style={this.props.style['senior-options']}></div>
		);
	}
});

var Bar_options = React.createClass({
	render: function() {
		return (
			<div className="options-container">
				<dl>
					<dt>{this.props.name}</dt>
					<dd>
						<div className="option-bar-container">
							<div className="option-bar">
								<div id={this.props.name} className="option-bar-slider" max={this.props.max}></div>
							</div>
							<input name={this.props.name} type="text"></input>
							<span>{this.props.unit}</span>
						</div>
					</dd>
				</dl>
			</div>
		);
	}
});

var Back_image_options = React.createClass({
	render: function() {
		return (
			<div className="options-container" style={{'height':'110px'}}>
				<dl style={{'height':'105px'}}>
					<dt>Background Image</dt>
					<dd>
						<div id="upload-img-view"></div>
						<div id="image-up-form-container">
							Pick Image
							<form id="image-form" name="upload-image-form" method="post" encType="multipart/form-data">
								<input id="image-uploader" name="imageup" type="file"></input>
							</form>
						</div>
						<div className="clear-float"></div>
					</dd>
				</dl>
			</div>
		);
	}
});

var Color_options = React.createClass({
	render: function() {
		return (
			<div className="options-container" style={{'height': '120px'}}>
				<dl style={{'height': '115px'}}>
					<dt>Color</dt>
					<dd>
						<form id="color-options-form">
							<input type="radio" id="color-option-button" name="color-option"/><label htmlFor="color-option-button">Background</label>
							<input type="radio" id="color-option-font" name="color-option"/><label htmlFor="color-option-font">Font</label>
							<input type="radio" id="color-option-border" name="color-option"/><label htmlFor="color-option-border">Border</label>
						</form>
					</dd>
					<dd>
						<div id="option-black" className="color-block"></div>
						<div id="option-white" className="color-block"></div>
						<div id="option-red" className="color-block"></div>
						<div id="option-green" className="color-block"></div>
						<div id="option-blue" className="color-block"></div>
						<div id="option-yellow" className="color-block"></div>
						<div id="option-purple" className="color-block"></div>
						<div id="option-orange" className="color-block"></div>
						<div className="clear-float"></div>
					</dd>
				</dl>
			</div>
		)
	}
});

var EditorSaveAndCancle = React.createClass({
	render: function() {
		return (
			<div id="editor-save-and-cancel">
				<div id="editor-save" onClick={this.props.save}>Save</div>
				<div id="editor-cancel" onClick={this.props.close}>Cancel</div>
				<div id="upload-progress-container">
					<p id="upload-file-name"></p>
					<div id="upload-progress-bar">
						<div id="upload-progress"></div>
					</div>
				</div>
			</div>
		);
	}
});

var EditorContainer = React.createClass({
	getInitialState: function() {
		return ({
			butnInfo: []
		});
	},
	componentWillUnmount: function() {
		this.imgUploader.destroy();
		this.control.destroy();
		this.butn.destroy();
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({
			id: nextProps.editorInfo.id,
			butnInfo: nextProps.editorInfo.buttons
		}, function() {
			this.butn = new butnControl({
				info: nextProps.editorInfo,
				butnLayer: 'editor-butn-layer',
				video: 'editor-video',
				videobox: 'editor-video-area',
				opacityId: 'Opacity',
				fontSizeId: 'Font-Size',
				radiusId: 'Radius',
				borderWidthId: 'Border-Width',
				'frame-class': 'butn-frame',
				'nw-square-class': 'nw-square',
				'ne-square-class': 'ne-square',
				'sw-square-class': 'sw-square',
				'se-square-class': 'se-square',
				'upload-image-view-id': 'upload-img-view'
			}, this.saveButnInfo);
			this.control = new optionsControl({
				butn: this.butn,
				basicOptionsId: 'editor-basic-options',
				sliderClass: 'option-bar-slider',
				colorBlockClass: 'color-block',
				colorOptionsFormId: 'color-options-form',
				optionsController: 'editor-butn-options-controller'
			}, this.saveButnInfo);
			this.imgUploader = new upImg({
				btn: this.butn,
				elmId: this.state.id,
				inputId: 'image-uploader',
				url: '/api/uploading?proName='+$.getUrlParam('proName')+'&type=image'
			});
		});
	},
	saveButnInfo: function(type, info) {
		saveButnInfoFunction(info, this.state.butnInfo, type);
	},
	cancelEditor: function() {
		ReactDOM.unmountComponentAtNode(document.getElementById('react-insert-point-preview'));
	},
	saveEditor: function() {
		$.ajax({
			url: '/api/saveButnInfo?proName='+$.getUrlParam('proName')+'&elmId='+this.state.id,
			type: 'POST',
			data: {butnInfo: JSON.stringify(this.state.butnInfo)},
			success: function(data) {
				if(data.success) {
					console.log('save butnInfo success!');
					$('#upload-progress-container').css('display', 'block');
					this.imgUploader.start(this.progress, this.cancelEditor);
				} else {
					console.log('error!'+data.errMessage);
					alert('save error!please try again');
				}				
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err);
			}.bind(this)
		});
	},
	progress: function(e, fileName) {
		$('#upload-file-name').text(fileName);
		$('#upload-progress').css('width', $('#upload-progress-bar').width()*(e.loaded/e.total));
	},
	render: function() {
		return (
			<div id="button-editor">
				<EditorHeader close={this.cancelEditor}/>
				<div id="editor-left-content-container">
					<EditorVideoPlace videoUrl={this.props.editorInfo.videoUrl}/>
					<EditorMainController/>
					<EditorSaveAndCancle close={this.cancelEditor} save={this.saveEditor}/>
				</div>
				<EditorButnOptionsController/>
			</div>
		);
	}
});

var ButtonEditor = React.createClass({
	getInitialState: function() {
		return ({
			editorInfo: {}
		});
	},
	componentWillMount: function() {
		$.ajax({
			url: '/api/getEditorInfo?elmId='+this.props.elmId+'&proName='+$.getUrlParam('proName'),
			cache: false,
			success: function(data) {
				this.setState({
					editorInfo: data
				});
			}.bind(this),
			error: function(xhr, status, err) {
				if(err) console.log(err);
				alert('ajax error!'+err);
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div id="container">
				<EditorContainer editorInfo={this.state.editorInfo}/>
			</div>
		);
	}
});

var Media = React.createClass({
	render: function() {
		return (
			<div className="imgbox">
				<img src={this.props.media.imgUrl}></img>
				<span className="video-url-span">{this.props.media.videoUrl}</span>
			</div>
		);
	}
});

var MediaListContent = React.createClass({
	render: function() {
		var mediaNodes = this.props.medias.map(function(media) {
			if(media === null || media === 'undefined' || media === '') {
				return null;
			}
			return (
				<Media media={media}/>
			);
		});
		return (
			<div id="mediaList_content">
				{mediaNodes}
				<div className="clear-float"></div>
			</div>
		);
	}
});

var MediaListNav = React.createClass({
	render: function() {
		return (
			<div id="mediaList_nav"></div>
		);
	}
});

var MediaListFooter = React.createClass({
	render: function() {
		return (
			<div id="mediaList_footer">
				<div id="video-uploader-container">
					Upload
					<form id="video-form" name="upload-video-form" method="post" encType="multipart/form-data">
						<input id="video-uploader" name="videoup" type="file"></input>
					</form>
				</div>
				<div id="progress-container"></div>
			</div>
		);
	}
});

var MainMediaList = React.createClass({
	startPreview: function() {
		ReactDOM.render(
			<Preview/>,
			document.getElementById('react-insert-point-preview')
		);
	},
	buttonEdit: function(e) {
		var elmId = $('.chosen').attr('id');
		ReactDOM.render(
			<ButtonEditor elmId={elmId}/>,
			document.getElementById('react-insert-point-preview')
		);
	},
	render: function() {
		return (
			<div id="main_mediaList">
				<div id="start-butn-editor" onClick={this.buttonEdit}>Edit</div>
				<div id="start-preview" onClick={this.startPreview}>Preview</div>
				<MediaListNav/>
				<MediaListContent medias={this.props.medias}/>
				<MediaListFooter uploadChange={this.props.uploadChange}/>
			</div>
		);
	}
});

var MainCanvas = React.createClass({
	render: function() {
		return (
			<div id="main_canvas"></div>
		);
	}
});

var StoryMain = React.createClass({
	getInitialState: function() {
		return ({
			medias: [],
			preview: false
		});
	},
	componentDidMount: function() {
		$.ajax({
			url: this.props.initurl+'?proName='+$.getUrlParam('proName'),
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({
					medias: data.medias,
					preview: false
				});
				canvas('#main_canvas', '#mediaList_content', {
					'info': data.info,
					'imgBox-class': 'imgbox',
					'arrowBottom': 3,
					'arrowHeight': 6,
					'pathBottom-width': 0,
					'pathAbove-width': 1,
					'pathAbove-color': '#ca910a'
				}, this.sendElementInfo);
			}.bind(this),
			error: function(xhr,status,err) {
				console.log(err);
				alert(err);
			}.bind(this)
		});
		upVideo({
			url: '/api/uploading?proName='+$.getUrlParam('proName')+'&type=video',
			inputId: 'video-uploader',
			containerId: 'progress-container'
		}, this.setNewMediaList);
	},
	setNewMediaList: function (data) {
		this.setState({
			medias: data.pro.data.medias,
			preview: false
		})
	},
	sendElementInfo: function(type,info) {
		$.ajax({
			url: this.props.saveinfourl+'?type='+type+'&proName='+$.getUrlParam('proName'),
			type: 'POST',
			dataType: 'json',
			data: {
				elmInfo: JSON.stringify(info)
			},
			success: function(data) {
				if(data.success) {
					console.log(type+' success!');
				} else {
					console.log('error! '+data.errMessage);
					alert('error! '+data.errMessage);
				}
			}.bind(this),
			error: function(xhr,status,err) {
				if(err) {
					console.log(err);
					alert('error! '+err);
				}
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div id="story_main">
				<MainCanvas canvas={this.state.canvas}/>
				<MainMediaList medias={this.state.medias} uploadChange={this.uploadChange}/>					
			</div>
		);	
	}
});

ReactDOM.render(
	<StoryMain initurl="/api/getmedias" saveinfourl="/api/saveElementInfo"/>,
	document.getElementById('react-insert-point-canvas')
);