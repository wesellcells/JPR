export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);

    this.speed = 70;
    this.dir = 1;
    this.patrolMinX = x - 120;
    this.patrolMaxX = x + 120;
  }

  update() {
    const dt = this.scene.game.loop.delta / 1000;
    this.x += this.speed * this.dir * dt;

    if (this.x <= this.patrolMinX) this.dir = 1;
    if (this.x >= this.patrolMaxX) this.dir = -1;
  }
}
