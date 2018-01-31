const Config = {
    window: {
        // type stored in string
        width: '100%',
        height: '110%'
    },
    html: {
        main: 'html_game_block'
    },
    font: {
        Arial: {
            font: "16px Arial",
            fill: "#000000",
            align: "center"
        },
        Stat: {
            font: "48px Arial",
            fill: "#000000",
            align: "center"
        },
        Bold: {
            font: "64px Arial",
            fill: "#000000",
            align: "center"
        }
    },
    // Config.state is used verify state
    state: {
        start: 0,
        playerJoin: 0,
        toExistPlayer: 1,
        toNewPlayer: 2,
        playerJoinFinish: 3,
        requestMonster: 4,
        getMonsterInfo: 5,
        parseMonsterInfo: 6,
        spawnMonster: 7,
        requestItem: 8,
        getItemInfo: 9,
        parseItemInfo: 10,
        spawnItem: 11,
        finish: 11,
        current: 0
    },
    status: {
        left: -1,
        right: 1
    },
    delay: 200,
    currentUserName: $("#userName").html(),
    currentUserCharacterName: $("#characterName").html()
};
