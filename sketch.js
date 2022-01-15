let angle, speed, x, h, initX, initZ, autoAngle, autoSpeed;
let turn = 0;
//1 meter = 100 px;
let scl = 100;

function setup() {
  createCanvas(1000, 600);

  angle = createSlider(45, 90, 75, 0.1);
  aLabel = createDiv("Angle");
  aLabel.position(25, height + 25);
  angle.parent(aLabel);

  speed = createSlider(0, 13, 7, 0.01);
  sLabel = createDiv("Speed");
  sLabel.position(275, height + 25);
  speed.parent(sLabel);

  x = createSlider(0, 500, 320, 10);
  xLabel = createDiv("Dist");
  xLabel.position(25, height + 75);
  x.parent(xLabel);
  
  h = createSlider(0, 1.4, 0.4, 0.1);
  hLabel = createDiv("Height");
  hLabel.position(275, height + 75);
  h.parent(hLabel);
  
  initX = createSlider(-3.5, 3.5, 0, 0.1);
  ixLabel = createDiv("Init X");
  ixLabel.position(25, height + 125);
  initX.parent(ixLabel);
  
  initZ = createSlider(-3.5, 3.5, 0, 0.1);
  izLabel = createDiv("Init Z");
  izLabel.position(275, height + 125);
  initZ.parent(izLabel);
  
  autoAngle = createCheckbox("Auto Angle", true);
  autoAngle.position(500, height + 25);
  
  autoSpeed = createCheckbox("Auto Speed", true);
  autoSpeed.position(500, height + 50);
}

function draw() {
  background(220);

  //scale
  for (let i = 0; i < height; i += scl / 2) {
    if (i % scl == 0) {
      line(0, i, 10, i);
    } else {
      line(0, i, 5, i);
    }
  }
  
  for (let i = 0; i < width; i += scl / 2) {
    if (i % scl == 0) {
      line(i, height, i, height - 10);
    } else {
      line(i, height, i, height - 5);
    }
  }
  
  fill(0);
  
  calcSpeed();
  
  textSize(32);
  text(speed.value() + "m/s", 10, 30);
  text(angle.value() + "°", 10, 60);
  text( round(((width / 2 - x.value()) / scl + 0.61) * 100 )/100 + "m", 10, 90);
  text(round(h.value() * 10)/10 + "m", 10, 120);
  text(initX.value() + "m/s", 10, 150);
  text(initZ.value() + "m/s", 10, 180);


  noFill();
  rect(width / 2, height - scl * 2.6416, scl * 1.2192, 25);
  circle(width / 2 + scl*0.6096, height - scl * 2.6416, 10);
  push();
  translate(x.value(), height);
  rotate(radians(angle.value()));
  //rect(0, 0, 50, -scl * h.value());
  pop();
  push();
  translate( x.value(), height - scl * h.value() );
  rect(-0.762 * scl/2, 0, 0.762 * scl, scl * h.value());
  
  beginShape();
  for (let t = 0; t < 1000; t++) {
    vertex(posX(t / 100), -posY(t / 100));
  }
  endShape();

  drawDrag();

  pop();
}

function posX(t) {
  return scl * ( (speed.value() * cos(turn) * cos(radians(angle.value())) + initX.value()) * t);
}

function posZ(t) {
  return scl * ( (speed.value() * sin(turn) * cos(radians(angle.value())) + initZ.value()) * t);
}

function posY(t) {
  return (
    scl * (speed.value() * t * sin(radians(angle.value())) + 0.5 * -9.8 * t * t)
  );
}

function calcSpeed() {
  let velocity = new Vector(initX.value(), 0, initZ.value());
  let a = radians(angle.value());
  let targetHeight = 2.6416;
  let shootingHeight = h.value();
  let x1 = ((width / 2 - x.value()) / scl) + 0.6096 + 0.381;
  
  let xv = x1 - velocity.x;
  
  turn = clamp(-Math.atan2(velocity.z, xv), -PI/3, PI/3 );

  let result = (targetHeight - shootingHeight);
  let chosenSpeed = 5;
  let error = result - eq(chosenSpeed, a, velocity, x1);
  let t = Date.now();
  let i = 0;
  while(Math.abs(error) > 0.1 && i < 1000) {
    i ++;
    
    if(error > 0) {
      chosenSpeed += chosenSpeed/2;
    } else {
      chosenSpeed -= chosenSpeed/2;
    }

    error = result - eq(chosenSpeed, a, velocity, x1);
  }
  
  
  a = Math.atan( ((Math.tan(-0.95) * x1) - (2 * (targetHeight-shootingHeight))) /  -x1 );
  //chosenSpeed = Math.sqrt( -(9.8 * x1 * x1 * (1 + (Math.tan(a) * Math.tan(a)) ) ) / (2 * (targetHeight - shootingHeight) - (2 * x1 * Math.tan(a) )));
  
  let vX = initX.value() + Math.cos(a) * Math.cos(turn) * chosenSpeed;
  let initDrag = 0.2 * 0.01456 * 1290 * Math.PI * vX * vX / 270;
  let time = x1 / (velocity.x + chosenSpeed * Math.cos(a) * Math.cos(turn));
  
  if(autoAngle.checked()) {
    if(x1 <= 2.15) {
	a = 1.36136;
    }
    angle.value( degrees(a) );
  }
  if (autoSpeed.checked()) {
    speed.value( chosenSpeed + (initDrag * time * time * 0.5 ));
  }
  
  t = Date.now() - t;
  
  text(round(time * 100) / 100 + " s", 10, 240);
  if(t > 2) {
    fill("red");
    //console.log(t);
  }
  text(t + " ms", 10, 210);
  fill("black");
  //+ Math.sqrt(Math.sqrt(x1 - 1)) * sin(a) * sin(a) * sin(a) * sin(a) + velocity.x/2 
}

function drawDrag() {
  let vX0 = initX.value() + cos(radians(angle.value())) * cos(turn) * speed.value();
  let vY0 = sin(radians(angle.value())) * speed.value();
  let vX = vX0;
  let vY = vY0;
  let pX = 0;
  let pY = 0;

  //DRAG VV

  stroke("red");
  beginShape();
  for (let t = 0; t < 10000; t++) {
    let dragX = 0.2 * 0.01456 * 1290 * Math.PI * vX * vX / 270;
    let dragY = 0.2 * 0.01456 * 1290 * Math.PI * vY * vY / 270;
    vertex(scl * pX, -scl * pY);
    pX += (vX * 0.001) / 2;
    pY += (vY * 0.001) / 2;
    vX -= dragX * 0.001;
    vY -= (9.8 + (vY > 0 ? dragY: -dragY)) * 0.001;
    pX += (vX * 0.001) / 2;
    pY += (vY * 0.001) / 2;
  }
  endShape();
}

// function reduce(speed, res, xDist, velo) {
//   //turn /= 2;
  
//   return speed;
// }

function eq(speed, angle, velo, xDist) {
  if(xDist == 0) {
    xDist = 0.01
  }
  
  //return speed * sin(angle) - 4.9;
  
	return (speed * xDist * Math.sin(angle) / (velo.x + (speed * Math.cos(turn) * Math.cos(angle) )) ) -  9.80665/2 * xDist * xDist / ((velo.x * velo.x) + (2*velo.x * speed * Math.cos(turn) * Math.cos(angle)) + (speed*Math.cos(turn)*Math.cos(angle)*speed*Math.cos(turn)*Math.cos(angle)) );
}

function Vector(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
