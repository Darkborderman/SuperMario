let socket = io();

// server tell current player info of new player
socket.on('01 toExistPlayer', function(newPlayerData){
    // to do action
    function toDo(){
        // delay toDo if state not reach yet
        if(Config.state.current < Config.state.toExistPlayer)
        {
            setTimeout(toDo, Config.delay);
            return;
        }

        // avoid multiple signals
        if(!(newPlayerData.name in Game.players.hash))
        {
            // create new player
            Game.players.hash[newPlayerData.name] = Game.players.others.add(
                new PlayerSetup(
                    newPlayerData.name,
                    Player[newPlayerData.typeName],
                    newPlayerData.x,
                    newPlayerData.y
                )
            );
        }

        // emit player's stats to new player
        socket.emit(
            '02 toNewPlayer',
            {
                requestName: newPlayerData.name,
                data: {
                    name: Config.currentUserName,
                    typeName: Player.mario.spriteName,
                    x: Game.players.current.position.x,
                    y: Game.players.current.position.y,
                    vx: Game.players.current.body.velocity.x,
                    vy: Game.players.current.body.velocity.y,
                    sx: Game.players.current.spawn.x,
                    sy: Game.players.current.spawn.y,
                    status: Game.players.current.status
                }
            }
        );
    }

    // run to do
    toDo();
});

// server tell new player info of exist player(s)
socket.on('02 toNewPlayer', function(playerData){
    // to do action
    function toDo(){
        // delay toDo if state not reach yet
        if(Config.state.current < Config.state.toNewPlayer)
        {
            setTimeout(toDo, Config.delay);
            return;
        }

        // avoid multiple signals
        if(!(playerData.name in Game.players.hash))
        {
            // create existed player(s)
            Game.players.hash[playerData.name] = Game.players.others.add(
                new PlayerSetup(
                    playerData.name,
                    Player[playerData.typeName],
                    playerData.x,
                    playerData.y,
                    playerData.vx,
                    playerData.vy,
                    playerData.sx,
                    playerData.sy,
                    playerData.status
                )
            );
        }
    }

    // run to do
    toDo();
});

// new player finish join into playerlist
socket.on('03 playerJoinFinish', function(){

    // update state
    Config.state.current = Config.state.playerJoinFinish;

    // ask superuser to get monster list
    socket.emit(
        '04 requestMonster',
        {
            name: Config.currentUserName
        }
    );
});

// server ask superuser to get monster list
socket.on('05 getMonsterInfo', function(playerData){
    // to do action
    function toDo(){
        // delay toDo if state not reach yet
        if(Config.state.current < Config.state.getMonsterInfo)
        {
            setTimeout(toDo, Config.delay);
            return;
        }

        // stringify monster info
        let dataString = '{';
        for(let monsterType in Game.monsters)
        {
            if(dataString.length > 1)
                dataString += ',';

            dataString += `"${monsterType}":[`;
            
            let children = Game.monsters[monsterType].children;
            for(let i = 0; i < children.length; ++i)
            {
                if(i != 0)
                    dataString += ',';
                dataString += '{';
                dataString += '"x":'+children[i].position.x + ',';
                dataString += '"y":'+children[i].position.y + ',';
                dataString += '"vx":'+children[i].body.velocity.x + ',';
                dataString += '"vy":'+children[i].body.velocity.y + ',';
                dataString += '"sx":'+children[i].spawn.x + ',';
                dataString += '"sy":'+children[i].spawn.y;
                // dataString += 'bodyenable'
                dataString += '}';
            }
            dataString += ']';
        }
        dataString += '}';
        // return monster info
        socket.emit(
            '06 parseMonsterInfo',
            {
                requestName: playerData.name,
                monsterGroup: dataString
            }
        );
    }
    
    // run to do
    toDo();
});

// new user spawn monster in world
socket.on('07 spawnMonster', function(monsterData){

    // update state
    Config.state.current = Config.state.spawnMonster;

    // if you're superuser, init the list and emit to server
    // let server has a monster list
    if (monsterData.superUser)
    {
        // spawn monster from tileset
        MonsterSetup(Map.structure[0]);
    }
    // if you're not superuser then ask monster list from server
    else
    {
        // parse from monster list
        monsterData = JSON.parse(monsterData.monsterGroup);
        MonsterSetup(Map.structure[0], monsterData);
    }
    socket.emit(
        '08 requestItem',
        {
            name: Config.currentUserName
        }
    );
});

