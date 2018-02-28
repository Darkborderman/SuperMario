const Savepoint = {
    finishPoint:{
        tileNumber: 67,
        spriteName: 'finishPoint',
        picture: {
            src: '/SuperMario/game/assets/savepoints/images/finishPoint.png',
            width: 32,
            height: 32
        },
        sound: {
            hit: {
                name: 'finishPointHit',
                src:'/SuperMario/game/assets/savepoints/sounds/hit.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Savepoint.finishPoint.sound.hit.name);
                    return () => {
                        sfx.play();
                    }
                }
            }
        },
        overlap: function(character,savepoint){
            if(Game.map.isFinish == false)
            {
                let finishText = Game.engine.add.text(
                    $( window ).width() / 3,
                    $( window ).height() / 2 - 100,
                    Config.currentUserName + ' win!',
                    Config.font.Bold
                );
                finishText.fixedToCamera = true;
                Game.map.isFinish = true;
            }
        }
    },
    midPoint:{
        tileNumber: 68,
        spriteName: 'midPoint',
        picture: {
            src: '/SuperMario/game/assets/savepoints/images/midPoint.png',
            width: 32,
            height: 32
        },
        sound: {
            hit: {
                name: 'midPointHit',
                src:'/SuperMario/game/assets/savepoints/sounds/hit.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Savepoint.midPoint.sound.hit.name);
                    return () => {
                        sfx.play();
                    }
                }
            }
        },
        overlap: function(character,savepoint){
            if(character.spawn.x != savepoint.x && character.spawn.y != savepoint.x)
            {
                character.spawn.x = savepoint.x;
                character.spawn.y = savepoint.y;
            }
        }
    }
}

function SavepointSetup(structure=null)
{
    for(let savepointType in Savepoint)
    {
        Game.savepoints[savepointType] = Game.engine.add.group();
        Game.savepoints[savepointType].enableBody = true;
        for(let soundType in Savepoint[savepointType].sound)
        {
            Savepoint[savepointType].sound[soundType].play = Savepoint[savepointType].sound[soundType].create();
        }
        Game.map.tileMap.createFromTiles(
            Savepoint[savepointType].tileNumber,
            null,
            savepointType,
            structure.layer.event,
            Game.savepoints[savepointType]
        );
        
        for(let i = 0; i < Game.savepoints[savepointType].length; ++i)
        {
            let child = Game.savepoints[savepointType].children[i];
            child.spawn = {
                x: child.position.x,
                y: child.position.y
            };
        }
    }
}
