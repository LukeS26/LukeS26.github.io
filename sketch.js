let angle, speed, x, h, initX, initZ;
let turn = 0;
//1 meter = 100 px;
let scl = 100;

function setup() {
  createCanvas(1000, 800);

  angle = createSlider(5, 45, 15, 0.1);
  aLabel = createDiv("Angle");
  aLabel.position(25, height + 25);
  angle.parent(aLabel);

  speed = createSlider(0, 13, 7, 0.01);
  sLabel = createDiv("Speed");
  sLabel.position(275, height + 25);
  speed.parent(sLabel);

  x = createSlider(0, 320, 420, 10);
  xLabel = createDiv("Dist");
  xLabel.position(25, height + 75);
  x.parent(xLabel);
  
  h = createSlider(0, 5, 3.1, 0.1);
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
  text((width / 2 - x.value()) / scl + "m", 10, 90);
  text(round(h.value() * cos(radians(angle.value())) * 10)/10 + "ft", 10, 120);
  text(initX.value() + "m/s", 10, 150);
  text(initZ.value() + "m/s", 10, 180);


  noFill();
  rect(width / 2, height - scl * 2.6416, scl * 1.2192, 25);
  circle(width / 2 + scl*0.6096, height - scl * 2.6416, 10);
  push();
  translate(x.value(), height);
  rotate(radians(angle.value()));
  rect(0, 0, 50, -scl * h.value() * 0.3048);
  pop();
  push();
  translate(
    cos(radians(90 - angle.value())) * (scl * h.value() * 0.3048) + x.value(),
    height - sin(radians(90 - angle.value())) * scl * h.value() * 0.3048
  );
  beginShape();
  for (let t = 0; t < 1000; t++) {
    vertex(posX(t / 100), -posY(t / 100));
  }
  endShape();

  //drawDrag();

  pop();
}

function posX(t) {
  return scl * ( (speed.value() * cos(turn) * sin(radians(angle.value())) + initX.value()) * t);
}

function posZ(t) {
  return scl * ( (speed.value() * sin(turn) * sin(radians(angle.value())) + initZ.value()) * t);
}

function posY(t) {
  return (
    scl * (speed.value() * t * cos(radians(angle.value())) + 0.5 * -9.8 * t * t)
  );
}

function calcSpeed() {
  let velocity = new Vector(initX.value(), 0, initZ.value());
  let a = (Math.PI / 2) - radians(angle.value()); // 15 degrees
  let targetHeight = 2.6416;
  let shootingHeight = h.value() * sin(a) * 0.3048;
  let x1 = ((width / 2 - x.value()) / scl) + (0.6096) - (h.value() * 0.3048 * cos(a));
  
  let xv = x1 - velocity.x;
  
  turn = clamp(-Math.atan2(velocity.z, xv), -PI/3, PI/3 );

  let result = (targetHeight - shootingHeight);
  let chosenSpeed = 5;
  let error = result - eq(chosenSpeed, a, velocity, x1);
  let t = Date.now();
  while(Math.abs(error) > 0.01) {
    if(error > 0) {
      chosenSpeed += chosenSpeed/2;
    } else {
      chosenSpeed -= chosenSpeed/2;
    }

    error = result - eq(chosenSpeed, a, velocity, x1);
    //System.out.println(error + ", " + chosenSpeed);
  }

  t = Date.now() - t;
  
  speed.value( chosenSpeed );
}

function drawDrag() {
  let vX0 = sin(radians(angle.value())) * speed.value();
  let vY0 = cos(radians(angle.value())) * speed.value();
  let vX = vX0;
  let vY = vY0;
  let pX = 0;
  let pY = 0;

  //DRAG VV

  stroke("red");
  beginShape();
  for (let t = 0; t < 100; t++) {
    let drag = 0.05; //test
    vertex(scl * pX, -scl * pY);
    pX += (vX * 0.1) / 2;
    pY += (vY * 0.1) / 2;
    vX -= drag * vX * vX * 0.1;
    vY -= (9.8 + (vY > 0 ? drag * vY * vY : -drag * vY * vY)) * 0.1;
    pX += (vX * 0.1) / 2;
    pY += (vY * 0.1) / 2;
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
  
	return (speed * xDist * Math.sin(angle) / (velo.x + (speed * Math.cos(turn) * Math.cos(angle) )) ) -  9.80665/2 * xDist * xDist / ((velo.x * velo.x) + (2*velo.x * speed * Math.cos(turn) * Math.cos(angle)) + (speed*Math.cos(turn)*Math.cos(angle)*speed*Math.cos(turn)*Math.cos(angle)) );
}

function Vector(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