// server ask superuser to get item list
socket.on('09 getItemInfo', function(playerData){
    // to do action
    function toDo(){
        // delay toDo if state not reach yet
        if(Config.state.current < Config.state.getItemInfo)
        {
            setTimeout(toDo, Config.delay);
            return;
        }

        // stringify item info
        let dataString = '{';
        for(let itemType in Game.items)
        {
            if(dataString.length > 1)
                dataString += ',';

            dataString += `"${itemType}":[`;
            
            let children = Game.items[itemType].children;
            for(let i = 0; i < children.length; ++i)
            {
                if(i != 0)
                    dataString += ',';
                dataString += '{';
                dataString += '"x":'+children[i].position.x + ',';
                dataString += '"y":'+children[i].position.y + ',';
                dataString += '"vx":'+children[i].body.velocity.x + ',';
                dataString += '"vy":'+children[i].body.velocity.y + ',';
                dataString += '"sx":'+children[i].spawn.x + ',';
                dataString += '"sy":'+children[i].spawn.y;
                // dataString += 'bodyenable'
                dataString += '}';
            }
            dataString += ']';
        }
        dataString += '}';
        // return item info
        socket.emit(
            '10 parseItemInfo',
            {
                requestName: playerData.name,
                itemGroup: dataString
            }
        );
    }

    // run to do
    toDo();
});

// new user spawn item in world
socket.on('11 spawnItem', function(itemData){

    // update state
    Config.state.current = Config.state.spawnItem;

    // if you're superuser, init the list and emit to server
    // let server has a item list
    if (itemData.superUser)
    {
        // spawn item from tileset
        ItemSetup(Map.structure[0]);
    }
    // if you're not superuser then ask item list from server
    else
    {
        // parse from item list
        itemData = JSON.parse(itemData.itemGroup);
        ItemSetup(Map.structure[0], itemData);
    }
    socket.emit(
        '12 requestSavepoint',
        {
            name: Config.currentUserName
        }
    );

});

// server ask superuser to get savepoint list
socket.on('13 getSavepointInfo', function(playerData){
    // to do action
    function toDo(){
        // delay toDo if state not reach yet
        if(Config.state.current < Config.state.getSavepointInfo)
        {
            setTimeout(toDo, Config.delay);
            return;
        }

        // stringify savepoint info
        let dataString = '{';
        for(let savepointType in Game.savepoints)
        {
            if(dataString.length > 1)
                dataString += ',';

            dataString += `"${savepointType}":[`;
            
            let children = Game.savepoints[savepointType].children;
            for(let i = 0; i < children.length; ++i)
            {
                if(i != 0)
                    dataString += ',';
                dataString += '{';
                dataString += '"x":' + children[i].position.x + ',';
                dataString += '"y":' + children[i].position.y + ',';
                dataString += '"sx":' + children[i].spawn.x + ',';
                dataString += '"sy":' + children[i].spawn.y;
                // dataString += 'bodyenable'
                dataString += '}';
            }
            dataString += ']';
        }
        dataString += '}';
        // return savepoint info
        socket.emit(
            '14 parseSavepointInfo',
            {
                requestName: playerData.name,
                savepointGroup: dataString
            }
        );
    }

    // run to do
    toDo();
});

// new user spawn savepoint in world
socket.on('15 spawnSavepoint', function(savepointData){

    // update state
    Config.state.current = Config.state.spawnsavepoint;

    // if you're superuser, init the list and emit to server
    // let server has a savepoint list
    if (savepointData.superUser)
    {
        // spawn savepoint from tileset
        SavepointSetup(Map.structure[0]);
    }
    // if you're not superuser then ask savepoint list from server
    else
    {
        // parse from savepoint list
        savepointData = JSON.parse(savepointData.savepointGroup);
        SavepointSetup(Map.structure[0], savepointData);
    }
});

// player open multiple tabs to cheat
socket.on('multipleConnection', function(){
    socket.emit('disconnect');
    window.location.replace("/game/error");
});

// someone press key
socket.on('playerMove',function(playerData){

    // if not in finish state,then don't do anything  
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    if(playerData.name in Game.players.hash)
    {
        if(playerData.move == 'up')
        {
            Game.players.hash[playerData.name].position.x = playerData.x;
            Game.players.hash[playerData.name].position.y = playerData.y;
            Game.players.hash[playerData.name].body.velocity.x = playerData.vx;
            Game.players.hash[playerData.name].body.velocity.y = playerData.vy;
        }
        else
        {
            Game.players.hash[playerData.name].cursor[playerData.move].isDown = true;
            Game.players.hash[playerData.name].position.x = playerData.x;
            Game.players.hash[playerData.name].position.y = playerData.y;
            Game.players.hash[playerData.name].body.velocity.x = playerData.vx;
            Game.players.hash[playerData.name].body.velocity.y = playerData.vy;
        }
    }
});

