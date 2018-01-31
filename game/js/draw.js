let Game = {};

Game.engine = new Phaser.Game(
    // game window width
    Config.window.width,
    // game window height
    Config.window.height,
    // phaser draw engine
    Phaser.CANVAS,
    // html tag id
    Config.html.main,
    // phaser state object
    // state order: preload -> create-> update -> render
    // keep looping between update and render states
    {
        preload: preload,
        create: create,
        update: update,
        render: render
    }
);

// load image and tilemap
function preload()
{
    // cancel onblur event
    Game.engine.stage.disableVisibilityChange = true;
    // load all map
    for(let i = 0; i < Map.structure.length; ++i)
    {
        Game.engine.load.tilemap(
            Map.structure[i].name,
            Map.structure[i].src,
            null, 
            Phaser.Tilemap.TILED_JSON
        );
    }
    // load all tileset
    for(let i = 0; i < Map.tileset.length; ++i)
    {
        Game.engine.load.image(
            Map.tileset[i].name,
            Map.tileset[i].src
        );
    }
    // load all background
    for(let i = 0; i < Map.background.length; ++i)
    {
        Game.engine.load.image(
            Map.background[i].name,
            Map.background[i].src
        );
    }
    // load all background sound
    for(let i = 0; i < Map.sound.length; ++i)
    {
        Game.engine.load.audio(
            Map.sound[i].name,
            Map.sound[i].src
        );
    }
    // load all player spritesheet and sound
    for(let playerType in Player)
    {
        Game.engine.load.spritesheet(
            Player[playerType].spriteName,
            Player[playerType].picture.src,
            Player[playerType].picture.width,
            Player[playerType].picture.height
        );
        for(let soundType in Player[playerType].sound)
        {
            Game.engine.load.audio(
                Player[playerType].sound[soundType].name,
                Player[playerType].sound[soundType].src
            );
        }
    }
    // load all monster spritesheet and sound
    for(let monsterType in Monster)
    {
        Game.engine.load.spritesheet(
            Monster[monsterType].spriteName,
            Monster[monsterType].picture.src,
            Monster[monsterType].picture.width,
            Monster[monsterType].picture.height
        );
        for(let soundType in Monster[monsterType].sound)
        {
            Game.engine.load.audio(
                Monster[monsterType].sound[soundType].name,
                Monster[monsterType].sound[soundType].src
            );
        }
    }
    // load all item spritesheet and sound
    for(let itemType in Item)
    {
        Game.engine.load.spritesheet(
            Item[itemType].spriteName,
            Item[itemType].picture.src,
            Item[itemType].picture.width,
            Item[itemType].picture.height
        );
        for(let soundType in Item[itemType].sound)
        {
            Game.engine.load.audio(
                Item[itemType].sound[soundType].name,
                Item[itemType].sound[soundType].src
            );
        }
    }
    // load all savepoints
    for(let savepointType in Savepoint)
    {
        Game.engine.load.spritesheet(
            Savepoint[savepointType].spriteName,
            Savepoint[savepointType].picture.src,
            Savepoint[savepointType].picture.width,
            Savepoint[savepointType].picture.height
        );
        for(let soundType in Savepoint[savepointType].sound)
        {
            Game.engine.load.audio(
                Savepoint[savepointType].sound[soundType].name,
                Savepoint[savepointType].sound[soundType].src
            );
        }
    }

}

function create()
{
    // start physics system
    Game.engine.physics.startSystem(Phaser.Physics.ARCADE);

    // create map
    Game.map = new MapSetup(
        Map.structure[0],
        Map.tileset[0],
        Map.background[0],
        Map.sound[2]
    );

    for(let playerType in Player)
    {
        for(let soundType in Player[playerType].sound)
        {
            Player[playerType].sound[soundType].play = Player[playerType].sound[soundType].create();
        }
    }
    // create players' container
    Game.players = {};

    Game.players.current=new PlayerSetup(
        Config.currentUserName,
        Player.mario,
        Map.structure[0].start[0].x,
        Map.structure[0].start[0].y,
        0,
        0,
        Map.structure[0].start[0].x,
        Map.structure[0].start[0].y,
        null,
        true
    )
    // create monsters' container
    Game.monsters = {};
    
    // create items' container
    Game.items = {};

    // create savepoints' container
    Game.savepoints = {};
}

