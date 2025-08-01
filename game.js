const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔊 Audio
const coinSound = document.getElementById("coinSound");
const fuelSound = document.getElementById("fuelSound");
const crashSound = document.getElementById("crashSound");

// 🚗 Car State
let car = {
  x: canvas.width / 2,
  y: canvas.height - 80,
  width: 40,
  height: 20,
  angle: 0,
  speed: 0,
  maxSpeed: 5,
  accel: 0.2,
  friction: 0.05
};

// 🧠 Game State
let score = 0;
let fuel = 100;
let coins = [];
let fuels = [];
let obstacles = [];
let nitroZones = [];

// 🎯 Populate Game Items
for (let i = 0; i < 6; i++) {
  obstacles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    width: 40,
    height: 20
  });

  coins.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    size: 15
  });

  fuels.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    size: 20
  });

  nitroZones.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    width: 60,
    height: 60
  });
}

document.addEventListener("keydown", handleKeys);

function handleKeys(e) {
  if (e.key === "ArrowUp") car.speed += car.accel;
  if (e.key === "ArrowDown") car.speed -= car.accel;
  if (e.key === "ArrowLeft") car.angle -= 0.1;
  if (e.key === "ArrowRight") car.angle += 0.1;
}

function updateCar() {
  car.speed = Math.max(-car.maxSpeed, Math.min(car.speed, car.maxSpeed));
  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;
  car.speed *= (1 - car.friction);

  // ⛽ Fuel Usage
  fuel -= 0.05;
  fuel = Math.max(0, fuel);

  // 🚧 Collisions
  obstacles.forEach(obs => {
    if (isColliding(car.x, car.y, car.width, car.height, obs.x, obs.y, obs.width, obs.height)) {
      crashSound.play();
      score -= 5;
      fuel -= 5;
    }
  });

  // 🪙 Coin Collection
  coins = coins.filter(coin => {
    if (isColliding(car.x, car.y, car.width, car.height, coin.x, coin.y, coin.size, coin.size)) {
      coinSound.play();
      score += 10;
      return false;
    }
    return true;
  });

  // ⛽ Fuel Collection
  fuels = fuels.filter(pickup => {
    if (isColliding(car.x, car.y, car.width, car.height, pickup.x, pickup.y, pickup.size, pickup.size)) {
      fuelSound.play();
      fuel = Math.min(100, fuel + 25);
      return false;
    }
    return true;
  });

  // 🚀 Nitro Zones
  nitroZones.forEach(zone => {
    if (isColliding(car.x, car.y, car.width, car.height, zone.x, zone.y, zone.width, zone.height)) {
      car.speed = Math.min(car.speed + 1, car.maxSpeed + 2);
      score += 2;
    }
  });
}

function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  ctx.fillStyle = "red";
  ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
  ctx.restore();
}

function drawObstacles() {
  ctx.fillStyle = "gray";
  obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
}

function drawCoins() {
  ctx.fillStyle = "gold";
  coins.forEach(c => ctx.beginPath(), ctx.arc(c.x, c.y, c.size, 0, 2 * Math.PI), ctx.fill());
}

function drawFuels() {
  ctx.fillStyle = "green";
  fuels.forEach(f => ctx.beginPath(), ctx.arc(f.x, f.y, f.size, 0, 2 * Math.PI), ctx.fill());
}

function drawNitroZones() {
  ctx.fillStyle = "blue";
  nitroZones.forEach(z => ctx.fillRect(z.x, z.y, z.width, z.height));
}

function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, 20, 30);
  ctx.fillText(`Fuel: ${Math.floor(fuel)}%`, 20, 55);

  if (fuel <= 0) {
    ctx.fillStyle = "red";
    ctx.font = "32px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 90, canvas.height / 2);
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateCar();
  drawObstacles();
  drawCoins();
  drawFuels();
  drawNitroZones();
  drawCar();
  drawHUD();
  if (fuel > 0) score += 0.1;
  requestAnimationFrame(gameLoop);
}
gameLoop();
