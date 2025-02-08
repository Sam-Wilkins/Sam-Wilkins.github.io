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


let restartButton;

function create() {
  // ... other create code ...

  // Create the restart button
  restartButton = this.add.dom(400, 300, 'button', 'width: 200px; height: 50px; font-size: 20px;', 'Restart Game');

  restartButton.addListener('click');
  restartButton.on('click', () => {
    this.scene.restart(); // Restart the current scene
    restartButton.setVisible(false); // Hide the button after restart
  });

  // Example of triggering the restart button (could be called when the player dies, etc.)
  // restartButton.setVisible(true);
}

function endGame() {
  // Show the restart button when the game ends
  restartButton.setVisible(true);
}






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





// Mobile control flags
let mobileControl = {
  up: false,
  down: false,
  left: false,
  right: false,
  shoot: false
};

// Create a new Phaser game
const game = new Phaser.Game(config);

function preload() {
  // Load assets (replace these URLs with your own pixel art assets if available)
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png'); // placeholder
  this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/blue_ball.png');    // placeholder
  this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/space-baddie.png');    // placeholder
  this.load.image('weaponDrop', 'https://labs.phaser.io/assets/sprites/star.png');       // placeholder for weapon drop
}

function create() {
  // Create the player near the bottom center of the screen
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

  // Setup collisions
  this.physics.add.overlap(bullets, enemies, bulletHitEnemy, null, this);
  this.physics.add.overlap(player, weaponDrops, collectWeapon, null, this);
  this.physics.add.overlap(player, enemies, playerHit, null, this);
}

function update(time, delta) {
  // Handle player movement via keyboard and mobile controls
  let vx = 0;
  let vy = 0;
  
  if (cursors.left.isDown || mobileControl.left) {
    vx = -200;
  } else if (cursors.right.isDown || mobileControl.right) {
    vx = 200;
  }
  
  if (cursors.up.isDown || mobileControl.up) {
    vy = -200;
  } else if (cursors.down.isDown || mobileControl.down) {
    vy = 200;
  }
  
  player.setVelocity(vx, vy);

  // Handle shooting: keyboard (space) or mobile shoot button
  if ((spaceBar.isDown || mobileControl.shoot) && time > lastShotTime + currentWeapon.fireRate) {
    shootBullet.call(this);
    lastShotTime = time;
  }

  // Cleanup off-screen objects
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
  // For the minigun, add a slight random offset to simulate bullet spread
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
  // Randomly assign a weapon type from our list
  const weaponKeys = Object.keys(weapons);
  drop.weaponType = weaponKeys[Phaser.Math.Between(0, weaponKeys.length - 1)];
}

function collectWeapon(player, drop) {
  // Update the current weapon when a drop is collected
  currentWeapon = weapons[drop.weaponType];
  updateWeaponDisplay();
  drop.destroy();
}

function updateWeaponDisplay() {
  // Update the on-screen display with the current weapon
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
  // End the game if an enemy touches the player
  this.physics.pause();
  player.setTint(0xff0000);
  scoreText.setText('Game Over! Final Score: ' + score);
}

// --- Mobile Control Event Listeners ---
// For touch events:
document.getElementById('btn-up').addEventListener('touchstart', () => { mobileControl.up = true; });
document.getElementById('btn-up').addEventListener('touchend', () => { mobileControl.up = false; });

document.getElementById('btn-down').addEventListener('touchstart', () => { mobileControl.down = true; });
document.getElementById('btn-down').addEventListener('touchend', () => { mobileControl.down = false; });

document.getElementById('btn-left').addEventListener('touchstart', () => { mobileControl.left = true; });
document.getElementById('btn-left').addEventListener('touchend', () => { mobileControl.left = false; });

document.getElementById('btn-right').addEventListener('touchstart', () => { mobileControl.right = true; });
document.getElementById('btn-right').addEventListener('touchend', () => { mobileControl.right = false; });

document.getElementById('btn-shoot').addEventListener('touchstart', () => { mobileControl.shoot = true; });
document.getElementById('btn-shoot').addEventListener('touchend', () => { mobileControl.shoot = false; });

// Also add mouse events for testing on desktops:
document.getElementById('btn-up').addEventListener('mousedown', () => { mobileControl.up = true; });
document.getElementById('btn-up').addEventListener('mouseup', () => { mobileControl.up = false; });
document.getElementById('btn-down').addEventListener('mousedown', () => { mobileControl.down = true; });
document.getElementById('btn-down').addEventListener('mouseup', () => { mobileControl.down = false; });
document.getElementById('btn-left').addEventListener('mousedown', () => { mobileControl.left = true; });
document.getElementById('btn-left').addEventListener('mouseup', () => { mobileControl.left = false; });
document.getElementById('btn-right').addEventListener('mousedown', () => { mobileControl.right = true; });
document.getElementById('btn-right').addEventListener('mouseup', () => { mobileControl.right = false; });
document.getElementById('btn-shoot').addEventListener('mousedown', () => { mobileControl.shoot = true; });
document.getElementById('btn-shoot').addEventListener('mouseup', () => { mobileControl.shoot = false; });