function update()
{
    // current player collide with solid layer
    Game.engine.physics.arcade.collide(
        Game.players.current,
        Game.map.solid
    );
    
    // other player collide with solid layer
    Game.engine.physics.arcade.collide(
        Game.players.others,
        Game.map.solid
    );

    for(let monsterType in Game.monsters)
    {
        let monsterGroup = Game.monsters[monsterType];
        // monster collide with solid layer
        Game.engine.physics.arcade.collide(
            monsterGroup,
            Game.map.solid,
            Map.monsterCollide
        );
        // monster overlap with character
        Game.engine.physics.arcade.overlap(
            Game.players.current,
            monsterGroup,
            Monster[monsterType].overlap
        );
        // detect each monster fall through world bound
        for(let i = 0; i < monsterGroup.length; i++)
        {
            Map.detectMonsterWorldBound(
                monsterGroup.children[i]
            );
        }
    }

    // character collide with item
    for(let itemType in Game.items)
    {
        let itemGroup = Game.items[itemType];

        Game.engine.physics.arcade.collide(
            itemGroup,
            Game.map.solid
        );

        Game.engine.physics.arcade.overlap(
            Game.players.current,
            itemGroup,
            Item[itemType].overlap
        );
    }

    // character collide with savepoint
    for(let savepointType in Game.savepoints)
    {
        let savepointGroup = Game.savepoints[savepointType];

        Game.engine.physics.arcade.overlap(
            Game.players.current,
            savepointGroup,
            Savepoint[savepointType].overlap
        );
    }

    // detect player finish and fall out of the world
    // current player only need to detect itself
    Map.detectPlayerWorldBound(Game.players.current);
    
    /*
    let character=Game.players.current;
    let velocity=character.body.velocity;
    let playerTypeVelocity=Player.mario.velocity;
    let cursor=character.cursor;
    
    if(character.name._text == Config.currentUserName)
    {
        character.moneyText.setText("Coin: " + character.achieve.coin);
        character.killText.setText("Kill: " + character.achieve.kill);
    }
    
    // stop moving to left or right
    if(!character.body.onFloor())
        //if player pick more than 1 feather, only 1 feather will effect(or it will be overpowered)
        //velocity.y += playerTypeVelocity.vertical.gravity - Item.feather.effect * (feather >= 1 ? 1 : 0);

    if (cursor.up.isDown)
    {
        if(character.body.onFloor())
        {
            velocity.y = playerTypeVelocity.vertical.jump;
        }
    }

    */

    
    // current player key press and release event
    let character = Game.players.current;
    let characterType= Player.mario;
    let characterCursor = character.cursor;
    let cursor=characterCursor;
    let characterIspressed = character.ispressed;
    let name=character.name;
        // set each players' title on head
        name.x = Math.floor(character.position.x);
        name.y = Math.floor(character.position.y - character.height / 3);


    character.body.velocity.y += characterType.velocity.vertical.gravity;

    // press up and on floor
    if(characterCursor.up.isDown && character.body.onFloor())
    {
        character.body.velocity.y -= 800;
    }

    // press or release left
    else if(characterCursor.left.isDown != characterIspressed.left)
    {
        // press left
        if(characterCursor.left.isDown)
        {
            characterCursor.left.isDown = true;
            character.body.velocity.x = -1*characterType.velocity.horizontal.move;
            characterIspressed.left=true;
        }
        // release left
        else
        {
            characterCursor.left.isDown = false;
            character.body.velocity.x = -1*characterType.velocity.horizontal.idle;
            characterIspressed.left=false;
        }
    }

    // press or release right
    else if(characterCursor.right.isDown != characterIspressed.right)
    {
        // press right
        if(characterCursor.right.isDown)
        {
            characterCursor.right.isDown = true;
            character.body.velocity.x = characterType.velocity.horizontal.move;
            characterIspressed.right = true;
        }
        // release right
        else
        {
            characterCursor.right.isDown = false;
            character.body.velocity.x = characterType.velocity.horizontal.idle;
            characterIspressed.right = false;
        }
    }

    //render animation part
    if(cursor.left.isDown)
    {
        if(!character.dieyet)
        {
            //velocity.x = facing * (coin * Item.coin.effect + playerTypeVelocity.horizontal.move);
            character.animations.play('left');
        }
    }
    else if (cursor.right.isDown)
    {
        if(!character.dieyet)
        {
            //velocity.x = facing * (coin * Item.coin.effect + playerTypeVelocity.horizontal.move);
            character.animations.play('right');

        }
    }
    else
    {
        if(!character.dieyet)
        {
            if(character.body.velocity.x >= 0)
            {
                character.animations.play('rightIdle');
            }
            else
            {
                character.animations.play('leftIdle');
            }
            //velocity.x = facing * playerTypeVelocity.horizontal.idle;
        }
    }
}

function render(){}
