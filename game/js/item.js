const Item = {
    coin:{
        tileNumber: 60,
        spriteName: 'coin',
        velocity: {
            x: 0,
            y: 0
        },
        gravity: {
            x: 0,
            y: 0
        },
        sound : {
            get : {
                name: 'coinGet',
                src:'/game/assets/items/sounds/coinget.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Item.coin.sound.get.name);
                    return () => {
                        sfx.play();
                    };
                }
            }
        },
        effect: 50,
        bounce: {
            x: 0,
            y: 0
        },
        picture: {
            src: '/game/assets/items/images/coin.png',
            width: 32,
            height: 32
        },
        overlap: function(character, item)
        {
            socket.emit(
                'itemDead',
                {
                    itemOwner: Config.currentUserName,
                    itemType: 'coin',
                    id: item.id
                }
            );
        },
        destroy: function(item, character)
        {
            character.status.coin += 1;
            character.achieve.coin += 1;
            item.body.enable = false;
            item.visible = false;
        },
        respawn: function(item, character)
        {
            character.status.coin -= 1;
            item.visible = true;
	        item.body.enable = true;
	        item.position.x = item.spawn.x;
            item.position.y = item.spawn.y;
        }
    },
    feather:{
        tileNumber: 95,
        spriteName: 'feather',
        velocity: {
            x: 0,
            y: 0
        },
        gravity: {
            x: 0,
            y: 80
        },
        sound : {
            get : {
                name: 'featherGet',
                src:'/game/assets/items/sounds/featherget.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Item.coin.sound.get.name);
                    return () => {
                        sfx.play();
                    };
                }
            }
        },
        effect: 10,
        bounce: {
            x: 1,
            y: 1
        },
        picture: {
            src: '/game/assets/items/images/feather.png',
            width: 32,
            height: 32
        },
        overlap: function(character, item)
        {
            socket.emit(
                'itemDead',
                {
                    itemOwner: Config.currentUserName,
                    itemType: 'feather',
                    id: item.id
                }
            );   
        },
        respawn: function(item, character)
        {
            item.body.velocity.y = 0;
            character.status.feather -= 1;
            item.visible = true;
	        item.body.enable = true;
	        item.position.x = item.spawn.x;
            item.position.y = item.spawn.y;
        },
        destroy: function(item, character)
        {
            character.status.feather += 1;
            item.body.enable = false;
            item.visible = false;
        }
    }
};

function ItemSetup(structure=null, itemData=null)
{
    // setup each item group
    for(let itemType in Item)
    {
        Game.items[itemType] = Game.engine.add.group();
        Game.items[itemType].enableBody = true;

        // set sound for eack kind of item
        for(let soundType in Item[itemType].sound)
        {
            Item[itemType].sound[soundType].play = Item[itemType].sound[soundType].create();
        }

        // create item from tilemap
        Game.map.tileMap.createFromTiles(
            Item[itemType].tileNumber,
            null,
            itemType,
            structure.layer.item,
            Game.items[itemType]
        );

        // assign id to each sprite in group
        for(let i = 0; i < Game.items[itemType].length; ++i)
        {
            let child = Game.items[itemType].children[i];
            child.name = itemType;
            child.id = i;
            if(itemData)
            {
                child.position.x = itemData[itemType][i].x;
                child.position.y = itemData[itemType][i].y;
                child.body.velocity.x = itemData[itemType][i].vx;
                child.body.velocity.y = itemData[itemType][i].vy;
                child.spawn = {
                    x: itemData[itemType][i].sx,
                    y: itemData[itemType][i].sy
                };
            }
            else
            {
                child.body.velocity.x = Item[itemType].velocity.x;
                child.body.velocity.y = Item[itemType].velocity.y;
                child.spawn = {
                    x: child.position.x,
                    y: child.position.y
                };
            }
        }

        Game.items[itemType].setAll('body.gravity.y', Item[itemType].gravity.y);
        Game.items[itemType].setAll('body.bounce.x', Item[itemType].bounce.x);
        Game.items[itemType].setAll('body.bounce.y', Item[itemType].bounce.y);
    }
}
