// plugin based around http://stackoverflow.com/a/23828241

(function(window, factory) {
	// universal module definition

	/*global define: false, module: false, require: false */

	if ( typeof module == 'object' && module.exports ) {
		// CommonJS
		module.exports = factory(
			window
		);
	} else {
		// browser global
		window.buffer = factory(
			window
		);
	}
})(window, function factory(window) {
	function VideoBuffer(video, onBuffer, onPlay) {
		this.video = video;

		this.onBuffer = onBuffer;
		this.onPlay = onPlay;

		this.checkInterval = 50.0;
		this.lastPlayPos = 0;
		this.currentPlayPos = 0;
		this.bufferingDetected = false;
		this.interval = null;

		this.video.addEventListener('play', (function(e) {
			this.interval = setInterval(checkBuffering.bind(this), this.checkInterval);
		}).bind(this));
		this.video.addEventListener('pause', (function(e) {
			clearInterval(this.interval);
		}).bind(this));
		this.video.addEventListener('ended', (function(e) {
			clearInterval(this.interval);
		}).bind(this));
	}

	function checkBuffering() {
		this.currentPlayPos = this.video.currentTime

		// checking offset, e.g. 1 / 50ms = 0.02
		var offset = 1 / this.checkInterval;

		// if no buffering is currently detected,
		// and the position does not seem to increase
		// and the player isn't manually paused...
		if (
				!this.bufferingDetected 
				&& this.currentPlayPos <= (this.lastPlayPos + offset)
				&& !this.video.paused
			) {
			this.onBuffer && this.onBuffer();
			this.bufferingDetected = true;
		}

		// if we were buffering but the player has advanced,
		// then there is no buffering
		if (
			this.bufferingDetected 
			&& this.currentPlayPos > (this.lastPlayPos + offset)
			&& !this.video.paused
			) {
			this.onPlay && this.onPlay();
			this.bufferingDetected = false;
		}
		this.lastPlayPos = this.currentPlayPos;
	}

	return VideoBuffer;
});