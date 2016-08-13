var MAP_WIDTH = 1024;
var MAP_HEIGHT = 512;

var COLOR_FLOOR = '#111215';
var COLOR_VOID = '#000';

var getRandom = function(iMin, iMax) {
  return Math.round((Math.random() * (iMax - iMin)) + iMin);
};

this.Map = function(x, y, width, height) {
  this.width = width; 
  this.height = height; 
  this.x = x; 
  this.y = y; 
};

var Dungeon = function(roomNumber, minSize, maxSize, mapWidth, mapHeight) {
  this.roomNumber = roomNumber;
  this.maxSize = maxSize;
  this.minSize = minSize;
  this.mapWidth = mapWidth;
  this.mapHeight = mapHeight;
  this.rooms = [];

  this.generate = function() {
    while (this.rooms.length < this.roomNumber) {
      var newRoom = this.createNonOverlappingRoom();
      this.rooms.push(newRoom);
      console.log(newRoom);
    }
  }

  this.createNonOverlappingRoom = function() {
    var newRoom = new Map();
    do {
      newRoom.width = getRandom(this.minSize, this.maxSize);
      newRoom.height = getRandom(this.minSize, this.maxSize);
      newRoom.x = getRandom(0, this.mapWidth - newRoom.width);
      newRoom.y = getRandom(0, this.mapHeight - newRoom.height);
    } while (this.hasCollision(newRoom));
    return newRoom;
  }

  this.hasCollision = function(room) {
    for (var i in this.rooms) {
      if (room.x > this.rooms[i].x + this.rooms[i].width || room.y > this.rooms[i].y + this.rooms[i].height ||
          room.x + room.width < this.rooms[i].x || room.y + room.height < this.rooms[i].y)
        continue;
      return true;
    }
    return false;
  }

}

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
        for (var y = 0; y < this.height; y++)
            for (var x = 0; x < this.width; x++){
                if (y % 2 == 0 && x % 2 == 0) this.context.fillStyle = COLOR_FLOOR;
                else this.context.fillStyle = COLOR_VOID;
                this.context.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
            }
    }
};
Renderer.Init();

var generateNewDungeon = function() {
  var roomNumber = +document.getElementById('rooms').value;
  var maxSize = +document.getElementById('maxSize').value;
  var minSize = +document.getElementById('minSize').value;
  
  var newDungeon = new Dungeon(roomNumber, minSize, maxSize, MAP_WIDTH, MAP_HEIGHT);
  newDungeon.generate();

  Renderer.Render();
}
