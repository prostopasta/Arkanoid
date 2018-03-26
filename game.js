var game = {
	running: true,
	width: 640,
	height: 360,
	score: 0,
	sprites: { paddle: undefined, background: undefined, block: undefined, ball: undefined},
	ball: {},
	paddle: {},
	blocks: [],
	rows: 4,
	cols: 8,
	init: function(){
		var canvas = document.getElementById("mycanvas");
		this.ctx = canvas.getContext("2d");
		this.ctx.font = '20px Arial';
		this.ctx.fillStyle = '#FFFFFF';
		var self = this;
		window.addEventListener('keydown', function(e){
			if ( e.keyCode == 32 ) {
				self.paddle.releaseBall();
			} else if ( e.keyCode == 37 ) {
				self.paddle.dx = -self.paddle.velocity;
			} else if ( e.keyCode == 39 ) {
				self.paddle.dx = self.paddle.velocity;
			}
		});
		window.addEventListener('keyup', function(e){
			self.paddle.stop();
		});
	},
	preload: function(){
		for (var key in this.sprites) {
			this.sprites[key] = new Image();
			this.sprites[key].src = 'images/' + key + '.png';
		}
	},
	generateBlocks: function(){
		for ( var row = 0; row < this.rows; row++ ) {
			for ( var col = 0; col < this.cols; col++ ) {
				this.blocks.push({
					x: 68 * col + 50,
					y: 36 * row + 35,
					width: 64,
					height: 32,
					isAlive: true
				});
			}
		}
	},
	update: function() {
		if ( this.ball.collide(this.paddle) ) {
			this.ball.bumpPuddle(this.paddle);
		}

		if( this.ball.dx || this.ball.dy ) {
			this.ball.move();
		}

		if( this.paddle.dx ) {
			this.paddle.move();
		}

		this.blocks.forEach(function(element, index){
			if ( element.isAlive ) {
				if( this.ball.collide(element) ) {
					this.ball.bumpBlock(element);
				}
			}
		}, this);

		this.ball.checkBounds();
	},
	render: function() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.drawImage(this.sprites.background, 0, 0);
	    this.ctx.drawImage(this.sprites.ball, this.ball.width * this.ball.frame, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
		this.ctx.drawImage(this.sprites.paddle, this.paddle.x, this.paddle.y);
		this.blocks.forEach(function(element){
			if ( element.isAlive ) {
				this.ctx.drawImage(this.sprites.block, element.x, element.y);
			}
		}, this);

		this.ctx.fillText('Score: ' + this.score, 15, this.height - 15);

	},
	run: function() {
		this.update();
		this.render();

		if (this.running) {
			window.requestAnimationFrame(function(){
				game.run();
			}); 
		}	 
	},
	start: function(){
		this.init();
		this.preload();
		this.generateBlocks();
		this.run();
	}
};

game.ball = {
	frame: 0,
	x: 340,
	y: 278,
	velocity: 3,
	dx: 0,
	dy: 0,
	width: 22,
	height: 22,
	move: function(){
		this.x += this.dx;
		this.y += this.dy;
	},
	animate: function(){
		var self = this;
		this.animation = setInterval(function(){
			++self.frame;
			if ( self.frame > 3 ) {
				self.frame = 0;
			}
		}, 100);
	},
	jump: function(){
		this.dy = this.dx = -this.velocity;
		this.animate();
	},
	collide: function(element) {
		var x = this.x + this.dx;
		var y = this.y + this.dy;

		if ( x + this.width > element.x &&
			x < element.x + element.width &&
			y + this.height > element.y &&
			y < element.y + element.height) {
			return true;
		}
		return false;
	},
	onTheLeftSide: function(paddle) {
		return (this.x + this.width / 2) < (paddle.x + paddle.width / 2);
	},
	checkBounds: function(){
		var x = this.x + this.dx;
		var y = this.y + this.dy;

		if ( x < 0  ) {
			this.x = 0;
			this.dx = this.velocity;
		} else if ( x + this.width > game.width ) {
			this.x = game.width - this.width;
			this.dx = -this.velocity;
		} else if ( y < 0 ) {
			this.y = 0;
			this.dy = this.velocity;
		} else if( this.y + this.height >= game.height ) {
			this.over('Game Over');
		}
	},
	bumpPuddle: function(paddle){
		this.dy = -this.velocity;
		this.dx = this.onTheLeftSide(paddle) ? -this.velocity : this.velocity;
	},
	bumpBlock: function(block){
		block.isAlive = false;
		this.dy *= -1;
		++game.score;
		if ( game.score == game.blocks.length ) {
			this.over('You win!');
		}
	},
	over: function(message) {
		game.running = false;
		alert(message);
		window.location.reload();
	}
};

game.paddle = {
	x: 300,
	y: 300,
	dx: 0,
	velocity: 6,
	width: 104,
	height: 24,
	ball: game.ball,
	stop: function(){
		this.dx = 0;

		if ( this.ball ) {
			this.ball.dx = 0;
		}
	},
	move: function(){
		this.x += this.dx;

		if ( this.ball ) {
			this.ball.x += this.dx;
		}
	},
	releaseBall: function(){
		if ( this.ball ) {
			this.ball.jump();
			this.ball = false;
		}
	}
};

window.addEventListener("load",function() {
	game.start();
});
