const Map = {
    structure: [
        {
            name: 'world01',
            src: '/game/assets/maps/jsons/map.json',
            layer: {
                solid: 'solidLayer',
                monster: 'monsterLayer',
                event: 'eventLayer',
                item: 'itemLayer'
            },
            start: [
                {
                    x:64,
                    y:1096
                }
            ],
            isFinish: false,
            size: {
                x:9600,
                y:1280
            }
        }
    ],
    background: [
        {
            name: 'background01',
            src: '/game/assets/maps/images/backgrounds/nature.png',
            width: '1920',
            height: '1080',
            x: 0,
            y: 0
        }
    ],
    tileset: [
        {
            name: 'tileset01',
            src: '/game/assets/maps/images/tilesets/tilesetx32.png'
        }
    ],
    sound: [
        {
            name: 'castle',
            src: ['/game/assets/maps/sounds/castle.wav']
        },
        {
            name: 'cave',
            src: ['/game/assets/maps/sounds/cave.wav']
        },
        {
            name: 'field',
            src: ['/game/assets/maps/sounds/field.wav']
        },
        /*{
            name: 'finalboss',
            src: ['/game/assets/maps/sounds/finalboss.wav']
        },
        {
            name: 'finish',
            src: ['/game/assets/maps/sounds/finish.wav']
        },
        {
            name: 'flyship',
            src: ['/game/assets/maps/sounds/flyship.wav']
        },
        {
            name: 'ghosthouse',
            src: ['/game/assets/maps/sounds/ghosthouse.wav']
        },
        {
            name: 'miniboss',
            src: ['/game/assets/maps/sounds/miniboss.wav']
        },
        {
            name: 'rocky',
            src: ['/game/assets/maps/sounds/rocky.wav']
        },
        {
            name: 'surprise',
            src: ['/game/assets/maps/sounds/surprise.wav']
        },
        {
            name: 'timed',
            src: ['/game/assets/maps/sounds/timed.wav']
        },
        {
            name: 'water',
            src: ['/game/assets/maps/sounds/water.wav']
        },
        {
            name: 'worldmap',
            src: ['/game/assets/maps/sounds/worldmap.wav']
        }*/
    ],
    detectPoint: function(character,map)
    {
        let spawnPointID = character.spawn.id;
        for(let i = spawnPointID; i <= Game.map.point.end; ++i)
        {
            let newSpawnPoint = {
                x: Game.map.point.midpoint[i].x,
                y: Game.map.point.midpoint[i].y,
            };
            if(character.y >= newSpawnPoint.y && character.x >= newSpawnPoint.x)
            {
                if(spawnPointID < Game.map.point.end)
                {
                    character.spawn.id = i;
                    socket.emit(
                        'playerMidpoint',
                        {
                            id: i,
                            name: character.name._text
                        }
                    );
                }
                if(spawnPointID == Game.map.point.end && Game.map.point.isFinish == false)
                {
                    socket.emit(
                        'playerFinish',
                        {
                            name: character.name._text
                        }
                    );
                    Game.map.point.isFinish = true;
                }
            }
        }


    },
    detectPlayerWorldBound: function(character)
    {
        if(character.y + character.height >= Game.map.size.y)
        {
            character.y=Game.map.size.y-character.height-5;
            socket.emit(
                'playerDead',
                {
                    name: character.name._text
                }
            );
        }
        if(character.x <= 0)
        {
            character.position.x = 0;
        }
        if(character.position.x + character.width >= Game.map.size.x)
        {
            character.position.x = Game.map.size.x - character.width;
        }
    },
    detectMonsterWorldBound: function(monster)
    {
        let monsterName = monster.name;
        if(monster.position.y + monster.height >= Game.map.size.y)
        {
            monster.position.x = 50;
            monster.position.y = 50;
            monster.body.velocity.y=0;
            Monster[monster.name].destroy(monster);
            socket.emit(
                'monsterDead',
                {
                    monsterType: monster.name,
                    id: monster.id
                }
            );
        }
        else if(monster.position.x <= 0)
        {
            monster.position.x = 50;
            monster.position.y = 50;
            monster.body.velocity.y= 0;
            Monster[monster.name].destroy(monster);
            socket.emit(
                'monsterDead',
                {
                    monsterType: monster.name,
                    id: monster.id
                }
            );     
        }
        else if(monster.position.x + monster.width >= Game.map.size.x)
        {
            monster.position.x = 50;
            monster.position.y = 50;
            monster.body.velocity.y = 0;
            Monster[monster.name].destroy(monster);
            socket.emit(
                'monsterDead',
                {
                    monsterType: monster.name,
                    id: monster.id
                }
            );
        }
    },
    overlap: function(player, map)
    {
        if (player.body.blocked.down)
        {
            //console.log(Config.currentUserName+"is touching down");
        }
        if(player.body.blocked.left)
        {
            //console.log(Config.currentUserName+"is touching left");
            player.body.velocity.x = 0;
        }
        if(player.body.blocked.up)
        {
            //console.log(Config.currentUserName+"is touching up");
        }
        if(player.body.blocked.right)
        {
            //console.log(Config.currentUserName+"is touching right");
            player.body.velocity.x = 0;
        }
    },
    monsterCollide: function(monster, map)
    {
        if(monster.body.blocked.left)
        {
            monster.animations.play('walkRight');
        }
        if(monster.body.blocked.right)
        {
            monster.animations.play('walkLeft');
        }
    }
};

function MapSetup(structure, tileset, background, sound)
{
    // add background
    this.background = Game.engine.add.tileSprite(
        background.x,
        background.y,
        background.width,
        background.height,
        background.name
    );

    //give map size(use to detect collide worldbound or not)
    this.size = structure.size;

    this.isFinish=structure.isFinish;

    // background camera fixed to center
    this.background.fixedToCamera = true;

    // add tile map (previous defined map.json)
    this.tileMap = Game.engine.add.tilemap(structure.name);
    
    // load tile set for tile map
    // can have multiple tile set for one map
    this.tileMap.addTilesetImage('tileset', tileset.name);

    // add solid block layer
    this.solid = this.tileMap.createLayer(structure.layer.solid);

    // add event block layer
    
    // new layer need resize world
    this.solid.resizeWorld();

    // enable collision on tile map
    this.tileMap.setCollisionByExclusion([67,68,77,78,98,99,100]);
    
    //add backgroundsound
    this.sound = Game.engine.add.audio(sound.name);

    // start loop map sound
    this.sound.loopFull();

    //resize game window when initialize the game
    resizeGameWindow();
}
// resize Phaser game window 
function resizeGameWindow()
{
    Game.engine.scale.setGameSize($( window ).width(), $( window ).height()*0.8);
}
// trigger function when resize(using jQuery)
$(window).resize(function()
{
    resizeGameWindow();
});
