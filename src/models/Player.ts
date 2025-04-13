export class Player {
  inventory: Item[];
  health: number;
  maxHealth: number;

  constructor(health: number, maxHealth: number, inventory: Item[]) {
    this.health = health;
    this.maxHealth = maxHealth;
    this.inventory = inventory;
  }

  // lose 1 health, return true if dead
  harm(): Boolean {
    this.health -= 1;
    if (this.health <= 0) {
      return true;
    }
    return false;
  }

  heal() {
    if (this.health < this.maxHealth) {
      this.health += 1;
    }
  }
}

class Item extends Phaser.GameObjects.Sprite {
  // TODO: It doesn't matter so much what this looks
  // like for now, but eventually we'll need to update this
  description: string;
  value: number;
}
