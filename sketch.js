// our video object
var capture;

// an image object to "memorize" the previous frame of video
var compareFrame;

// threshold to see how tolerant we should be
var threshold = 20;

// motion object
var motionObject1, motionObject2, motionObject3;

var song, playSound, volArray;
var volumelevel = 0.1;

function preload() {
  disco = loadImage('images/discoball.png');
  mermaid = loadImage('images/mermaid.png');
  ballet = loadImage('images/ballerina.png');
  song = loadSound("images/ambient.mp3");
  playSound = loadSound("images/play.wav");
}

function setup() {
  createCanvas(640, 480);

  song.play();

  // start up our web cam
  capture = createCapture({
    video: {
      mandatory: {
        minWidth: 640,
        minHeight: 480,
        maxWidth: 640,
        maxHeight: 480
      }
    }
  });
  capture.hide();
  rectMode(CENTER);

  // create an empty image that will hold a previous frame of video
  compareFrame = new p5.Image(640, 480);

  // create our motion object
  motionObject1 = new movingRegion(width / 5, height / 2, 50, 50);
  motionObject2 = new movingRegion(width / 2, height / 2, 50, 50);
  motionObject3 = new movingRegion(width * 4/5, height / 2, 50, 50);


}

function draw() {
  volArray = [motionObject1.hitCount, motionObject2.hitCount, motionObject3.hitCount];

  // adjust threshold based on the mouse position
  //threshold = map(mouseX, 0, width, 0, 100);
  //console.log(threshold);
  volume = constrain(volumelevel, 0, 1);
  song.amp(volume);
  playSound.amp(0.5);
  threshold = 80;
  // expose the pixels in our video stream
  capture.loadPixels();
  compareFrame.loadPixels();


  // if we have pixels to work with ...
  if (capture.pixels.length > 0) {

    // mirror our video
    mirrorVideo();

    // ask our motion object to move
    motionObject1.move();
    motionObject2.move();
    motionObject3.move();

    // ask our motion object to determine if it has been hit
    motionObject1.checkHit();
    motionObject2.checkHit();
    motionObject3.checkHit();

    // draw our video
    image(capture, 0, 0);
    
    image(mermaid, motionObject1.x - 50, motionObject1.y - 50, 120, 100);
    image(disco, motionObject2.x - 50, motionObject2.y - 50, 100, 100);
    image(ballet, motionObject3.x - 50, motionObject3.y - 50, 100, 100);
    
    console.log(motionObject1.hitCount);


    
    if (motionObject1.hitCount >= 50) {
      playSound.play();
      motionObject1.hitCount = 0;
      motionObject2.hitCount = 0;
      motionObject3.hitCount = 0;
      open("https://i6.cims.nyu.edu/~jk4704/interactive/final_underwater/index.html");
      song.stop();
    }
    
    if (motionObject2.hitCount >= 50) {
      playSound.play();
      motionObject1.hitCount = 0;
      motionObject2.hitCount = 0;
      motionObject3.hitCount = 0;
      open("https://i6.cims.nyu.edu/~mgk285/interactive/final/index.html");
      song.stop();
    }
    
    if (motionObject3.hitCount >= 50) {
      playSound.play();
      motionObject1.hitCount = 0;
      motionObject2.hitCount = 0;
      motionObject3.hitCount = 0;
      open("https://i6.cims.nyu.edu/~pvd233/interactive/ballerina/index.html");
      song.stop();
    }

    volumelevel = max(volArray) / 20;
    console.log(volumelevel);


    // ask our motion object to display itself
    motionObject1.display();
    motionObject2.display();
    motionObject3.display();

    // important - this frame of video becomes our comparision frame for the next iteration of 'draw'
    compareFrame.copy(capture, 0, 0, 640, 480, 0, 0, 640, 480);
  }
}


function movingRegion(x, y, w, h) {
  // store our working values
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  // speed values
  this.xSpeed = 1;
  this.ySpeed = 2;

  // keep track of how many times this object has been hit
  this.hitCount = 0;

  // move this object
  this.move = function(which) {
    //this.x += this.xSpeed;
    this.y += this.ySpeed;

    // bouncing logic
    if (this.x < 50) {
      this.x = 50;
      this.xSpeed *= -1;
    }
    if (this.y < 50) {
      this.y = 50;
      this.ySpeed *= -1;
    }
    if (this.x + this.w > width) {
      this.x = width - this.w;
      this.xSpeed *= -1;
    }
    if (this.y + this.h > height) {
      this.y = height - this.h;
      this.ySpeed *= -1;
    }
  }

  // display this object
  this.display = function() {
    noFill();
    textAlign(CENTER);
  }

  this.checkHit = function() {
    var movedPixels = 0;
    for (var x = this.x; x < this.x + this.w; x++) {
      for (var y = this.y; y < this.y + this.h; y++) {
        // compute 1D location
        var loc = (x + y * capture.width) * 4;

        // determine if there is motion here
        if (dist(capture.pixels[loc], capture.pixels[loc + 1], capture.pixels[loc + 2], compareFrame.pixels[loc], compareFrame.pixels[loc + 1], compareFrame.pixels[loc + 2]) > threshold)
          movedPixels += 1;
      }
    }

    capture.updatePixels();

    // if we have 20% motion then we can qualify this as a hit
    if (movedPixels / (this.w * this.h / 2) > 0.2) {
      this.hitCount += 1;
    }
  }
}

// mirror our video
function mirrorVideo() {
  // iterate over 1/2 of the width of the image & the full height of the image
  for (var x = 0; x < capture.width / 2; x++) {
    for (var y = 0; y < capture.height; y++) {
      // compute location here
      var loc1 = (x + y * capture.width) * 4;
      var loc2 = (capture.width - x + y * capture.width) * 4;

      // swap pixels from left to right
      var tR = capture.pixels[loc1];
      var tG = capture.pixels[loc1 + 1];
      var tB = capture.pixels[loc1 + 2];

      capture.pixels[loc1] = capture.pixels[loc2];
      capture.pixels[loc1 + 1] = capture.pixels[loc2 + 1];
      capture.pixels[loc1 + 2] = capture.pixels[loc2 + 2];

      capture.pixels[loc2] = tR;
      capture.pixels[loc2 + 1] = tG;
      capture.pixels[loc2 + 2] = tB;
    }
  }
  capture.updatePixels();
}