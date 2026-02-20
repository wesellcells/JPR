export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.left = false;
    this.right = false;
    this.jump = false;
    this.action = false;

    const w = scene.scale.width;
    const h = scene.scale.height;

    this.zoneLeft = scene.add.zone(0, h, w * 0.35, h).setOrigin(0, 1).setInteractive();
    this.zoneRight = scene.add.zone(w * 0.35, h, w * 0.35, h).setOrigin(0, 1).setInteractive();
    this.btnJump = scene.add.zone(w * 0.75, h, w * 0.12, h * 0.35).setOrigin(0, 1).setInteractive();
    this.btnAction = scene.add.zone(w * 0.87, h, w * 0.13, h * 0.35).setOrigin(0, 1).setInteractive();

    const setFlag = (name, val) => { this[name] = val; };

    const bindZone = (z, name) => z
      .on("pointerdown", () => setFlag(name, true))
      .on("pointerup", () => setFlag(name, false))
      .on("pointerout", () => setFlag(name, false))
      .on("pointerupoutside", () => setFlag(name, false));

    bindZone(this.zoneLeft, "left");
    bindZone(this.zoneRight, "right");
    bindZone(this.btnJump, "jump");
    bindZone(this.btnAction, "action");

    // Optional visual hints (very subtle)
    const alpha = 0.08;
    scene.add.rectangle(w*0.175, h*0.82, w*0.35, h*0.36).setScrollFactor(0).setDepth(999).setAlpha(alpha);
    scene.add.rectangle(w*0.525, h*0.82, w*0.35, h*0.36).setScrollFactor(0).setDepth(999).setAlpha(alpha);
    scene.add.rectangle(w*0.81, h*0.82, w*0.12, h*0.36).setScrollFactor(0).setDepth(999).setAlpha(alpha);
    scene.add.rectangle(w*0.935, h*0.82, w*0.13, h*0.36).setScrollFactor(0).setDepth(999).setAlpha(alpha);
  }

  destroy() {
    [this.zoneLeft, this.zoneRight, this.btnJump, this.btnAction].forEach(z => z?.destroy());
  }
}
