class Player extends Phaser.GameObjects.Sprite {
  inventory: Array<Item>;
  health: number;
  maxHealth: number;
}

class Item extends Phaser.GameObjects.Sprite {
  // TODO: It doesn't matter so much what this looks
  // like for now, but eventually we'll need to update this
  description: string;
  value: number;
}
