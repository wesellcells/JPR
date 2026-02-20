export default class PreloadScene extends Phaser.Scene {
  constructor() { super("PreloadScene"); }

  preload() {
    this.load.image("tiles", "/assets/tiles/tiles.png");
    this.load.tilemapTiledJSON("level1", "/assets/tiles/level1.json");

    this.load.image("player", "/assets/sprites/player.png");
    this.load.image("enemy", "/assets/sprites/enemy.png");
    this.load.image("pickup", "/assets/sprites/pickup.png");
    this.load.image("checkpoint", "/assets/sprites/checkpoint.png");

    this.load.audio("jump", "/assets/audio/jump.wav");
    this.load.audio("pickupSfx", "/assets/audio/pickup.wav");

    // simple loading text
    const w = this.scale.width, h = this.scale.height;
    this.txt = this.add.text(w/2, h/2, "Loading...", { fontFamily: "sans-serif", fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);
  }

  create() {
    this.scene.start("LevelScene", { levelKey: "level1" });
  }
}
