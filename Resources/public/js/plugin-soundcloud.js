function soundcloudPlayer(musicPlayer) {
	this.name = "Soundcloud";
	this.baseUrl=location.protocol +"//w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/";
	this.interval;
	this.musicPlayer = musicPlayer;
	this.currentState = null;
	this.scplayer = null;
	this.widgetElement = $("#soundcloudplayer");
	var self = this;
	
	
	this.hideWidget=function(){
		if(self.widgetElement!=null){
		
			self.widgetElement.addClass('fakeHide');
		}
	}
	this.showWidget = function(){
		if(self.widgetElement!=null){
			
			self.widgetElement.removeClass('fakeHide');
		}
	}
	
	this.play = function(item) {
		var trackId = item.entryId;

		if (self.scplayer == null) {
			console.log('first call soundcloud player');
			var iframe = document.getElementById('soundcloudplayer');
			iframe.src = self.baseUrl+trackId+"&auto_play=false";
	
			self.scplayer = SC.Widget(iframe);
			self.scplayer.bind(SC.Widget.Events.READY,self.onSoundcloudPlayerReady);

			
		} else {
	
			self.scplayer.load("https://api.soundcloud.com/tracks/"+trackId,{'auto_play':true});

			//setTimeout(self.playHelper, 1000);
		}

	};
	this.stop = function(){
		console.log('call stop soundcloud');	
		
		self.scplayer.pause();	
	}
	
	this.pause = function(){
		console.log('call pause soundcloud');
		self.scplayer.toggle();
		
	}
	this.resume = function(){
		console.log('call resume soundcloud');
		self.scplayer.toggle();
	}
	
	this.playHelper = function() {
		try{
		self.scplayer.play();
		}catch(err){
			console.log('catch error soundcloud '+err);
		}
	};
	

	this.onSoundcloudPlayerReady = function(player) {
		console.log('player is ready !');
		self.scplayer.bind(SC.Widget.Events.PLAY,self.onSoundcloudPlayerPlay);
		self.scplayer.bind(SC.Widget.Events.PAUSE,self.onSoundcloudPlayerPause);
		self.scplayer.bind(SC.Widget.Events.FINISH,self.onSoundcloudPlayerFinish);
		self.scplayer.bind(SC.Widget.Events.PLAY_PROGRESS,self.onSoundCloudPlayProgress);
		setTimeout(self.playHelper, 1500);
	};
	
	this.onSoundCloudPlayProgress = function(data){
	
		self.musicPlayer.cursor.progressbar("value",data.loadedProgress*100);
		if(self.musicPlayer.cursor.data('isdragging')==false){
			self.musicPlayer.cursor.slider("value",data.currentPosition );	
			
		}
		
	};
	
	this.onSoundcloudPlayerFinish = function(data){
		console.log('onSoundcloudPlayerFinish');
		self.hideWidget();
		self.musicPlayer.unbinCursorStop();
		self.musicPlayer.next();
	};
	
	this.onSoundcloudPlayerPause = function(data){
		console.log('onSoundcloudPlayerPause');
		self.musicPlayer.unbinCursorStop();
	};

	
	this.onSoundcloudPlayerPlay = function(data){
		if(self.musicPlayer.currentPlugin.name == self.name){
			self.showWidget();
			self.musicPlayer.enableControls();
			console.log('onSoundcloudPlayerPlay');
			
			//self.musicPlayer.cursor.slider("option", "max",100);
			self.musicPlayer.cursor.progressbar();
		
			
			self.scplayer.getDuration(function(duration){
				self.musicPlayer.cursor.slider("option", "max",duration);
				self.musicPlayer.bindCursorStop(function(value) {
					self.scplayer.seekTo(value);
				});
			});
		}else{
			self.stop();
		}
	}

}


