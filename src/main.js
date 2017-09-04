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
        
        map.init();

        Crafty.e("Level").loadMap(map);
        Crafty.e("Player").move(16, 16);
    }
}

window.addEventListener('load', Game.start);