var Animation = module.exports = {};


// 表情动画
Animation.getEmotionAnimalNode = function(index, scheduler) {
	var rootNode = new cc.Node();

	var getNodes = function(count, width, height) {
		var nodes = [];
		for(var i = 0; i < count; ++i) {
			var node = new cc.Node();
			node.active = false;
			node.parent = rootNode;
			nodes.push(node);
		}
		cc.loader.loadRes('Emotion/'+index, cc.SpriteFrame, function(err, spriteFrame) {
			for(var i = 0; i < count; ++i) {
				var rect = new cc.Rect(i*width, 0, width, height);
				var cloneSpriteFrame = spriteFrame.clone();
				cloneSpriteFrame.setRect(rect);
				var sprite = nodes[i].addComponent(cc.Sprite);
				sprite.spriteFrame = cloneSpriteFrame;
			}
		});
		return nodes;
	};

	var self = scheduler;
	cc.loader.load(cc.url.raw('resources/Emotion/'+index+'.json'), function (err, data) {
		if(! err) {
			var nodes = getNodes(data.count, data.width, data.height);
			var index = 0;
			var callback = function() {
				var preIndex = (index+data.count-1)%data.count;
				nodes[preIndex].active = false;
				var curIndex = index%data.count;
				nodes[curIndex].active = true;
				++ index;
				if(index >= data.turn*data.count) {
					self.unschedule(callback);
					rootNode.removeFromParent();
				}
			};
			self.schedule(callback, 0.04 * data.time);
		}
	});
	return rootNode;
};

