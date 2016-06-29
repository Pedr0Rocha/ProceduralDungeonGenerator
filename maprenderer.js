var MAP_WIDTH = 1024;
var MAP_HEIGHT = 512;

var COLOR_FLOOR = '#111215';
var COLOR_VOID = '#000';

var Renderer = {
    canvas: null,
    context: null,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    scale: 0,

    Init: function () {
        this.canvas = document.getElementById('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = canvas.getContext('2d');
        this.scale = this.canvas.width / this.canvas.height;
    },

    Render: function () {
        this.context.fillStyle = COLOR_FLOOR;
        for (var y = 0; y < this.height; y++)
            for (var x = 0; x < this.width; x++)
                this.context.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
    }
};

Renderer.Init();
Renderer.Render();