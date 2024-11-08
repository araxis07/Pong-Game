function Game(canvasId) {
  this.game = this;
  this.id = canvasId;
  this.canvas = document.getElementById(this.id);
  this.context = this.canvas.getContext("2d");

  this.width = 0;
  this.height = 0;

  setTimeout(function () {
    document.addEventListener("keydown", this.game.fireKeyDown);
    document.addEventListener("keyup", this.game.fireKeyUp);
  }, 50);

  this.timer = setInterval(function () {
    game.tick();
  }, 10);

  window.onkeydown = function (e) {
    return !(e.keyCode == 32);
  };

  function intersects(circle, rect) {
    var circleDistance = {};
    circleDistance.x = Math.abs(circle.x - rect.left);
    circleDistance.y = Math.abs(circle.y - rect.top);

    if (circleDistance.x > rect.width / 2 + circle.rad) {
      return false;
    }
    if (circleDistance.y > rect.height / 2 + circle.rad) {
      return false;
    }

    if (circleDistance.x <= rect.width / 2) {
      return true;
    }
    if (circleDistance.y <= rect.height / 2) {
      return true;
    }

    var cornerDistance_sq = Math.pow(circleDistance.x - rect.width / 2, 2) + Math.pow(circleDistance.y - rect.height / 2, 2);

    return cornerDistance_sq <= Math.pow(circle.r, 2);
  }

  function Ball(boundWidth, boundHeight) {
    this.x = Math.random() * (boundWidth / 5) + (2 * boundWidth) / 5;
    this.y = Math.random() * (boundHeight / 2) + (2 * boundHeight) / 4;
    this.dx = Math.random() > 0.5 ? -1 : 1;
    this.dy = Math.random() > 0.5 ? -1 : 1;
    this.rad = 10;
    this.color = "#fff";
    this.speed = 2;

    this.set = function (newX, newY) {
      this.x = newX;
      this.y = newY;
    };

    this.setD = function (_dx, _dy) {
      this.dx = _dx;
      this.dy = _dy;
    };

    this.randomDiretion = function () {
      this.dx = Math.random() > 0.5 ? -1 : 1;
      this.dy = Math.random() > 0.5 ? -1 : 1;
    };

    this.update = function () {
      var nextX = this.x + this.dx;
      var nextY = this.y + this.dy;
      if (nextX < this.rad || nextX > boundWidth - this.rad) {
        this.dx *= -1;
      }
      if (nextY < this.rad || nextY > boundHeight - this.rad) {
        this.dy *= -1;
      }
      this.x += this.dx * this.speed;
      this.y += this.dy * this.speed;
    };

    this.draw = function (context) {
      var oldStyle = context.fillStyle;
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.x, this.y, this.rad, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
      context.fillStyle = oldStyle;
    };

    this.collide = function (racket) {
      if (!racket) return false;
      var rect = {
        left: racket.x,
        top: racket.y,
        width: racket.width,
        height: racket.height,
      };

      if (intersects(this, rect)) {
        var incidencePercent = (2 * (this.y - rect.top)) / rect.height;
        this.dx *= -1;
        this.dy += incidencePercent;
        this.dy = Math.min(this.dy, 2);
        this.dy = Math.max(this.dy, -2);
        return true;
      } else {
        return false;
      }
    };
  }

  function Racket(x, size, color, boundHeight) {
    this.x = x;
    this.y = boundHeight / 2;
    this.width = 10;
    this.height = size;
    this.left = this.x - this.width / 2;
    this.right = this.x - this.width / 2;
    this.dy = 0;
    this.direction = 0;
    this.draw = function (context) {
      context.fillStyle = color;
      context.fillRect(this.left, this.y - this.height / 2, this.width, this.height);
    };
    this.accelate = function (dy) {
      this.dy += dy;
    };

    this.call = 0;
    this.update = function () {
      if (++this.call % 10 == 0) {
        this.dy *= 0.7;
        this.call = 0;
      }

      if (Math.abs(this.dy) < 1e-10) this.dy = 0;

      this.y = this.y + this.dy / 10;
      if (this.y - this.height / 2 < 0 || this.y + this.height / 2 > boundHeight) {
        this.y = Math.max(this.y, this.height / 2);
        this.y = Math.min(this.y, boundHeight - this.height / 2);
        this.dy = 0;
      }
    };
  }

  this.init = function (stageName) {
    this.stage = stageName;
    if (!this.balls) this.balls = [];
    this.racket1 = this.racket2 = null;
  };

  this.state = function (stageName) {
    var width = this.context.canvas.width;
    var height = this.context.canvas.height;

    this.init(stageName);

    if (stageName == "PLAY_SOLO" || stageName == "PLAY_DUO") {
      this.balls = [];
      this.racket1_score = 0;
      this.racket2_score = 0;
      this.racket1 = new Racket((1 * width) / 10, height / 5, "#fff", height);
      this.racket2 = new Racket((9 * width) / 10, height / 5, "#fff", height);
      this.pushBall(1, "#fff");
    } else if (stageName == "GAME_OVER") {
      this.balls = [];
    }
  };

  this.draw = function (context) {
    var width = context.canvas.width;
    var height = context.canvas.height;
    context.clearRect(0, 0, width, height);

    for (let i in this.balls) {
      this.balls[i].draw(context);
    }

    var defaultColor = "#FFFFFF";

    context.font = "40px VT323";
    context.fillStyle = defaultColor;
    context.textAlign = "center";

    if (this.stage === "SELECT_COMPUTER") {
      context.fillText("COMPUTER LEVEL", width / 2, height / 4);
      context.fillText("1. easy", width / 2, height / 4 + 80);
      context.fillText("2. medium", width / 2, height / 4 + 160);
      context.fillText("3. hard", width / 2, height / 4 + 240);

    } else if (this.stage == "GAME_OVER") {
      context.fillStyle = "rgba(255,255,255,0.5)";
      context.textAlign = "center";
      context.font = "100px VT323";
      context.fillText(this.racket1_score, width / 4, height / 2 + 40);
      context.fillText(this.racket2_score, (3 * width) / 4, height / 2 + 40);

      context.font = "40px VT323";
      context.fillStyle = defaultColor;
      context.fillText("GAME OVER", width / 2, height / 3 - 60);
      context.fillStyle = "#f7ca18";
      context.fillText(this.game_result_text, width / 2, height / 3);
      context.fillStyle = defaultColor;
      context.fillText("press SPACE to back", width / 2, (4 * height) / 5);
    } else if (this.stage == "PLAY_SOLO" || this.stage == "PLAY_DUO") {
      context.strokeStyle = "rgba(255,255,255,0.5)";
      context.beginPath();
      context.moveTo(width / 2, 0);
      context.lineTo(width / 2, height);
      context.stroke();
      context.closePath();

      context.fillStyle = "rgba(255,255,255,0.5)";
      context.textAlign = "center";
      context.font = "100px VT323";
      context.fillText(this.racket1_score, width / 4, height / 2 + 40);
      context.fillText(this.racket2_score, (3 * width) / 4, height / 2 + 40);
      context.font = "40px VT323";

      var hud = {
        PLAY_SOLO: ["COM", "YOU"],
        PLAY_DUO: ["PLAYER1", "PLAYER2"],
      };

      for (var i in hud) {
        context.fillText(hud[this.stage][0], (1 * width) / 4, height / 4 + 40);
        context.fillText(hud[this.stage][1], (3 * width) / 4, height / 4 + 40);
      }

      this.racket1.draw(context);
      this.racket2.draw(context);
    }
  };

  this.keypress_table = {};
  this.fireKeyDown = function (event) {
    var _this = game;
    _this.keypress_table[event.code.toString()] = true;

    if (_this.stage == "GAME_OVER") {
      switch (event.code) {
        case "Space":
          _this.state("SELECT_COMPUTER");
          _this.start();
          break;
      }
    } else if (_this.stage == "SELECT_COMPUTER") {
      switch (event.key) {
        case "1":
          _this.computer_level = 1;
          _this.state("PLAY_SOLO");
          break;
        case "2":
          _this.computer_level = 2;
          _this.state("PLAY_SOLO");
          break;
        case "3":
          _this.computer_level = 3;
          _this.state("PLAY_SOLO");
          break;
        case "Escape":
          _this.state("SELECT_COMPUTER");
          break;
      }
    }
  };

  this.fireKeyUp = function (event) {
    game.keypress_table[event.code.toString()] = false;
  };

  this.update = function () {
    if (this.stage == "PLAY_SOLO") {
      if (this.keypress_table["ArrowUp"]) if (this.racket2) this.racket2.accelate(-5);
      if (this.keypress_table["ArrowDown"]) if (this.racket2) this.racket2.accelate(+5);

      if (this.stage == "PLAY_SOLO" && this.racket1) {
        var accuracy = parseInt(this.computer_level || 1) - 1;
        var isDiffrentPosition = this.balls && this.racket1.y != this.balls[0];
        if (Math.random() < [0.3, 0.5, 0.9][accuracy] && isDiffrentPosition) this.racket1.accelate(5 * (this.balls[0].y < this.racket1.y ? -1 : 1));

        var tickSometime = Math.random() < 0.1;
        if (tickSometime) {
          if (this.racket1.y <= this.racket1.height / 2 + 10) this.racket1.accelate(+40);
          if (this.racket1.y >= this.context.canvas.height - this.racket1.height / 2 - 10) this.racket1.accelate(-40);
        }
      }
    }
    for (var i in this.balls) {
      this.balls[i].collide(this.racket1);
      this.balls[i].collide(this.racket2);
      this.balls[i].update();

      if (this.racket1 && this.racket2) {
        if (this.balls[i].x < this.racket1.left - this.racket2.width) {
          this.scoring(0, +1);
          this.popAndNewBall(i);
        } else if (this.balls[i].x > this.racket2.right + this.racket2.width) {
          this.scoring(+1, 0);
          this.popAndNewBall(i);
        }
      }
    }

    if (this.stage == "PLAY_SOLO") {
      if (this.racket1_score > 3) {
        if (this.stage == "PLAY_SOLO") this.game_result_text = "COMPUTER WIN";
        return "GAME_OVER";
      }
      if (this.racket2_score > 3) {
        if (this.stage == "PLAY_SOLO") this.game_result_text = "PLAYER WIN";
        return "GAME_OVER";
      }
    }

    if (this.racket1) this.racket1.update();
    if (this.racket2) this.racket2.update();
    return "UPDATED";
  };

  this.tick = function () {
    if (this.update() == "GAME_OVER") {
      this.state("GAME_OVER");
    }

    this.draw(this.context);
  };

  this.timer = 0;
  this.start = function () {
    this.init("SELECT_COMPUTER");

    for (var i = 0; i < 5; ++i) {
      this.pushBall(Math.floor(Math.random() * 5), "#" + Math.random().toString(16).substring(2, 6));
    }
  };

  this.stop = function () {
    clearInterval(this.timer);
  };

  this.pushBall = function (ball_number, color, delay) {
    if (!delay) delay = 0;
    var width = this.context.canvas.width;
    var height = this.context.canvas.height;

    for (var i = 0; i < ball_number; ++i) {
      var ball = new Ball(width, height);
      ball.rad = 12;
      ball.color = color;
      ball.speed = 4;

      if (delay) {
        ball.setD(0, 0);
        setTimeout(function () {
          ball.randomDiretion();
        }, delay);
      }
      this.balls.push(ball);
    }
  };

  this.popAndNewBall = function (ball_index) {
    this.balls = [];
    this.pushBall(1, "#fff", 1000);
  };

  this.scoring = function (score1, score2) {
    this.racket1_score += score1;
    this.racket2_score += score2;
  };
}

var game = new Game("pingpong");
game.start();
game.pushBall(1);