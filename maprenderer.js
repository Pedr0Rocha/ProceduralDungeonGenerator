var MAP_WIDTH = 1024;
var MAP_HEIGHT = 512;

var COLOR_FLOOR = '#444b5e';
var COLOR_VOID = '#000';

var getRandom = function(iMin, iMax) {
  return Math.round((Math.random() * (iMax - iMin)) + iMin);
};

this.Map = function(x, y, width, height) {
  this.width = width; 
  this.height = height; 
  this.x = x; 
  this.y = y; 

  this.toStr = function() {
    return "{ x:" + this.x + ", y:" + this.y + ", width:" + this.width +
      ", height:" + this.height + " }";
  }

  this.render = function(Renderer) {
    Renderer.DrawRect(this.x, this.y, this.width, this.height); 
  };
};

var Dungeon = {
  rooms: [],
  roomNumber: 0,
  maxSize: 0,
  minSize: 0,
  mapWidth: 0,
  mapHeight: 0,

  generate: function(roomNumber, minSize, maxSize, mapWidth, mapHeight) {
    this.roomNumber = roomNumber;
    this.maxSize = maxSize;
    this.minSize = minSize;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    while (this.rooms.length < this.roomNumber) {
      var newRoom = this.createNonOverlappingRoom();
      this.rooms.push(newRoom);
    }

    this.squashRooms(150);
  },

  createNonOverlappingRoom: function() {
    var newRoom = new Map();
    do {
      newRoom.width = getRandom(this.minSize, this.maxSize);
      newRoom.height = getRandom(this.minSize, this.maxSize);
      newRoom.x = getRandom(0, this.mapWidth - newRoom.width);
      newRoom.y = getRandom(0, this.mapHeight - newRoom.height);
    } while (this.hasCollision(newRoom));
    return newRoom;
  },

  hasCollision: function(room, ignore) {
    console.log('Checking: ' + room.toStr());
    for (var i in this.rooms) {
      if (ignore != undefined && ignore == i) continue;
      if (room.x > this.rooms[i].x + this.rooms[i].width || room.y > this.rooms[i].y + this.rooms[i].height ||
          room.x + room.width < this.rooms[i].x || room.y + room.height < this.rooms[i].y) {
        console.log(this.rooms[i].toStr());
        continue;
      }
      return true;
    }
    return false;
  },

  squashRooms: function(loops) {
    while (loops > 0) {
      for (var i in this.rooms) {
        this.rooms[i].x--;
        if (this.rooms[i].x < 0 || this.hasCollision(this.rooms[i], i))
          this.rooms[i].x++;

        this.rooms[i].y--;
        if (this.rooms[i].y < 0 || this.hasCollision(this.rooms[i], i))
          this.rooms[i].y++;
      }
      loops--;
    }
  },

  render: function(Renderer) {
    for (var i in this.rooms) {
      this.rooms[i].render(Renderer); 
    }
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

    this.context.fillStyle = COLOR_VOID;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  DrawRect: function(x, y, width, height) {
    this.context.fillStyle = COLOR_FLOOR; 
    this.context.fillRect(x, y, width, height);
  }

};

Renderer.Init();

var generateNewDungeon = function() {
  var roomNumber = +document.getElementById('rooms').value;
  var maxSize = +document.getElementById('maxSize').value;
  var minSize = +document.getElementById('minSize').value;

  Dungeon.generate(roomNumber, minSize, maxSize, MAP_WIDTH, MAP_HEIGHT);
  Dungeon.render(Renderer);
}
