var MAP_WIDTH = 1024;
var MAP_HEIGHT = 512;

var COLOR_FLOOR = '#444b5e';
var COLOR_WALL = '#ffeeff';
var COLOR_VOID = '#000';

var getRandom = function(iMin, iMax) {
  return Math.round((Math.random() * (iMax - iMin)) + iMin);
};

this.Rect = function(x, y, width, height) {
  this.width = width; 
  this.height = height; 
  this.x = x; 
  this.y = y; 

  this.toStr = function() {
    return "{ x:" + this.x + ", y:" + this.y + ", width:" + this.width +
      ", height:" + this.height + " }";
  };

  this.renderWalls = function(Renderer) {
    Renderer.DrawRect(this.x, this.y, this.width, this.height, COLOR_WALL); 
  };

  this.renderFloor = function(Renderer) {
    Renderer.DrawRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4, COLOR_FLOOR); 
  };
};

var Dungeon = {
  rooms: [],
  aisle: [],
  aisleLen: 10,
  maxAisle: 2,
  roomNumber: 0,
  maxSize: 0,
  minSize: 0,
  mapWidth: 0,
  mapHeight: 0,

  clear: function() {
    this.rooms = []; 
    this.aisle = [];
  },

  generate: function(roomNumber, minSize, maxSize, mapWidth, mapHeight, sparseDungeon) {
    this.roomNumber = roomNumber;
    this.maxSize = maxSize;
    this.minSize = minSize;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.gap = sparseDungeon ? 50 : 1;

    while (this.rooms.length < this.roomNumber) {
      var newRoom = this.createNonOverlappingRoom();
      this.rooms.push(newRoom);
    }

    this.squashRooms(200, this.gap);
    this.conectRooms();

    console.log("Aisles created: " + this.aisle.length);
  },

  createNonOverlappingRoom: function() {
    var newRoom = new Rect();
    do {
      newRoom.width = getRandom(this.minSize, this.maxSize);
      newRoom.height = getRandom(this.minSize, this.maxSize);
      newRoom.x = getRandom(0, this.mapWidth - newRoom.width);
      newRoom.y = getRandom(0, this.mapHeight - newRoom.height);
    } while (this.hasCollision(newRoom));
    return newRoom;
  },

  hasCollision: function(room, ignore) {
    for (var i in this.rooms) {
      if (ignore != undefined && ignore == i) continue;
      if (room.x > this.rooms[i].x + this.rooms[i].width || room.y > this.rooms[i].y + this.rooms[i].height ||
          room.x + room.width < this.rooms[i].x || room.y + room.height < this.rooms[i].y) {
        continue;
      }
      return true;
    }
    return false;
  },

  squashRooms: function(loops, gap) {
    while (loops > 0) {
      for (var i in this.rooms) {
        this.rooms[i].x -= gap;
        if (this.rooms[i].x < 0 || this.hasCollision(this.rooms[i], i))
          this.rooms[i].x += gap;

        this.rooms[i].y -= gap;
        if (this.rooms[i].y < 0 || this.hasCollision(this.rooms[i], i))
          this.rooms[i].y += gap;
      }
      loops--;
    }
  },

  getCenter: function(room) {
    var center = {
      x: room.x + Math.round(room.width / 2),
      y: room.y + Math.round(room.height / 2)
    };
    return center;
  },

  getDistanceFromAll: function() {
    var distance = [];
    for (var i in this.rooms) {
      distance[i] = [];
      for (var j in this.rooms) {
        if (i == j) {
          distance[i][j] = 0;
          continue;
        }

        var centerI = this.getCenter(this.rooms[i]);
        var centerJ = this.getCenter(this.rooms[j]);
        var ijDistance = Math.sqrt(
            Math.pow(Math.abs(centerI.x - centerJ.x), 2) + 
            Math.pow(Math.abs(centerI.y - centerJ.y), 2)
            );

        distance[i][j] = ijDistance;
      }
    }
    return distance;
  },

  connect: function(i, j) {
    var iRoom = this.rooms[i];
    var jRoom = this.rooms[j];

    var vAisle;
    var hAisle;

    var leftyRoom = (iRoom.x < jRoom.x) ? iRoom : jRoom;
    var rightyRoom = (iRoom.x < jRoom.x) ? jRoom : iRoom;

    var lastY = leftyRoom.y;
    var lastX = leftyRoom.x + Math.round(leftyRoom.width / 2);

    var vAlignAisle = (leftyRoom.x + leftyRoom.width - rightyRoom.x) < this.aisleLen;
    var hAlignAisle = (leftyRoom.y + leftyRoom.height - rightyRoom.y) < this.aisleLen;

    if (vAlignAisle) {
      hAisle = new Rect();
      hAisle.y = getRandom(leftyRoom.y, leftyRoom.y + leftyRoom.height - this.aisleLen);
      hAisle.x = leftyRoom.x + Math.round(leftyRoom.width / 2);
      hAisle.height = this.aisleLen;
      hAisle.width = Math.abs(leftyRoom.x - rightyRoom.x) + this.aisleLen;

      lastY = hAisle.y;
      lastX = hAisle.x + hAisle.width - this.aisleLen;
    }

    if (hAlignAisle) {
      vAisle = new Rect();
      if (leftyRoom.y < rightyRoom.y)
        vAisle.y = lastY;
      else
        vAisle.y = rightyRoom.y + rightyRoom.height; 
      vAisle.x = lastX;
      vAisle.height = Math.abs(lastY - rightyRoom.y) + this.aisleLen;
      vAisle.width = this.aisleLen;
    }

    if (vAlignAisle && hAlignAisle) {
      console.log("Called");
    }

    if (vAisle != undefined) {
      this.aisle.push(vAisle);
      console.log("vAisle: " + vAisle.toStr());
    }

    if (hAisle != undefined) {
      this.aisle.push(hAisle);
      console.log("hAisle: " + hAisle.toStr());
    }

  },

  getNearestRoom: function(distances, i) {
    var nearestRoom;
    var minDistance = undefined;
    for (var j in this.rooms) {
      if (distances[i][j] == 0) continue;
      if (minDistance == undefined || distances[i][j] < minDistance) {
        minDistance = distances[i][j];
        nearestRoom = j;
      }
    }
    console.log("Connecting " + i + " with " + nearestRoom + " - dist: " + minDistance);
    return nearestRoom;
  },

  conectRooms: function() {
    var connected = {};
    for (var i in this.rooms) {
      connected[i] = false;
    } 

    var distance = this.getDistanceFromAll();
    for (var i in this.rooms) {
      if (connected[i])
        continue;

      for (var k = 0; k < getRandom(1, this.maxAisle); k++) {
        nearestRoom = this.getNearestRoom(distance, i);
        this.connect(i, nearestRoom);
        connected[i] = true;
        distance[i][nearestRoom] = 0;
      }
    }
  },

  renderFloor: function(Renderer) {
    for (var i in this.rooms)
      this.rooms[i].renderFloor(Renderer); 

    for (var i in this.aisle)
      this.aisle[i].renderFloor(Renderer);
  },

  renderWalls: function(Renderer) {
    for (var i in this.rooms)
      this.rooms[i].renderWalls(Renderer); 

    for (var i in this.aisle)
      this.aisle[i].renderWalls(Renderer);
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

  DrawRect: function(x, y, width, height, color) {
    this.context.fillStyle = color; 
    this.context.fillRect(x, y, width, height);
  }

};

Renderer.Init();

var generateNewDungeon = function() {
  Renderer.Init();

  var roomNumber = +document.getElementById('rooms').value;
  var maxSize = +document.getElementById('maxSize').value;
  var minSize = +document.getElementById('minSize').value;
  var sparseDungeon = document.getElementById('dungeonType').checked;

  Dungeon.clear();
  Dungeon.generate(roomNumber, minSize, maxSize, MAP_WIDTH, MAP_HEIGHT, sparseDungeon);
  Dungeon.renderWalls(Renderer);
  Dungeon.renderFloor(Renderer);
}
