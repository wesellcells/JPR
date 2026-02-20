export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(this.width * 0.6, this.height * 0.9, true);

    this.speed = 260;
    this.jumpSpeed = 520;

    this._jumpWasDown = false;
    this._actionWasDown = false;
  }

  update(input) {
    const left = input.left;
    const right = input.right;

    if (left && !right) this.setVelocityX(-this.speed);
    else if (right && !left) this.setVelocityX(this.speed);
    else this.setVelocityX(0);

    const jumpDown = input.jump;
    const onFloor = this.body.blocked.down;

    if (jumpDown && !this._jumpWasDown && onFloor) {
      this.setVelocityY(-this.jumpSpeed);
      if (this.scene.sound) this.scene.sound.play("jump", { volume: 0.5 });
    }
    this._jumpWasDown = jumpDown;

    const actionDown = input.action;
    if (actionDown && !this._actionWasDown) {
      this.emit("action");
    }
    this._actionWasDown = actionDown;
  }
}
