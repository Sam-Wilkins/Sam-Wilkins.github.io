// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let cursors;
let spaceBar;
let bullets;
let enemies;
let weaponDrops;
let lastShotTime = 0;
let currentWeapon;
let score = 0;
let scoreText;

// Define our weapons
const weapons = {
  pistol: { name: 'Pistol', fireRate: 500, bulletSpeed: 400 },
  minigun: { name: 'Minigun', fireRate: 100, bulletSpeed: 600 }
};

// Create a new Phaser game
const game = new Phaser.Game(config);

function preload() {
  // Load assets (replace these URLs with your own pixel art assets if you have them)
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png'); // placeholder
  this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/blue_ball.png');    // placeholder
  this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/space-baddie.png');    // placeholder
  this.load.image('weaponDrop', 'https://labs.phaser.io/assets/sprites/star.png');       // placeholder for weapon drop
}

function create() {
  // Create the player in the middle-bottom of the screen
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // Set the default weapon to pistol
  currentWeapon = weapons.pistol;
  updateWeaponDisplay();

  // Create groups for bullets, enemies, and weapon drops
  bullets = this.physics.add.group();
  enemies = this.physics.add.group();
  weaponDrops = this.physics.add.group();

  // Setup keyboard input
  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Display the score
  scoreText = this.add.text(10, 570, 'Score: 0', { fontSize: '20px', fill: '#fff' });

  // Spawn enemies every second
  this.time.addEvent({
    delay: 1000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  // Spawn a weapon drop every 5 seconds
  this.time.addEvent({
    delay: 5000,
    callback: spawnWeaponDrop,
    callbackScope: this,
    loop: true
  });

  // Setup collisions: bullet hits enemy
  this.physics.add.overlap(bullets, enemies, bulletHitEnemy, null, this);
  // Collision: player collects weapon drop
  this.physics.add.overlap(player, weaponDrops, collectWeapon, null, this);
  // Collision: enemy hits player (ends game)
  this.physics.add.overlap(player, enemies, playerHit, null, this);
}

function update(time, delta) {
  // Player movement
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }
  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  } else {
    player.setVelocityY(0);
  }

  // Shooting: Check if space is pressed and if enough time has passed based on the current weapon's fire rate
  if (spaceBar.isDown && time > lastShotTime + currentWeapon.fireRate) {
    shootBullet.call(this);
    lastShotTime = time;
  }

  // Cleanup off-screen bullets, enemies, and drops
  bullets.children.each(function(bullet) {
    if (bullet.y < 0) bullet.destroy();
  }, this);
  enemies.children.each(function(enemy) {
    if (enemy.y > 600) enemy.destroy();
  }, this);
  weaponDrops.children.each(function(drop) {
    if (drop.y > 600) drop.destroy();
  }, this);
}

function shootBullet() {
  // For the minigun, add a slight random offset to simulate spread
  let offsetX = 0;
  if (currentWeapon.name === 'Minigun') {
    offsetX = Phaser.Math.Between(-10, 10);
  }
  let bullet = bullets.create(player.x + offsetX, player.y - 20, 'bullet');
  bullet.setVelocityY(-currentWeapon.bulletSpeed);
}

function spawnEnemy() {
  // Spawn enemy at a random x position at the top
  let enemy = enemies.create(Phaser.Math.Between(50, 750), 0, 'enemy');
  enemy.setVelocityY(Phaser.Math.Between(50, 150));
}

function spawnWeaponDrop() {
  // Spawn a weapon drop at a random x position at the top
  let drop = weaponDrops.create(Phaser.Math.Between(50, 750), 0, 'weaponDrop');
  drop.setVelocityY(100);
  // Randomly select a weapon type from our weapons list
  const weaponKeys = Object.keys(weapons);
  drop.weaponType = weaponKeys[Phaser.Math.Between(0, weaponKeys.length - 1)];
}

function collectWeapon(player, drop) {
  // When the player collects a weapon drop, update the current weapon
  currentWeapon = weapons[drop.weaponType];
  updateWeaponDisplay();
  drop.destroy();
}

function updateWeaponDisplay() {
  // Update the overlay that shows the current weapon
  const display = document.getElementById('weaponDisplay');
  if (display) {
    display.innerText = 'Weapon: ' + currentWeapon.name;
  }
}

function bulletHitEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();
  score += 10;
  scoreText.setText('Score: ' + score);
}

function playerHit(player, enemy) {
  // Game over: stop physics and show final score
  this.physics.pause();
  player.setTint(0xff0000);
  scoreText.setText('Game Over! Final Score: ' + score);
}