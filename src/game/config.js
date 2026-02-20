import BootScene from "./scenes/BootScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import LevelScene from "./scenes/LevelScene.js";

export const gameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scene: [BootScene, PreloadScene, LevelScene]
};
