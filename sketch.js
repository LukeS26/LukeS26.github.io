let angle, speed, x, h, initX;

//1 meter = 100 px;
let scl = 100;

function setup() {
  createCanvas(1000, 400);

  angle = createSlider(0, 45, 15, 0.1);
  aLabel = createDiv("Angle");
  aLabel.position(25, height + 25);
  angle.parent(aLabel);

  speed = createSlider(0, 10, 7, 0.1);
  sLabel = createDiv("Speed");
  sLabel.position(275, height + 25);
  speed.parent(sLabel);

  x = createSlider(0, 320, 420, 0.1);
  xLabel = createDiv("Dist");
  xLabel.position(25, height + 75);
  x.parent(xLabel);
  
  h = createSlider(0, 5, 4, 0.1);
  hLabel = createDiv("Height");
  hLabel.position(275, height + 75);
  h.parent(hLabel);
  
  initX = createSlider(-3.5, 3.5, 0, 0.1);
  ixLabel = createDiv("Initial Speed");
  ixLabel.position(25, height + 125);
  initX.parent(ixLabel);
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
  textSize(32);
  text(speed.value() + "m/s", 10, 30);
  text(angle.value() + "°", 10, 60);
  text((width / 2 - x.value()) / scl + "m", 10, 90);
  text(h.value() + "ft", 10, 120);
  text(initX.value() + "m/s", 10, 150);

  noFill();
  rect(width / 2, height - scl * 2.6416, scl * 1.2192, 25);
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
  return scl * ( (speed.value() * sin(radians(angle.value())) + initX.value()) * t);
}

function posY(t) {
  return (
    scl * (speed.value() * t * cos(radians(angle.value())) + 0.5 * -9.8 * t * t)
  );
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
