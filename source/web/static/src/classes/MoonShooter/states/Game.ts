import { State, Group, TileSprite, Sprite, Image, Particles, Timer } from 'phaser';
import Player from '../prefabs/Player';
import Enemy from '../prefabs/Enemy';
import NumberBox from '../prefabs/NumberBox';
import HealthBar from '../prefabs/HealthBar';
import PowerUp from '../prefabs/PowerUp';
import { times } from 'lodash';

export class Game extends State {
    private spawnChance: number;
    private score: number;
    private space: TileSprite;
    private moon: Image;
    private player: Player;
    private healthBar: HealthBar;

    private bullets: Group;
    private enemies: Group;
    private powerUps: Group;
    private enemyBullets: Group;
    private guiLayer: Group;
    private scoreField: NumberBox;
    private explosions: Particles.Arcade.Emitter;
    private waveTimer: Timer;
    private powerUpTimer: Timer;

    public create() {
        this.spawnChance = .02;
        this.score = 0;
        this.space = this.add.tileSprite(0, 0, 1440, this.game.height, 'bg');
        this.moon = this.add.image(
            this.game.width / 5,
            this.game.height * (7/8),
            'moon'
        );
  
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.bullets = this.add.group();
        this.enemyBullets = this.add.group();
  
        // Add the player
        this.player = new Player(this.game, 0, this.game.height / 2);
        this.game.add.existing(this.player);
        
        this.enemies = this.add.group();
        times(5, () => {
            const enemy = new Enemy(
                this.game,
                this.game.width + 100 + (Math.random() * 400),
                Math.random() * this.game.height,
                this.enemyBullets
            );
            this.enemies.add(enemy);
        });
  
        // Add the explosions FX
        this.explosions = this.game.add.emitter(0, 0, 240);
        this.explosions.makeParticles('hexagon');
        this.explosions.setAlpha(1, .2, 2000);
  
        this.setupUI();
  
        // Enemy wave timer
        this.waveTimer = this.game.time.create(false);
        this.waveTimer.loop(20 * Timer.SECOND, this.incrementWave, this);
        this.waveTimer.start();

        // Power up & timer
        this.powerUps = this.add.group();
        this.powerUpTimer = this.game.time.create(false);
        this.powerUpTimer.loop(
            20 * Timer.SECOND,
            () => {
                const powerUp = new PowerUp(
                    this.game,
                    this.game.width,
                    Math.random() * this.game.height
                );
                this.powerUps.add(powerUp);
            },
            this
        );
        this.powerUpTimer.start();
    }
  
    public update() {
      this.space.tilePosition.x -= .5;
      this.moon.x -= .05;
  
      if (Math.random() < this.spawnChance) {
        const enemy = new Enemy(
            this.game,
            this.game.width + 100 + (Math.random() * 400),
            Math.random() * this.game.height,
            this.enemyBullets
        );
        this.enemies.add(enemy);
      }
  
      this.physics.arcade.overlap(this.enemies, this.player.weapon.bullets, this.damageEnemy, null, this);
      this.physics.arcade.overlap(this.player, this.enemies, this.damagePlayer, null, this);
      this.physics.arcade.overlap(this.player, this.enemyBullets, this.damagePlayer, null, this);
      this.physics.arcade.overlap(
          this.player,
          this.powerUps,
          (player: Player, powerUp: PowerUp) => {
            powerUp.kill();
            const timer: Timer = this.game.time.create(false);
            const tempFireRate = this.player.weapon.fireRate;
            const tempBulletVariance = this.player.weapon.bulletAngleVariance;
            timer.add(
                4200,
                () => {
                    player.weapon.fireRate = tempFireRate;
                    player.weapon.bulletAngleVariance = tempBulletVariance;
                    timer.destroy();
                },
                this
            );
            timer.start();
            player.weapon.fireRate = tempFireRate / 4;
            player.weapon.bulletAngleVariance = tempBulletVariance * 3
          },
          null,
          this
      );
    }
  
    private incrementWave() {
      this.spawnChance *= 1.2;
    }
  
    private damagePlayer(player: Player, enemy: Enemy) {
        this.explosions.x = player.x + 100;
        this.explosions.y = player.y;
        this.explosions.explode(2000, 5);
        player.damage(1);
        this.healthBar.setValue(
            this.player.health / this.player.maxHealth
        );
        enemy.kill();
  
        if (this.player.health <= 0) {
          this.game.state.start('gameOver');
        }
    }
  
    private damageEnemy(enemy: Enemy, bullet: Sprite) {
        this.explosions.x = enemy.x;
        this.explosions.y = enemy.y;
        this.explosions.explode(2000, 3);
        
        enemy.kill();
        bullet.kill();
  
        this.score++;
        this.scoreField.setValue(this.score);
    }

    private setupUI() {
        this.guiLayer = this.add.group();
    
        this.scoreField = new NumberBox(this.game, 'circle', 0);
        this.scoreField.height = 56;
        this.scoreField.width = 56;
        this.guiLayer.add(this.scoreField);
    
        this.healthBar = new HealthBar(
            this.game,
            62,
            8,
            'health_bar',
            'health_holder'
        );
        this.guiLayer.add(this.healthBar);
    }
}

export default Game;