// someone release key
socket.on('playerStop',function(playerData){

    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    if(playerData.name in Game.players.hash)
    {
        Game.players.hash[playerData.name].cursor[playerData.move].isDown = false;
        Game.players.hash[playerData.name].position.x = playerData.x;
        Game.players.hash[playerData.name].position.y = playerData.y;
        Game.players.hash[playerData.name].body.velocity.x = playerData.vx;
        Game.players.hash[playerData.name].body.velocity.y = playerData.vy;
    }
});

// delete other players
socket.on('playerDelete',function(playerData){

    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    if(playerData.name in Game.players.hash)
    {
        Game.players.hash[playerData.name].delete = true;
    }
});

// someone died
socket.on('playerDead', function(playerData){

    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    let playerKiller = Game.players.hash[playerData.playerKiller];
    if(playerData.playerKiller)
    {
        playerKiller.body.velocity.y = Player[playerKiller.key].velocity.vertical.bounce;
        playerKiller.achieve.kill+=1;
    }
    // player die animation and player death sound
    let deadPlayer = Game.players.hash[playerData.name];
    if(playerData.name == Config.currentUserName)
    {
        Game.map.sound.stop();
        Player[deadPlayer.key].sound.die.play();
    }
    else
    {
        Player.mario.sound.hit.play();
    }
    if(playerData.name in Game.players.hash)
    {
        Player[deadPlayer.key].destroy(deadPlayer);
    }
});

socket.on('playerRespawn', function(playerData){
    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }
    
    let deadPlayer = Game.players.hash[playerData.name];
    // avoid respawn after disconnect
    if(playerData.name in Game.players.hash)
    {
        //respawn player to his spawnpoint
        Player[deadPlayer.key].respawn(deadPlayer);
    }
});

socket.on('playerMidpoint', function(playerData){
    if(playerData.name in Game.players.hash)
    {
        Game.players.hash[playerData.name].spawn.x = playerData.x;
        Game.players.hash[playerData.name].spawn.y = playerData.y;
    }
});

socket.on('playerFinish', function(playerData){
    let finishText = Game.engine.add.text(
        $( window ).width() / 3,
        $( window ).height() / 2 - 100,
        playerData.name + ' win!',
        Config.font.Bold
    );
    finishText.fixedToCamera = true;
    Game.map.isFinish = true;
    let character = Game.players.current;
    //collect data for ranking
    socket.emit('collectData',{
        userName: Config.currentUserName,
        coin: character.achieve.coin, // should be replaced
        kill: character.achieve.kill, //should be replaced
        comp: Game.players.current.x,
    });
});

socket.on('gotoSummary', function(){
    window.location = "/game/summary";
});

// some monster died
socket.on('monsterDead', function(monsterData){
    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    let monsterKiller = Game.players.hash[monsterData.monsterKiller];
    monsterKiller.body.velocity.y = Player[monsterKiller.key].velocity.vertical.bounce;
    //monsterKiller.achieve.kill += 1;
    // set monster's animation to die and play die sound
    let deadMonster = Game.monsters[monsterData.monsterType].children[monsterData.id];
    Monster[monsterData.monsterType].destroy(deadMonster);
});

socket.on('monsterRespawn',function(monsterData){
    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    let deadMonster = Game.monsters[monsterData.monsterType].children[monsterData.id];
    Monster[monsterData.monsterType].respawn(deadMonster);
});

socket.on('itemDead',function(itemData){

    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    // set item's animation to die and play die sound
    let deadItem = Game.items[itemData.itemType].children[itemData.id];
    let character = Game.players.hash[itemData.itemOwner];
    if(itemData.itemOwner == Config.currentUserName)
    {
        Item.coin.sound.get.play();
    }
    Item[itemData.itemType].destroy(deadItem, character);
});

socket.on('itemRespawn', function(itemData){

    // if not in finish state,then don't do anything
    if(Config.state.current < Config.state.finish)
    {
        return;
    }

    // set item's animation to die and play die sound
    let deadItem = Game.items[itemData.itemType].children[itemData.id];
    let character = Game.players.hash[itemData.itemOwner];
    Item[itemData.itemType].respawn(deadItem, character);
});
