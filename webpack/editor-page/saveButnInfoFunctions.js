var saveType = {};

saveType['changeButnPosition'] = changeButnPosition;
saveType['changeButnSize'] = changeButnSize;
saveType['changeButnName'] = changeButnName;
saveType['Font-Size'] = changeFontSize;
saveType['Radius'] = changeRadius;
saveType['Opacity'] = changeBackground;
saveType['Border-Width'] = changeBorderWidth;
saveType['border'] = changeBorderColor;
saveType['font'] = changeFontColor;


function PublicInterface(info, array, type) {
	array.map(function(butn) {
		if(butn.targetId === info.id) {
			saveType[type](butn.buttonOptions, info);
		}
	});
}

function changeButnPosition(options, info) {
	options.position.x = parseInt(info.position.left.match(/\-?\d+/));
	options.position.y = parseInt(info.position.top.match(/\-?\d+/));
}

function changeButnSize(options, info) {
	options.size.x = info.size.width;
	options.size.y = info.size.height;
}

function changeButnName(options, info) {
	options.name = info.name;
}

function changeBackground(options, info) {
	options.color = info.value;
}

function changeFontSize(options, info) {
	options.fontSize = info.value;
}

function changeRadius(options, info) {
	options.radius = info.value;
}

function changeBorderWidth(options, info) {
	options.borderWidth = info.value;
}

function changeBorderColor(options, info) {
	options.borderColor = info.value;
}

function changeFontColor (options, info) {
	options.fontColor = info.value;
}

module.exports = PublicInterface;