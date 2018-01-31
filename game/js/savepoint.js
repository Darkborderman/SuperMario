const Savepoint = {
    finishPoint:{
        tileNumber: 67,
        spriteName: 'finishPoint',
        picture: {
            src: '/game/assets/savepoints/images/finishPoint.png',
            width: 32,
            height: 32
        },
        sound: {
            hit: {
                name: 'finishPointHit',
                src:'/game/assets/savepoints/sounds/hit.wav',
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
                socket.emit(
                    'playerFinish',
                    {
                        name: character.name._text
                    }
                );
            }
        }
    },
    midPoint:{
        tileNumber: 68,
        spriteName: 'midPoint',
        picture: {
            src: '/game/assets/savepoints/images/midPoint.png',
            width: 32,
            height: 32
        },
        sound: {
            hit: {
                name: 'midPointHit',
                src:'/game/assets/savepoints/sounds/hit.wav',
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
                socket.emit(
                    'playerMidpoint',
                    {
                        name: character.name._text,
                        x: savepoint.x,
                        y: savepoint.y
                    }
                );
            }
        }
    }
}

function SavepointSetup(structure=null, savepointData=null)
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
            child.name = savepointType;
            if(savepointData)
            {
                child.position.x = savepointData[savepointType][i].x;
                child.position.y = savepointData[savepointType][i].y;
                child.spawn = {
                    x: savepointData[savepointType][i].sx,
                    y: savepointData[savepointType][i].sy
                };
            }
            else
            {
                child.spawn = {
                    x: child.position.x,
                    y: child.position.y
                };
            }
            // save point need to be unmoveable
            // so there may be a bool like point.movable=false;
        }
    }
}
