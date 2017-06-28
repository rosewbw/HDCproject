var React = require('react');
var ReactDOM = require('react-dom');
require('./geturlparameter');

var ProCreateTime = React.createClass({
	render: function() {
		return (
			<div className="pro-create-time-box">
				<p>{this.props.time}</p>
			</div>
		);
	}
});

var ProName = React.createClass({
	render: function() {
		return (
			<div className="pro-name-box">
				<p>{this.props.name}</p>
			</div>
		);
	}
});

var ProImg = React.createClass({
	render: function() {
		return (
			<div className="pro-img-box">
				<img src={this.props.img}></img>
			</div>
		);
	}
});

var ProAddInfo = React.createClass({
	handleSubimt: function(e) {
		e.preventDefault();
		var proName = this.refs.proName.value;
		if(proName === null || proName === ''){
			return;
		}
		this.props.onSubmitHandle(proName);
	},
	proAddBoxCancle: function() {
		this.props.onClickHandle();
	},
	render: function() {
		return (
			<div className="new-pro-info-box">
				<p>Create Pro</p>
				<form className="new-pro-info-form" onSubmit={this.handleSubimt}>
					<div className="new-pro-info-input">
						<span className="pro-input-title">project-name</span>
						<input type="text" ref="proName"></input>
					</div>
					<div className="new-pro-info-submit">
						<input className="submit" type="submit" value="Submit"></input>
						<div className="cancle" onClick={this.proAddBoxCancle}>Cancle</div>
					</div>
				</form>
			</div>
		);
	}
});

var ProjectBox = React.createClass({
	clickProRemove: function(e) {
		this.props.projectRemove(this.props.proInfo.proName);
	},
	render: function() {
		var ahref='/projects/editor?proName='+this.props.proInfo.proName;
		return (				
			<div className="pro-box">
				<a href={ahref}><ProImg img={this.props.proInfo.img}/></a>
				<ProName name={this.props.proInfo.proName}/>
				<ProCreateTime time={this.props.proInfo.createTime}/>
				<div className="pro-remove" onClick={this.clickProRemove}>×</div>
			</div>
		);
	}
});

var ProjectList = React.createClass({
	getInitialState: function() {
		return {
			data: [],
			addition: false
		}
	},
	componentDidMount: function() {
		$.ajax({
			url: this.props.urlGet,
			type: 'POST',
			dataType: 'json',
			data: {id: $.getUrlParam('id')},
			success: function(data) {
				this.setState({
					data:data,
					additon: false
				});
			}.bind(this),
			error: function(xhr,status,err) {
				console.log(err);
				alert(err);
			}.bind(this)
		});
	},
	projectAdditionBox: function() {
		this.setState({
			data: this.state.data,
			addition: true
		});
	},
	addBoxCancle: function() {
		this.setState({
			data: this.state.data,
			addition: false
		});
	},		
	handleProjectAdditionSubimt: function(newProInfo) {
		$.ajax({
			url: this.props.urlPut,
			type: 'POST',
			dataType: 'json',
			data: {
				name:newProInfo,
				id:$.getUrlParam('id')
			},
			success: function(data) {
				this.setState({
					data: data,
					addition: false
				});
			}.bind(this),
			error: function(xhr,status,err) {
				console.log(err);
				alert(err);
			}.bind(this)
		});
	},
	projectRemove: function(proName) {
		$.ajax({
			url: this.props.urlRemove+'?id='+$.getUrlParam('id'),
			type: 'POST',
			dataType: 'json',
			data: {proName: proName},
			success: function(data) {
				this.setState({
					data: data,
					addition: false
				});
			}.bind(this),
			error: function(xhr,status,err) {
				console.log(err);
				alert(err);
			}.bind(this)
		});
	},
	render: function() {
		var remove = this.projectRemove;
		var projectNodes = this.state.data.map(function(pro) {
			if(pro === null || pro === 'undefined' || pro === ''){
				return null;
			}
			return (
				<ProjectBox proInfo={pro} projectRemove={remove}/>
			);
		});
		if(!this.state.addition){
			return (
				<div className="pro-container">
					{projectNodes}
					<div className="pro-add-box" onClick={this.projectAdditionBox}></div>
					<div className="clear-float"></div>
				</div>
			);
		} else {
			return (
				<div className="pro-container">
					{projectNodes}
					<div className="pro-add-box"></div>
					<div className="clear-float"></div>
					<ProAddInfo onSubmitHandle={this.handleProjectAdditionSubimt} onClickHandle={this.addBoxCancle}/>
				</div>
			);
		}
	}
});

var ProContainer = React.createClass({
	render: function() {
		return 	(<ProjectList urlGet={this.props.urlGet} urlPut={this.props.urlPut} urlRemove={this.props.urlRemove}/>);			
	}
});

ReactDOM.render(
	<ProContainer urlGet="/projects" urlPut="/projectsAddition" urlRemove="/api/projectRemove"/>,
	document.getElementById('react-insert-point-pro')
);
