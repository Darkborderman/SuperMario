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
                src:'/SuperMario/game/assets/items/sounds/coinget.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Item.coin.sound.get.name);
                    return () => {
                        sfx.play();
                    };
                }
            }
        },
        effect: 75,
        bounce: {
            x: 0,
            y: 0
        },
        picture: {
            src: '/SuperMario/game/assets/items/images/coin.png',
            width: 32,
            height: 32
        },
        overlap: function(character, item)
        {
            Item.coin.sound.get.play();
            Item.coin.destroy(item,character);
            character.achieve.coin += 1;
        },
        destroy: function(item, character)
        {
            character.status.coin += 1;
            item.body.enable = false;
            item.visible = false;
            setTimeout(
                function()
                {
                    Item.coin.respawn(item,character);
                },
                3000
            );
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
                src:'/SuperMario/game/assets/items/sounds/featherget.wav',
                create: () => {
                    let sfx = Game.engine.add.audio(Item.coin.sound.get.name);
                    return () => {
                        sfx.play();
                    };
                }
            }
        },
        effect: 250,
        bounce: {
            x: 1,
            y: 1
        },
        picture: {
            src: '/SuperMario/game/assets/items/images/feather.png',
            width: 32,
            height: 32
        },
        overlap: function(character, item)
        {
            Item.feather.sound.get.play();
            Item.feather.destroy(item,character);
            character.achieve.feather += 1;
        },
        destroy: function(item, character)
        {
            character.status.feather += 1;
            item.body.enable = false;
            item.visible = false;
            setTimeout(
                function()
                {
                    Item.feather.respawn(item,character);
                },
                3000
            );
        },
        respawn: function(item, character)
        {
            item.body.velocity.y = 0;
            character.status.feather -= 1;
            item.visible = true;
	        item.body.enable = true;
	        item.x = item.spawn.x;
            item.y = item.spawn.y;
        }
    }
};

function ItemSetup(structure=null)
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
            child.body.velocity.x = Item[itemType].velocity.x;
            child.body.velocity.y = Item[itemType].velocity.y;
            child.spawn = {
                x: child.position.x,
                y: child.position.y
            };
        }

        Game.items[itemType].setAll('body.gravity.y', Item[itemType].gravity.y);
        Game.items[itemType].setAll('body.bounce.x', Item[itemType].bounce.x);
        Game.items[itemType].setAll('body.bounce.y', Item[itemType].bounce.y);
    }
}
