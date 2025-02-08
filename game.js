const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
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
let bullets;
let enemyGroup;
let score = 0;
let gameOver = false;

const game = new Phaser.Game(config);

function preload() {
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
  this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullet.png