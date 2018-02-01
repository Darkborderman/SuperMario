const Player = {
    mario: {
        spriteName: 'mario',
        picture: {
            width: 32,
            height: 56,
            src: '/game/assets/players/images/mariox32.png'
        },
        sound: {
            die: {
                name: 'marioDie',
                src: '/game/assets/players/sounds/die.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Player.mario.sound.die.name);
                    return () => {
                        sfx.play();
                    };
                }
            },
            hit: {
                name: 'marioHit',
                src: '/game/assets/players/sounds/hit.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Player.mario.sound.hit.name);
                    return () => {
                        sfx.play();
                    };
                }
            }
        },
        animation: {
            left: [ 0, 1, 2, 3 ],
            leftIdle: [ 0 ],
            right: [ 4, 5, 6, 7 ],
            rightIdle: [ 4 ],
            die: [ 8 ],
            frameRate: 10
        },
        velocity: {
            horizontal: {
                move: 200,
                idle: 0.1
            },
            vertical: {
                bounce: -200,
                jump: -600,
                gravity: 20   
            }
        },
        width: 32,
        height: 56,
        destroy: function(character)
        {
            if(character.dieyet == false)
            {
                Game.map.sound.stop();
                character.type.sound.die.play();
                character.dieyet = true;
                character.animations.stop();
                character.animations.play('die');
                character.body.enable = false;
                character.immovable = true;
            }
            setTimeout(
                function()
                {
                    Player.mario.respawn(character);
                },
                3000
            );
        },
        respawn: function(character)
        {
            Game.map.sound.loopFull();
            character.body.velocity.x = 0;
            character.body.velocity.y = 0;
            character.x = character.spawn.x;
            character.y = character.spawn.y;
            character.body.enable = true;
            character.immovable = false;
            character.dieyet = false;
            /*
            for(let itemType in Item)
            {
                character.status[itemType] = 0;
            }
            */
        }
    },
    luigi: {
        spriteName: 'luigi',
        picture: {
            width: 32,
            height: 56,
            src: '/game/assets/players/images/luigix32.png'
        },
        sound: {
            die: {
                name: 'luigiDie',
                src: '/game/assets/players/sounds/die.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Player.luigi.sound.die.name);
                    return () => {
                        sfx.play();
                    };
                }
            },
            hit: {
                name: 'luigiHit',
                src: '/game/assets/players/sounds/hit.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Player.luigi.sound.hit.name);
                    return () => {
                        sfx.play();
                    };
                }
            }
        },
        animation: {
            left: [ 0, 1, 2, 3 ],
            leftIdle: [ 0 ],
            right: [ 4, 5, 6, 7 ],
            rightIdle: [ 4 ],
            die: [ 8 ],
            frameRate: 10
        },
        velocity: {
            horizontal: {
                move: 200,
                idle: 0.1
            },
            vertical: {
                bounce: -200,
                jump: -600,
                gravity: 20   
            }
        },
        width: 32,
        height: 56,
        destroy: function(character)
        {
            if(character.dieyet == false)
            {
                character.dieyet = true;
                character.animations.stop();
                character.animations.play('die');
                character.body.enable = false;
                character.immovable = true;
            }
        },
        respawn: function(character)
        {
            Game.map.sound.loopFull();
            character.body.velocity.x = 0;
            character.body.velocity.y = 0;
            character.x = character.spawn.x;
            character.y = character.spawn.y;
            character.body.enable = true;
            character.immovable = false;
            character.dieyet = false;
            /*
            for(let itemType in Item)
            {
                character.status[itemType] = 0;
            }
            */
        }
    }
};

function PlayerSetup
(
    playerName,
    playerType, 
    x=0, 
    y=0, 
    vx=0,
    vy=0,
    sx=Map.structure[0].start[0].x,
    sy=Map.structure[0].start[0].y,
    status=null
)
{

    // add character sprite
    let character = Game.engine.add.sprite(
        x,
        y,
        playerType.spriteName
    );

    character.type=playerType;

    character.cursor = Game.engine.input.keyboard.createCursorKeys();
    Game.engine.camera.follow(character);

    Game.engine.physics.enable(character);
    character.body.collideWorldBounds = false;
    character.body.velocity.x = vx;
    character.body.velocity.y = vy;
    character.spawn = {
        id: 0,
        x: sx,
        y: sy
    };

    // sync player key press event
    if(Math.abs(vx) > Player[playerType.spriteName].velocity.horizontal.idle)
    {
        if(vx > 0)
        {
            character.cursor.right.isDown = true;
        }
        else
        {
            character.cursor.left.isDown = true;
        }
    }
    // set up animations by Phaser engine
    character.animations.add('left', playerType.animation.left, playerType.animation.frameRate, true);
    character.animations.add('right', playerType.animation.right, playerType.animation.frameRate, true);
    character.animations.add('leftIdle', playerType.animation.leftIdle, playerType.animation.frameRate, true);
    character.animations.add('rightIdle', playerType.animation.rightIdle, playerType.animation.frameRate, true);
    character.animations.add('die', playerType.animation.die, playerType.animation.frameRate, true);
    // character status: die
    character.dieyet = false;
    // character status: delete
    character.delete = false;

    character.name = Game.engine.add.text(
        x,
        y,
        playerName,
        Config.font.Arial
    );

    character.status = {};
    if(status == null)
    {
        for(let itemType in Item)
        {
            character.status[itemType] = 0;
        }
        //character.status.kill=0;
    }
    else
    {
        for(let itemType in status)
        {
            character.status[itemType] = status[itemType];
        }
        //character.status.kill=0;
    }

    character.achieve = {}
    character.achieve.coin = 0;
    character.achieve.kill = 0;
    if(playerName == Config.currentUserName)
    {
        character.moneyText = Game.engine.add.text(
            0,
            30,
            // "Coin: " + character.status.coin,
            "Coin: 0",
            Config.font.Stat
        );
        character.moneyText.fixedToCamera = true;
        character.killText = Game.engine.add.text(
            0,
            80,
            // "Kill: " + character.status.kill,
            "Kill: 0",
            Config.font.Stat
        );
        character.killText.fixedToCamera = true;
    }
    return character;
}
