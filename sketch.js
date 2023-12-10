let video;
let myFaceMesh;
let myResults;
let distanceBetweenLips = [];
let keypoints = [];

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
  //images.push(loadImage("affirmation-01.svg"));
  // images.push(loadImage("affirmation-02.svg"));
  // images.push(loadImage("affirmation-03.svg"));
  // images.push(loadImage("affirmation-04.svg"));
  // images.push(loadImage("affirmation-05.svg"));
  // images.push(loadImage("affirmation-06.svg"));
  // images.push(loadImage("affirmation-07.svg"));
  // images.push(loadImage("affirmation-08.svg"));
  // images.push(loadImage("affirmation-09.svg"));
  // images.push(loadImage("affirmation-10.svg"));
  // images.push(loadImage("affirmation-11.svg"));
  // images.push(loadImage("affirmation-12.svg"));
  // images.push(loadImage("affirmation14.svg"));
  // images.push(loadImage("affirmation15.svg"));
  // images.push(loadImage("affirmation16.svg"));
  
  images.push(loadImage("1.svg"));
  images.push(loadImage("2.svg"));
  images.push(loadImage("3.svg"));
  // images.push(loadImage("4.svg"));
  // images.push(loadImage("5.svg"));
  // images.push(loadImage("6.svg"));
  
  images.push(loadImage("BB1.svg"));
  images.push(loadImage("BB2.svg"));
  images.push(loadImage("BB3.svg"));
  images.push(loadImage("BB4.svg"));
  images.push(loadImage("BB5.svg"));
  images.push(loadImage("BB6.svg"));
  images.push(loadImage("BB7.svg"));
  images.push(loadImage("BB8.svg"));
  images.push(loadImage("BB9.svg"));
  images.push(loadImage("BB10.svg"));
  images.push(loadImage("BB11.svg"));
  images.push(loadImage("BB12.svg"));
  
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

  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();

  video.size(width, height);

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
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }

function gotResults(results) {
  myResults = results;
  if (myResults) {
    keypoints = [];
    distanceBetweenLips = [];
    for (let result = 0; result < myResults.length; result++) {
      keypoints.push(myResults[result].scaledMesh);
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
      }
    }
  }
}

function draw() {
  background("#ffffff");
  image(video, 0, 0, width, height);

  fill('#efefef'); // Set text color to black
  textFont(font);
  textAlign(CENTER, CENTER);
  textSize(24);
  text( "Open Your Mouth", width / 2, height / 2);
  
  drawKeypoints();
  displayLipDistance();

  balls.forEach((ball) => {
    if (ball.frame <= 100) {
      ball.collide();
      ball.move();
      ball.display(displayWeight);
      ball.checkCollisions();
    }
  });
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  if (!myResults) return;
  for (let i = 0; i < myResults.length; i += 1) {
    const prediction = myResults[i];
    for (let j = 0; j < prediction.scaledMesh.length; j += 1) {
      const keypoint = prediction.scaledMesh[j];

      //↓↓↓  얼굴 모양 표시
      // fill(0, 255, 0);
      // noStroke();
      // ellipse(keypoint[0], keypoint[1], 5, 5);
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
        let ballDiameter = random(80, 150); //!!스티커 사이즈
        // 스티커 placement
        console.log(keypoints);
        let newBall = new Ball(
          keypoints[face][13][0],
          keypoints[face][14][1],
          ballDiameter,
          balls
        );
        balls.push(newBall);
        clickOnce[face] = true;
        mySound.play();
        console.log(clickOnce[face]);

        //text("MOUTH IS OPEN!", width / 2, 30);
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
    this.position = createVector(x + random(-1, 1), y);
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

// function windowResized() {
//   //resizeCanvas(windowWidth, windowHeight);
//   resizeCanvas(windowWidth, windowHeight);
// }

function saveBG() {
  saveCanvas(generateFileName(), "png");
}

function generateFileName() {
  return "Words of Affirmation";
}
