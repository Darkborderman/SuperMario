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
    Game.players = {
        current: new PlayerSetup(
            Config.currentUserName,
            Player[Config.currentUserCharacterName],
            Map.structure[0].start[0].x,
            Map.structure[0].start[0].y,
            0,
            0,
            Map.structure[0].start[0].x,
            Map.structure[0].start[0].y,
            null,
            true
        ),
        others: Game.engine.add.group(),
        hash: {}
    };
    Game.players.hash[Config.currentUserName] = Game.players.current;
    
    // create monsters' container
    Game.monsters = {};
    
    // create items' container
    Game.items = {};

    // create savepoints' container
    Game.savepoints = {};

    // new player tell server to join game
    socket.emit(
        '00 playerJoin', 
        {
            name: Config.currentUserName,
            typeName: Player[Config.currentUserCharacterName].spriteName,
            x: Game.players.current.position.x,
            y: Game.players.current.position.y
        }
    );
}

function update()
{
    // current player collide with other player
    Game.engine.physics.arcade.collide(
        Game.players.others,
        Game.players.current,
        Player.mario.collide
    );
    
    // other player collide with other player
    Game.engine.physics.arcade.collide(
        Game.players.others,
        Game.players.others
    );

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

    // player movement update
    let all_players = Game.players.hash;
    for(let player in all_players)
    {
        //render player's movement
        let character = all_players[player];
        let name = character.name;
        let cursor = character.cursor;
        let velocity = character.body.velocity;
        let playerTypeVelocity = Player[character.key].velocity;
        let status = character.status;
        let coin = status.coin;
        let feather = status.feather;
        let facing;
        
        // delete player if signaled
        if(character.delete)
        {
            Game.players.hash[player].name.destroy();
            Game.players.hash[player].destroy();
            delete Game.players.hash[player];
            continue;
        }
        
        // set each players' title on head
        name.x = Math.floor(all_players[player].position.x);
        name.y = Math.floor(all_players[player].position.y - all_players[player].height / 3);

        if(character.name._text == Config.currentUserName)
        {
            character.moneyText.setText("Coin: " + character.achieve.coin);
            character.killText.setText("Kill: " + character.achieve.kill);
        }
        // stop moving to left or right
        if(!character.body.onFloor())
            //if player pick more than 1 feather, only 1 feather will effect(or it will be overpowered)
            velocity.y += playerTypeVelocity.vertical.gravity - Item.feather.effect * (feather >= 1 ? 1 : 0);

        if (cursor.up.isDown)
        {
            if(character.body.onFloor())
            {
                velocity.y = playerTypeVelocity.vertical.jump;
            }
        }
        if(cursor.left.isDown)
        {
            if(!character.dieyet)
            {
                facing = Config.status.left;
                velocity.x = facing * (coin * Item.coin.effect + playerTypeVelocity.horizontal.move);
                character.animations.play('left');
            }
        }
        else if (cursor.right.isDown)
        {
            if(!character.dieyet)
            {
                facing = Config.status.right;
                velocity.x = facing * (coin * Item.coin.effect + playerTypeVelocity.horizontal.move);
                character.animations.play('right');

            }
        }
        else if (cursor.down.isDown)
        {
            //temporary unusable
        }
        else
        {
            if(!character.dieyet)
            {
                if(velocity.x >= 0)
                {
                    facing = Config.status.right;
                    character.animations.play('rightIdle');
                }
                else
                {
                    facing = Config.status.left;
                    character.animations.play('leftIdle');
                }
                velocity.x = facing * playerTypeVelocity.horizontal.idle;
            }
        }
    }

    // current player key press and release event
    let currentCharacter = Game.players.current;
    let currentCharacterCursor = currentCharacter.cursor;
    let currentCharacterIspressed = currentCharacter.ispressed;

    // press up and on floor
    if(currentCharacterCursor.up.isDown && currentCharacter.body.onFloor())
    {
        socket.emit(
            'playerMove',
            {
                name: Config.currentUserName,
                move: 'up',
                x: currentCharacter.position.x,
                y: currentCharacter.position.y,
                vx: currentCharacter.body.velocity.x,
                vy: currentCharacter.body.velocity.y
            }
        );
    }

    // press or release left
    else if(currentCharacterCursor.left.isDown != currentCharacterIspressed.left)
    {
        // press left
        if(currentCharacterCursor.left.isDown)
        {
            socket.emit(
                'playerMove',
                {
                    name: Config.currentUserName,
                    move: 'left',
                    x: currentCharacter.position.x,
                    y: currentCharacter.position.y,
                    vx: currentCharacter.body.velocity.x,
                    vy: currentCharacter.body.velocity.y
                }
            );
            currentCharacterIspressed.left = true;
        }
        // release left
        else
        {
            socket.emit(
                'playerStop',
                {
                    name: Config.currentUserName,
                    move: 'left',
                    x: currentCharacter.position.x,
                    y: currentCharacter.position.y,
                    vx: currentCharacter.body.velocity.x,
                    vy: currentCharacter.body.velocity.y
                }
            );
            currentCharacterIspressed.left = false;
        }
    }

    // press or release right
    else if(currentCharacterCursor.right.isDown != currentCharacterIspressed.right)
    {
        // press right
        if(currentCharacterCursor.right.isDown)
        {
            socket.emit(
                'playerMove',
                {
                    name: Config.currentUserName,
                    move: 'right',
                    x: currentCharacter.position.x,
                    y: currentCharacter.position.y,
                    vx: currentCharacter.body.velocity.x,
                    vy: currentCharacter.body.velocity.y
                }
            );
            currentCharacterIspressed.right = true;
        }
        // release right
        else
        {
            socket.emit(
                'playerStop',
                {
                    name: Config.currentUserName,
                    move: 'right',
                    x: currentCharacter.position.x,
                    y: currentCharacter.position.y,
                    vx: currentCharacter.body.velocity.x,
                    vy: currentCharacter.body.velocity.y
                }
            );
            currentCharacterIspressed.right = false;
        }
    }
}

function render(){}
