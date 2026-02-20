import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";
import TouchControls from "../ui/TouchControls.js";
import { loadSave, writeSave, clearSave } from "../systems/SaveSystem.js";

export default class LevelScene extends Phaser.Scene {
  constructor() { super("LevelScene"); }

  async init(data) {
    this.levelKey = data.levelKey ?? "level1";
    this.save = (await loadSave()) ?? { levelKey: this.levelKey, checkpoint: null, pickups: {}, gates: {} };
  }

  create() {
    const map = this.make.tilemap({ key: this.levelKey });
    const tileset = map.addTilesetImage("tiles", "tiles");
    const ground = map.createLayer("Ground", tileset, 0, 0);
    ground.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const objs = map.getObjectLayer("Objects")?.objects ?? [];
    const findObj = (name) => objs.find(o => o.name === name);

    const spawn = findObj("PlayerSpawn");
    const checkpointObj = findObj("Checkpoint");
    const gateObj = findObj("Gate");     // "door" requiring key
    const keyObj = findObj("Key");       // 1 key for the slice
    const enemySpawn = findObj("EnemySpawn");

    const spawnX = this.save.checkpoint?.x ?? spawn?.x ?? 80;
    const spawnY = this.save.checkpoint?.y ?? spawn?.y ?? 80;

    this.player = new Player(this, spawnX, spawnY);
    this.physics.add.collider(this.player, ground);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.touch = new TouchControls(this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Static objects
    this.checkpoint = this.physics.add.staticImage(
      checkpointObj?.x ?? 320,
      checkpointObj?.y ?? 240,
      "checkpoint"
    ).setOrigin(0, 1);

    // "Key" and "Gate" to simulate platform + tools/backtracking
    this.keyItem = this.physics.add.staticImage(
      keyObj?.x ?? 740,
      keyObj?.y ?? 240,
      "pickup"
    ).setOrigin(0, 1);
    this.keyItem.setData("id", "key1");

    this.gate = this.physics.add.staticImage(
      gateObj?.x ?? 860,
      gateObj?.y ?? 240,
      "checkpoint"
    ).setOrigin(0, 1);
    this.gate.setScale(1.0, 1.4); // look like a door

    // Pickups group from Objects layer
    this.pickups = this.physics.add.staticGroup();
    for (const o of objs.filter(x => x.name === "Pickup")) {
      const id = o.id ?? `${o.x}_${o.y}`;
      if (this.save.pickups?.[id]) continue;
      const p = this.pickups.create(o.x, o.y, "pickup");
      p.setOrigin(0, 1);
      p.setData("id", id);
    }

    // Apply saved state for key/gate
    if (this.save.gates?.gate1Opened) {
      this.gate.disableBody(true, true);
    }
    if (this.save.pickups?.key1Collected) {
      this.keyItem.disableBody(true, true);
    }

    // Enemy
    this.enemy = new Enemy(this, enemySpawn?.x ?? 520, enemySpawn?.y ?? 220);
    this.physics.add.collider(this.enemy, ground);

    // Overlaps
    this.physics.add.overlap(this.player, this.checkpoint, async () => {
      const cx = Math.round(this.checkpoint.x);
      const cy = Math.round(this.checkpoint.y);
      const same = this.save.checkpoint && this.save.checkpoint.x === cx && this.save.checkpoint.y === cy;
      if (!same) {
        this.save.checkpoint = { x: cx, y: cy };
        await writeSave(this.save);
        this._toast("Checkpoint salvato");
        this._updateHud();
      }
    });

    this.physics.add.overlap(this.player, this.pickups, async (_, item) => {
      const id = item.getData("id");
      item.destroy();
      this.save.pickups[id] = true;
      if (this.sound) this.sound.play("pickupSfx", { volume: 0.6 });
      await writeSave(this.save);
      this._updateHud();
    });

    this.physics.add.overlap(this.player, this.keyItem, async () => {
      if (this.save.pickups.key1Collected) return;
      this.save.pickups.key1Collected = true;
      this.keyItem.disableBody(true, true);
      if (this.sound) this.sound.play("pickupSfx", { volume: 0.6 });
      await writeSave(this.save);
      this._toast("Hai raccolto la chiave");
      this._updateHud();
    });

    // Player touching the enemy -> respawn
    this.physics.add.overlap(this.player, this.enemy, () => this._respawn());

    // Gate interaction: press action while overlapping
    this.gateZone = this.add.zone(this.gate.x + 12, this.gate.y - 40, 60, 120);
    this.physics.add.existing(this.gateZone, true);
    this.playerOverGate = false;
    this.physics.add.overlap(this.player, this.gateZone, () => { this.playerOverGate = true; }, null, this);
    this.physics.add.overlap(this.gateZone, this.player, () => {}, null, this);

    this.player.on("action", async () => {
      if (!this.playerOverGate) return;
      if (this.save.gates?.gate1Opened) return;

      if (this.save.pickups?.key1Collected) {
        this.save.gates.gate1Opened = true;
        this.gate.disableBody(true, true);
        await writeSave(this.save);
        this._toast("Porta sbloccata");
        this._updateHud();
      } else {
        this._toast("Serve una chiave");
      }
    });

    // HUD
    this.hud = this.add.text(10, 10, "", { fontFamily: "sans-serif", fontSize: "18px", color: "#ffffff" })
      .setScrollFactor(0).setDepth(1000);

    this.toast = this.add.text(10, 70, "", { fontFamily: "sans-serif", fontSize: "16px", color: "#ffffff" })
      .setScrollFactor(0).setDepth(1000);

    this._updateHud();

    // Mobile audio unlock
    this.input.once("pointerdown", () => {
      if (this.sound && this.sound.locked) this.sound.unlock();
    });

    // Reset save helper (R)
    this.keyReset.on("down", async () => {
      await clearSave();
      this.scene.restart({ levelKey: this.levelKey });
    });
  }

  update() {
    const input = this._readInput();
    this.player.update(input);
    this.enemy.update();

    // reset overlap flag (simple approach)
    this.playerOverGate = false;
  }

  _readInput() {
    const left = this.touch.left || this.cursors.left.isDown;
    const right = this.touch.right || this.cursors.right.isDown;
    const jump = this.touch.jump || this.cursors.up.isDown;
    const action = this.touch.action || this.keyAction.isDown;
    return { left, right, jump, action };
  }

  _updateHud() {
    const collected = Object.keys(this.save.pickups || {}).length;
    const cx = this.save.checkpoint ? `${this.save.checkpoint.x},${this.save.checkpoint.y}` : "—";
    const key = this.save.pickups?.key1Collected ? "sì" : "no";
    const gate = this.save.gates?.gate1Opened ? "aperta" : "chiusa";
    this.hud.setText(`Pickups: ${collected}\nCheckpoint: ${cx}\nChiave: ${key} | Porta: ${gate}\n[Azione=SPACE]  [Reset save=R]`);
  }

  _toast(msg) {
    this.toast.setText(msg);
    this.time.delayedCall(1300, () => this.toast.setText(""));
  }

  _respawn() {
    const x = this.save.checkpoint?.x ?? 80;
    const y = this.save.checkpoint?.y ?? 80;
    this.player.setVelocity(0, 0);
    this.player.setPosition(x, y);
    this.cameras.main.flash(120);
  }
}
