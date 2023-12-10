let video;
let myFaceMesh;
let myResults;
let distanceBetweenLips = [];
let keypoints = [];
let scale, offsetX, offsetY; // Declare these variables globally
let isMouthOpen = false;

let balls = [];
let images = [];
let imgWidth = 0; // Adjust the image width to your preference
let imgHeight = 0; // Adjust the image height to your preference
let displayWeight = false;
let clickOnce = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];
let FRAME_RATE = 60;
let SPEED_FLUSH = 3;
let Y_GROUND;
let lastFR;

let font;
let button;

function preload() {
  //!!디자이너 vernacular로 바꾸기!
images.push(loadImage("WordsOfAffirmation.svg"));


  
  //sound
  soundFormats("mp3", "ogg");
  //mySound = loadSound("bubblepop.mp3");
  mySound = loadSound("yay.mp3");
  mySound = loadSound("woww.mp3");
  
  //font
  font = loadFont("Mineral-Solid.otf");
}

function setup() {
  frameRate(FRAME_RATE);
  createCanvas(windowWidth, windowHeight);  // Full window size
  video = createCapture(VIDEO);
  video.hide();


  myFaceMesh = ml5.facemesh(video);
  myFaceMesh.on("predict", gotResults);

  //스티커 끝단
  Y_GROUND = windowHeight;
  lastFR = FRAME_RATE;

  //print button
  // button = createButton("PRINT");
  // button.position(0, 0);
  // button.mousePressed(saveBG);
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotResults(results) {
  myResults = results;
  if (myResults) {
    keypoints = [];
    distanceBetweenLips = [];

    // Scaling factors based on full window size
    let scaleX = windowWidth / video.width;
    let scaleY = windowHeight / video.height;

    for (let result = 0; result < myResults.length; result++) {
      let scaledMesh = [];
      for (let i = 0; i < myResults[result].scaledMesh.length; i++) {
        let keypoint = myResults[result].scaledMesh[i];
        // Apply scaling to each keypoint
        scaledMesh.push([keypoint[0] * scaleX, keypoint[1] * scaleY]);
      }
      keypoints.push(scaledMesh);

      // Check if the keypoints for the lips are available
      if (keypoints[result][13] && keypoints[result][14]) {
        // Calculate the distance between the two lip keypoints
        distanceBetweenLips.push(
          dist(
            keypoints[result][13][0],
            keypoints[result][13][1], // x and y of the first point (top lip)
            keypoints[result][14][0],
            keypoints[result][14][1] // x and y of the second point (bottom lip)
          )
        );

        // Check for mouth opening and create new balls
        if (distanceBetweenLips[result] > 5 ) {
          isMouthOpen = true;

          let ballDiameter = random(80, 150); // Adjust the sticker size
          // Sticker placement
          let newBall = new Ball(
            keypoints[result][13][0],
            keypoints[result][14][1],
            ballDiameter,
            balls
          );
          balls.push(newBall);
          clickOnce[result] = true;
          mySound.play();
        } else if (distanceBetweenLips[result] < 5) {
          isMouthOpen = false;

          clickOnce[result] = false;
        }
      }
    }
  }
}


function draw() {
  background("black");

  // Calculate the aspect ratio of the video
  let videoAspectRatio = video.width / video.height;
  let windowAspectRatio = windowWidth / windowHeight;
  let scale;

  // Determine the scale factor based on aspect ratios
  if (windowAspectRatio > videoAspectRatio) {
    // Window is wider than the video
    scale = windowHeight / video.height;
  } else {
    // Window is narrower than the video
    scale = windowWidth / video.width;
  }

  // Calculate the scaled dimensions of the video
  let scaledWidth = video.width * scale;
  let scaledHeight = video.height * scale;

  // Calculate the offset to center the video in the window
  let offsetX = (windowWidth - scaledWidth) / 2;
  let offsetY = (windowHeight - scaledHeight) / 2;

  // Display the scaled and centered video
  image(video, offsetX, offsetY, scaledWidth, scaledHeight);

 
  // Example: Drawing keypoints (if applicable)
  // Adjust the drawKeypoints function call to include scale and offsets
  drawKeypoints(scale, offsetX, offsetY);

  // Example: Drawing additional elements like text
  fill('#efefef'); // Set text color
  textFont(font);
  textAlign(CENTER, CENTER);
  textSize(64);
if (isMouthOpen == false) {
  text("Open Your Mouth", width / 2, height / 2);
}
  balls.forEach((ball) => {
    if (ball.frame <= 100) {
      ball.collide();
      ball.move();
      ball.display(displayWeight);
      ball.checkCollisions();
    }
  });
}

function drawKeypoints(scale, offsetX, offsetY) {
  if (!myResults) return;

  for (let i = 0; i < myResults.length; i += 1) {
    const prediction = myResults[i];
    for (let j = 0; j < prediction.scaledMesh.length; j += 1) {
      const keypoint = prediction.scaledMesh[j];

      // Apply scaling and offset
      let scaledX = keypoint[0] * scale + offsetX;
      let scaledY = keypoint[1] * scale + offsetY;

      // fill(0, 255, 0);
      // noStroke();
      // ellipse(scaledX, scaledY, 5, 5);
    }
  }
}


// Function to display the distance between the lips and whether the mouth is open
function displayLipDistance() {
  fill("white");
  textSize(36);
  textAlign(CENTER, CENTER);

  //text("Lip Distance:" + distanceBetweenLips, width / 2, 30);
  for (let face = 0; face < keypoints.length; face++) {
    if (
      typeof distanceBetweenLips[face] === "number" &&
      !isNaN(distanceBetweenLips[face])
    ) {
      //text("Lip Distance: " + distanceBetweenLips[face].toFixed(2), width / 2, 30);
      if (distanceBetweenLips[face] > 5 /*&& clickOnce[face] == false*/) {
        let ballDiameter = random(100, 700); //!!스티커 사이즈
        // 스티커 placement
        console.log(keypoints);
        let newBall = new Ball(
          keypoints[face][13][0] ,
          keypoints[face][14][1],
          ballDiameter,
          balls
        );
        balls.push(newBall);
        clickOnce[face] = true;
        mySound.play();
        console.log(clickOnce[face]);

      }
      if (distanceBetweenLips[face] < 2) {
        clickOnce[face] = false;
        console.log(clickOnce[face]);
        //text("Lip Distance: " + distanceBetweenLips[face].toFixed(), width / 2, 30);
      }
    }
    /*else {
      // Handle the case where distanceBetweenLips is not a number
      text("Lip Distance: ", width / 2, 30);
    }*/
  }
}

class Ball {
  constructor(x, y, w, e, img) {
    this.id = e.length;
    this.w = w;
    this.e = e;
    this.img = random(images); // Select a random image

    this.progressiveWidth = 0;
    this.mass = w;
    this.position = createVector(x+random(-1, 1), y); //tweak this for lip location
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);

    this.frame = 0;

    this.gravity = 0.2;
    this.friction = 0.2;
  }

  collide() {
    for (let i = this.id + 1; i < this.e.length; i++) {
      let dx = this.e[i].position.x - this.position.x;
      let dy = this.e[i].position.y - this.position.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = this.e[i].w / 3 + this.w / 2;

      if (distance < minDist) {
        let angle = atan2(dy, dx);
        let targetX = this.position.x + cos(angle) * minDist;
        let targetY = this.position.y + sin(angle) * minDist;

        this.acceleration.set(
          targetX - this.e[i].position.x,
          targetY - this.e[i].position.y
        );
        this.velocity.sub(this.acceleration);
        this.e[i].velocity.add(this.acceleration);
        this.velocity.mult(this.friction);
      }
    }
  }

  move() {
    this.velocity.add(createVector(0, this.gravity));
    this.position.add(this.velocity);
  }

  display(displayMass) {
    this.frame += 1;

    if (this.progressiveWidth < this.w) {
      this.progressiveWidth += this.w / 10;
    }
    // Calculate the aspect ratio of the image
    let aspectRatio = this.img.width / this.img.height;

    // Calculate the new height based on the progressive width and the aspect ratio
    let newHeight = this.progressiveWidth / aspectRatio;

    // Use the loaded image for the ball and display it with the new dimensions
    image(
      this.img,
      this.position.x - this.progressiveWidth / 2,
      this.position.y - newHeight / 2, // Center the image vertically
      this.progressiveWidth,
      newHeight
    );

    /*if (displayMass) {
      strokeWeight(1);
      textSize(10);
      let tempTW = textWidth(int(this.w));
      text(int(this.w), this.position.x - tempTW / 2, this.position.y + 4);
    }*/
  }

  checkCollisions() {
    if (this.position.x > width - this.w / 2) {
      this.velocity.x *= -this.friction;
      this.position.x = width - this.w / 2;
    } else if (this.position.x < this.w / 2) {
      this.velocity.x *= -this.friction;
      this.position.x = this.w / 2;
    }

    if (this.position.y > Y_GROUND - this.w / 2) {
      this.velocity.x -= this.velocity.x / 100;
      this.velocity.y *= -this.friction;
      this.position.y = Y_GROUND - this.w / 2;
    } else if (this.position.y < this.w / 2) {
      this.velocity.y *= -this.friction;
      this.position.y = this.w / 2;
    }
  }
}


function windowResized() {
  //resizeCanvas(windowWidth, windowHeight);
  resizeCanvas(windowWidth, windowHeight);
}

function saveBG() {
  saveCanvas(generateFileName(), "png");
}

function generateFileName() {
  return "Words of Affirmation";
}