import { State, Group, TileSprite, Sprite, Particles, Timer } from 'phaser';
import Player from '../prefabs/Player';
import Enemy from '../prefabs/Enemy';
import NumberBox from '../prefabs/NumberBox';
import HealthBar from '../prefabs/HealthBar';

export class Game extends State {
    private spawnChance: number;
    private score: number;
    private bg: TileSprite;
    private player: Player;
    private healthBar: HealthBar;

    private bullets: Group;
    private enemies: Group;
    private enemyBullets: Group;
    private guiLayer: Group;
    private scoreField: NumberBox;
    private explosions: Particles.Arcade.Emitter;
    private waveTimer: Timer;
    public create() {
        this.spawnChance = .02;
        this.score = 0;
  
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
  
        this.bg = this.add.tileSprite(0, 0, 1024, 768, 'bg');
  
        this.bullets = this.add.group();
        this.enemyBullets = this.add.group();
  
        //add player
        this.player = new Player(this.game, 0, this.game.height / 2, this.bullets);
        this.game.add.existing(this.player);
        
        this.enemies = this.add.group();
        for (let i = 0; i < 5; i++) {
            const enemy = new Enemy(
                this.game,
                this.game.width + 100 + (Math.random() * 400),
                Math.random() * this.game.height,
                this.enemyBullets
            );
            this.enemies.add(enemy);
        }
  
        //add the explosions
        this.explosions = this.game.add.emitter(0, 0, 200);
        this.explosions.makeParticles('hexagon');
        this.explosions.setAlpha(1, .2, 2000);
  
        //add UI
        this.setupUI();
  
        //wave timer
        this.waveTimer = this.game.time.create(false);
        this.waveTimer.loop(20000, this.incrementWave, this);
        this.waveTimer.start();
    }
  
    public update() {
      this.bg.tilePosition.x -= .5;
  
      if (Math.random() < this.spawnChance) {
        const enemy = new Enemy(this.game, this.game.width + 100 + (Math.random() * 400), Math.random() * this.game.height, this.enemyBullets);
        this.enemies.add(enemy);
      }
  
      this.physics.arcade.overlap(this.enemies, this.bullets, this.damageEnemy, null, this);
      this.physics.arcade.overlap(this.player, this.enemies, this.damagePlayer, null, this);
      this.physics.arcade.overlap(this.player, this.enemyBullets, this.damagePlayer, null, this);
    }
  
    private incrementWave() {
      this.spawnChance *= 1.2;
    }
  
    private damagePlayer(playerRef: Player, enemyRef: Enemy) {
        playerRef.damage(1);
        this.healthBar.setValue(
            this.player.health / this.player.maxHealth
        );
        enemyRef.kill();
  
        if (this.player.health <= 0) {
          this.game.state.start('gameOver');
        }
    }
  
    private damageEnemy(enemy: Enemy, bullet: Sprite) {
        this.explosions.x = enemy.x;
        this.explosions.y = enemy.y;
  
        this.explosions.explode(2000, 4);
  
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
