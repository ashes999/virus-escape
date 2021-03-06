// The entity occupying a tile
Crafty.c('TileEntity', {
    init: function() {
        this.requires('Actor')
            .size(config('tileSize') / 2, config('tileSize') / 2);

        // Must be implemented in every sub-class
        this.nameInTile = 'Default';

    },

    moveTo: function(newTile) {
        this.tile = newTile;
        newTile.enter(this);

        this.move(newTile.x * (config("tileSize") + config("padding")) + config("padding") * 2,
                  newTile.y * (config("tileSize") + config("padding")) + config("padding") * 2);

        return this;
    },

    placeInRandomTile: function(awayFromTile) {
        this.moveTo(map.getRandomTile(awayFromTile));

        return this;
    }
});