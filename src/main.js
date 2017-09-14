Game = {
    view: {
        // full-screen
        width: window.innerWidth,
        height: window.innerHeight
    },

    levelNumber: 1,

    start: function() {
        // Game world is whatever fits on-screen
        Crafty.init(Game.view.width, Game.view.height);
        Crafty.background('black');
        
        map.init(config("level").widthInTiles, config("level").heightInTiles);
        Crafty.e("Level").loadMap(map);

        var path = [];
        var startTile = null;
        var exit = map.getRandomTile();

        for (i = 0; i < config('pathSegments'); i++) {
            if (startTile == null) {
                startTile = exit;
            }
            var stopTile = map.getRandomTile(exit);
            path = path.concat(map.getPath(startTile, stopTile));
            startTile = stopTile;
        }

        function isInArray(array, move) {
            for (i = 0; i < path.length; i++) {
                if (move.every(function (v, i) { return v === path[i] })) {
                    return true;
                }
            }
            return false;
        }
        var generator = new Srand(map.seededGen.random());

        exit.setWinGate();
        map.winGate = exit;

        var playerEntity = Crafty.e('Player').moveTo(stopTile);
        map.playerTile = playerEntity.tile;

        var randomTileChance = config('probabilityOfSpawningTile') + (config('incrementProbabilityPerLevel') * Game.levelNumber);
        if (randomTileChance > config('maxProbability')) {
            randomTileChance = config('maxProbability');
        }

        for (var x = 0; x < map.widthInTiles; x++) {
            for (var y = 0; y < map.heightInTiles; y++) {
                if (!isInArray(path, [x, y]) && generator.random() < randomTileChance) {
                    var tile = map.getTile(x, y);
                    if (tile.contents == '' && tile.entity == '') {
                        var antiVirusNumber = 0;
                        var choice = generator.choice(['StrongDangerTile', 'WeakDangerTile', 'WallTile', 'WallTile', 'WallTile', 'WallTile', 'AntiVirus'])
                        switch (choice) {
                            case 'StrongDangerTile':
                                tile.setStrongDangerTile();
                                break;
                            case 'WeakDangerTile':
                                tile.setWeakDangerTile();
                                break;
                            case 'AntiVirus':
                                antiVirusNumber++;
                                if (antiVirusno => 2) {
                                    Crafty.e('AntiVirus').moveTo(tile);
                                    antiVirusNumber = 0;
                                }
                                break;
                            case 'WallTile':
                                tile.setWallTile();
                                break;
                        }
                    }
                }
            }
        }

        path.splice(0, 1);
        path.splice(path.length - 1, 1);

        for (i = 0; i < path.length; i++) {
            var coords = path[i];
            var tile = map.getTile(coords[0], coords[1]);
            tile.resetTile();
        }

        var pathToExit = map.getPathToPlayer(exit);

        pathToExit.splice(0, 1);
        pathToExit.splice(pathToExit.length - 1, 1);

        var tile = generator.choice(pathToExit);
        tile = map.getTile(tile[0], tile[1]);

        if (map.getPathToPlayer(exit).length > 0) {
            tile.contents = 'PLACEHOLDER';
            var switchTile = map.getReachableTile();
            if (switchTile == null || map.getPathToPlayer(switchTile).length == 0) {
                tile.resetTile();
            } else {
                tile.setSwitchGate();
                switchTile.setSwitch(tile);
            }
        }


        var dangerTilesNo = Math.floor(Game.levelNumber * config('dangerTilesPerLevel'));
        for (var i = 0; i < dangerTilesNo; i++) {
            if (config('allowWeakDangerTile') && config('allowInvincibleDangerTile')) {
                var dangerTile = generator.choice(['setWeakDangerTile', 'setStrongDangerTile']);
            } else if (config('allowWeakDangerTile')) {
                var dangerTile = 'setWeakDangerTile';
            } else if (config('allowInvincibleDangerTile')) {
                var dangerTile = 'setStrongDangerTile';
            } else {
                break;
            }
            map.getRandomTile()[dangerTile]();
        }

        var switchGateNo = Math.floor((Game.levelNumber/2) + 1) * config('switchGatesPerLevel');
        for (var i = 0; i < switchGateNo; i++) {
            var switchGate = map.getRandomTile().setSwitchGate(i);
            map.getRandomTile().setSwitch(switchGate);
        }

        var numWallTiles = Math.floor(Game.levelNumber * config('wallTilesPerLevel'));
        for (var i = 0; i < numWallTiles; i++) {
            map.getRandomTile().setWallTile();
        }

        if (config('limitedMoves')) {
            playerEntity.setMoveCounter(Crafty.e('MoveCounter'));
            playerEntity.setMoveLimit(map.getMoveLimit());
        }

        if (config('playerHealth') > 0) {
            playerEntity.setHealthCounter(Crafty.e('HealthCounter'));
        }

        if (config('allowAntiVirusEntities')) {
            var numAntiViruses = Math.floor(Game.levelNumber * config('antiVirusesPerLevel'));
            for (i = 0; i < numAntiViruses; i++) {
                Crafty.e('AntiVirus').placeInRandomTile();
            }
        }

        if (config('timerSeconds') > 0) {
            Crafty.e('GameOverTimer').startTimer();
        }

    },

    preStart: function() {
        map.newSeed();
        Game.start();
    },

    completeLevel: function() {
        console.log('Level ' + Game.levelNumber.toString() + ' complete! ' +
                    'Starting level ' + (Game.levelNumber + 1).toString() + '.');
        Game.levelNumber += 1;
        this.cleanUp();
        this.start();
    },

    loseLevel: function() {
        console.log('You died at level ' + Game.levelNumber.toString() + "!");
        Game.levelNumber = 1;
        this.cleanUp();
        this.preStart();
    },

    cleanUp: function() {
        // copypaste from house of jinn
        var everything = Crafty("*");
        for (var i = 0; i < everything.length; i++) {
            Crafty(everything[i]).destroy();
        }
    }
};

window.addEventListener('load', Game.preStart);
