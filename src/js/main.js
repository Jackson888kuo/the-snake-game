import '../css/style.css';

// 遊戲配置
const GRID_SIZE = 20;
const TILE_COUNT = 20;

class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = GRID_SIZE * TILE_COUNT;
    this.canvas.height = GRID_SIZE * TILE_COUNT;
    document.querySelector('#app').innerHTML = '';
    document.querySelector('#app').appendChild(this.canvas);
    
    // 遊戲狀態
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.speed = 150; // 移動速度（毫秒）
    this.lastRenderTime = 0;
    this.gameLoopId = null;
    
    // 蛇的初始狀態
    this.resetGame();
    
    // 初始化遊戲
    this.init();
    
    // 開始遊戲循環
    this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  
  resetGame() {
    // 蛇的初始位置和方向
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.direction = 'right';
    this.nextDirection = 'right';
    
    // 生成第一個食物
    this.food = this.generateFood();
    
    // 重置遊戲狀態
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.speed = 150;
  }
  
  init() {
    // 初始化遊戲元素
    this.setupEventListeners();
    this.drawGame();
  }
  
  setupEventListeners() {
    // 鍵盤控制
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }
  
  handleKeyPress(e) {
    // 處理按鍵輸入
    switch (e.key) {
      case 'ArrowUp':
        if (this.direction !== 'down') this.nextDirection = 'up';
        break;
      case 'ArrowDown':
        if (this.direction !== 'up') this.nextDirection = 'down';
        break;
      case 'ArrowLeft':
        if (this.direction !== 'right') this.nextDirection = 'left';
        break;
      case 'ArrowRight':
        if (this.direction !== 'left') this.nextDirection = 'right';
        break;
    }
  }
  
  drawGame() {
    // 清空畫布
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 繪製網格（輔助線）
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
      // 垂直線
      this.ctx.beginPath();
      this.ctx.moveTo(i * GRID_SIZE, 0);
      this.ctx.lineTo(i * GRID_SIZE, this.canvas.height);
      this.ctx.stroke();
      
      // 水平線
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * GRID_SIZE);
      this.ctx.lineTo(this.canvas.width, i * GRID_SIZE);
      this.ctx.stroke();
    }
    
    // 繪製蛇
    this.snake.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
      this.ctx.fillRect(
        segment.x * GRID_SIZE, 
        segment.y * GRID_SIZE, 
        GRID_SIZE - 1, 
        GRID_SIZE - 1
      );
    });
    
    // 繪製食物
    this.ctx.fillStyle = '#FF5252';
    this.ctx.fillRect(
      this.food.x * GRID_SIZE, 
      this.food.y * GRID_SIZE, 
      GRID_SIZE - 1, 
      GRID_SIZE - 1
    );
    
    // 繪製分數和關卡
    this.ctx.fillStyle = '#333';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
    this.ctx.fillText(`Level: ${this.level}`, 100, 20);
  }
  
  update() {
    // 更新蛇的位置
    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };
    
    // 根據方向移動蛇頭
    switch (this.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }
    
    // 檢查碰撞
    if (this.checkCollision(head)) {
      this.gameOver = true;
      return;
    }
    
    // 移動蛇
    this.snake.unshift(head);
    
    // 檢查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.food = this.generateFood();
      
      // 每得100分升一級，增加速度
      if (this.score % 100 === 0) {
        this.level++;
        this.speed = Math.max(50, this.speed - 10);
      }
    } else {
      // 如果沒吃到食物，移除尾部
      this.snake.pop();
    }
  }
  
  checkCollision(head) {
    // 檢查是否撞牆
    if (
      head.x < 0 || 
      head.x >= TILE_COUNT || 
      head.y < 0 || 
      head.y >= TILE_COUNT
    ) {
      return true;
    }
    
    // 檢查是否撞到自己
    return this.snake.some((segment, index) => {
      // 跳過蛇頭
      if (index === 0) return false;
      return segment.x === head.x && segment.y === head.y;
    });
  }
  
  generateFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
    } while (
      // 確保食物不會生成在蛇身上
      this.snake.some(segment => segment.x === food.x && segment.y === food.y)
    );
    return food;
  }
  
  gameLoop(timestamp) {
    if (this.gameOver) {
      this.gameOverScreen();
      return;
    }
    
    // 使用 requestAnimationFrame 計時
    if (!this.lastRenderTime) this.lastRenderTime = timestamp;
    const deltaTime = timestamp - this.lastRenderTime;
    
    if (deltaTime >= this.speed) {
      this.lastRenderTime = timestamp;
      this.update();
    }
    
    this.drawGame();
    this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  
  stopGame() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }
  
  gameOverScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'center';
    this.ctx.font = '36px Arial';
    this.ctx.fillText('遊戲結束', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`最終分數: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
    this.ctx.fillText(`關卡: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    this.ctx.fillText('按 R 鍵重新開始', this.canvas.width / 2, this.canvas.height / 2 + 70);
  }
}

// 啟動遊戲
const initGame = () => {
  const game = new Game();
  
  // 重新開始遊戲的快捷鍵
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
      document.querySelector('#app').innerHTML = '';
      new Game();
    }
  });};

// 確保 DOM 載入完成後再初始化遊戲
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
