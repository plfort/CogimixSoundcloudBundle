function soundcloudPlayer(musicPlayer) {
	this.name = "Soundcloud";
	this.baseUrl=location.protocol +"//w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/";
	this.interval;
	this.cancelRequested = false;
	this.musicPlayer = musicPlayer;
	this.currentState = null;
	this.scplayer = null;
	this.widgetElement = $("#soundcloudWidgetContainer");
	var self = this;
	
	this.requestCancel=function(){
		self.cancelRequested=true;
	};
	
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
			loggerSoundcloud.debug('first call soundcloud player');
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
		loggerSoundcloud.debug('call stop soundcloud');	
		if(self.scplayer !=null){
			self.scplayer.pause();	
			self.hideWidget();
		}
	}
	
	this.pause = function(){
		loggerSoundcloud.debug('call pause soundcloud');
		if(self.scplayer !=null){
			self.scplayer.toggle();
		}
		
	}
	
	this.resume = function(){
		loggerSoundcloud.debug('call resume soundcloud');
		if(self.scplayer !=null){
			self.scplayer.toggle();
		}
	}
	
	this.setVolume = function(value){
	
		if(self.scplayer !=null){
			loggerSoundcloud.debug('call setVolume soundcloud : '+value);
			self.scplayer.setVolume(value/100);
		}
	}
	
	this.playHelper = function() {
		try{
			if(self.scplayer !=null){
				self.scplayer.play();
			}
		}catch(err){
			loggerSoundcloud.debug('catch error soundcloud '+err);
		}
	};
	

	this.onSoundcloudPlayerReady = function(player) {
		loggerSoundcloud.debug('player is ready !');
		self.scplayer.bind(SC.Widget.Events.PLAY,self.onSoundcloudPlayerPlay);
		self.scplayer.bind(SC.Widget.Events.PAUSE,self.onSoundcloudPlayerPause);
		self.scplayer.bind(SC.Widget.Events.FINISH,self.onSoundcloudPlayerFinish);
		self.scplayer.bind(SC.Widget.Events.ERROR,self.onSoundcloudPlayerError);
		self.scplayer.bind(SC.Widget.Events.PLAY_PROGRESS,self.onSoundCloudPlayProgress);
		setTimeout(self.playHelper, 1500);
	};
	
	this.onSoundCloudPlayProgress = function(data){
		if(self.cancelRequested == false){
			self.musicPlayer.cursor.progressbar("value",data.loadedProgress*100);
			if(self.musicPlayer.cursor.data('isdragging')==false){
				self.musicPlayer.cursor.slider("value",data.currentPosition/1000 );	
			}
		}else{
			self.cancelRequested = false;
			self.stop();
		}
		
	};
	
	this.onSoundcloudPlayerFinish = function(data){
		loggerSoundcloud.debug('onSoundcloudPlayerFinish');
		//self.hideWidget();
		self.musicPlayer.unbinCursorStop();
		self.musicPlayer.next();
	};
	
	this.onSoundcloudPlayerError = function(data){
		loggerSoundcloud.debug('onSoundcloudPlayerError');
		//self.hideWidget();
		self.musicPlayer.unbinCursorStop();
		self.musicPlayer.next();
	};
	
	this.onSoundcloudPlayerPause = function(data){
		loggerSoundcloud.debug('onSoundcloudPlayerPause');
		//self.musicPlayer.unbinCursorStop();
	};

	
	this.onSoundcloudPlayerPlay = function(data){
	
		if(self.musicPlayer.currentPlugin.name == self.name){
			self.setVolume(self.musicPlayer.volume);
			//self.showWidget();
			self.musicPlayer.enableControls();
			loggerSoundcloud.debug('onSoundcloudPlayerPlay');
			
			//self.musicPlayer.cursor.slider("option", "max",100);
			self.musicPlayer.cursor.progressbar();
		
			
			self.scplayer.getDuration(function(duration){
				self.musicPlayer.cursor.slider("option", "max",duration/1000);
				self.musicPlayer.bindCursorStop(function(value) {
					self.scplayer.seekTo(value*1000);
				});
			});
		}else{
			
			self.stop();
		}
	}

}
iconMap['sc'] = '/bundles/cogimixsoundcloud/images/sc-icon.png';
$("body").on('musicplayerReady',function(event){
	event.musicPlayer.addPlugin('sc',new soundcloudPlayer(event.musicPlayer));
});



