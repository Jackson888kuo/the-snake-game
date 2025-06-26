import { GRID_SIZE, TILE_COUNT } from './config.js';

export class Game {
  constructor(containerId) {
    if (!containerId) {
      console.error('錯誤：未提供容器 ID');
      return;
    }
    
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`錯誤：找不到 ID 為 ${containerId} 的容器`);
      return;
    }
    
    // 創建畫布
    this.canvas = document.createElement('canvas');
    this.canvas.width = GRID_SIZE * TILE_COUNT;
    this.canvas.height = GRID_SIZE * TILE_COUNT;
    this.canvas.tabIndex = 0; // 使畫布可以獲得焦點
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // 初始化遊戲狀態
    this.gameOver = false;
    this.paused = false;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    this.level = 1;
    this.speed = 150; // 移動速度（毫秒）
    this.lastRenderTime = 0;
    this.gameLoopId = null;
    
    // 初始化蛇
    this.resetGame();
    
    // 設置事件監聽器
    this.setupEventListeners();
    
    // 開始遊戲循環
    this.startGame();
  }
  
  resetGame() {
    // 重置遊戲狀態
    this.gameOver = false;
    this.paused = false;
    this.score = 0;
    this.level = 1;
    this.speed = 150;
    
    // 重置蛇的初始位置
    const startX = Math.floor(TILE_COUNT / 3);
    this.snake = [
      { x: startX, y: Math.floor(TILE_COUNT / 2) },
      { x: startX - 1, y: Math.floor(TILE_COUNT / 2) },
      { x: startX - 2, y: Math.floor(TILE_COUNT / 2) }
    ];
    
    this.direction = 'right';
    this.nextDirection = 'right';
    
    // 生成初始食物
    this.food = this.generateFood();
    
    // 更新分數顯示
    this.updateScore();
  }
  
  setupEventListeners() {
    // 綁定 this 到事件處理函數
    this.boundHandleKeyPress = this.handleKeyPress.bind(this);
    
    // 添加事件監聽器
    document.addEventListener('keydown', this.boundHandleKeyPress);
    
    // 確保畫布可以獲得焦點
    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
    });
  }
  
  handleKeyPress(e) {
    if (this.gameOver) {
      if (e.key.toLowerCase() === 'r') {
        // 發送一個自定義事件來請求遊戲重啟
        const restartEvent = new CustomEvent('restartgame');
        document.dispatchEvent(restartEvent);
      }
      return;
    }
    
    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        if (this.direction !== 'down') this.nextDirection = 'up';
        break;
      case 'arrowdown':
      case 's':
        if (this.direction !== 'up') this.nextDirection = 'down';
        break;
      case 'arrowleft':
      case 'a':
        if (this.direction !== 'right') this.nextDirection = 'left';
        break;
      case 'arrowright':
      case 'd':
        if (this.direction !== 'left') this.nextDirection = 'right';
        break;
      case 'p':
        this.togglePause();
        break;
    }
    
    // 防止默認行為（如頁面滾動）
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }
  
  togglePause() {
    this.paused = !this.paused;
    console.log('遊戲', this.paused ? '已暫停' : '已繼續');
    
    if (!this.paused) {
      this.lastRenderTime = performance.now();
      this.gameLoop();
    }
  }
  
  updateScore() {
    const scoreElement = document.getElementById('score-display') || this.createScoreDisplay();
    if (scoreElement) {
      scoreElement.textContent = `分數: ${this.score} | 最高分: ${this.highScore} | 等級: ${this.level}`;
    }
  }
  
  createScoreDisplay() {
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score-display';
    scoreElement.style.position = 'absolute';
    scoreElement.style.top = '10px';
    scoreElement.style.left = '10px';
    scoreElement.style.color = 'white';
    scoreElement.style.fontFamily = 'Arial, sans-serif';
    scoreElement.style.fontSize = '16px';
    scoreElement.style.textShadow = '1px 1px 2px black';
    
    document.body.appendChild(scoreElement);
    return scoreElement;
  }
  
  startGame() {
    console.log('遊戲開始');
    this.lastRenderTime = performance.now();
    this.gameLoop();
  }
  
  stopGame() {
    console.log('遊戲停止');
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
    
    // 移除事件監聽器
    if (this.boundHandleKeyPress) {
      document.removeEventListener('keydown', this.boundHandleKeyPress);
    }
  }
  
  gameLoop(timestamp) {
    if (this.gameOver || this.paused) {
      if (this.gameOver) {
        this.drawGameOver();
      }
      return;
    }
    
    const deltaTime = timestamp - this.lastRenderTime;
    
    if (deltaTime >= this.speed) {
      this.update();
      this.lastRenderTime = timestamp;
    }
    
    this.draw();
    
    if (!this.gameOver) {
      this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }
  
  update() {
    // 更新方向
    this.direction = this.nextDirection;
    
    // 創建新的蛇頭
    const head = { ...this.snake[0] };
    
    // 根據方向移動蛇頭
    switch (this.direction) {
      case 'up':
        head.y--;
        break;
      case 'down':
        head.y++;
        break;
      case 'left':
        head.x--;
        break;
      case 'right':
        head.x++;
        break;
    }
    
    // 檢查碰撞
    if (this.checkCollision(head)) {
      this.gameOver = true;
      console.log('遊戲結束！分數:', this.score);
      return;
    }
    
    // 移動蛇
    this.snake.unshift(head);
    
    // 檢查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      // 增加分數
      this.score += 10;
      
      // 更新最高分
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('snakeHighScore', this.highScore.toString());
      }
      
      // 每100分升一級，提高速度
      if (this.score % 100 === 0) {
        this.level++;
        this.speed = Math.max(50, this.speed - 10);
      }
      
      // 生成新食物
      this.food = this.generateFood();
      
      // 更新分數顯示
      this.updateScore();
    } else {
      // 如果沒吃到食物，移除尾部
      this.snake.pop();
    }
  }
  
  checkCollision(head) {
    // 檢查是否撞牆
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      return true;
    }
    
    // 檢查是否撞到自己
    return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
  }
  
  generateFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
    } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
    
    return food;
  }
  
  draw() {
    // 清空畫布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 繪製網格背景
    this.drawGrid();
    
    // 繪製蛇
    this.snake.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#2E7D32';
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
    
    // 如果遊戲結束，顯示遊戲結束畫面
    if (this.gameOver) {
      this.drawGameOver();
    }
  }
  
  drawGrid() {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 0.5;
    
    // 繪製垂直線
    for (let x = 0; x <= this.canvas.width; x += GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // 繪製水平線
    for (let y = 0; y <= this.canvas.height; y += GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  drawGameOver() {
    // 半透明黑色背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 設置文字樣式
    this.ctx.fillStyle = 'white';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // 顯示遊戲結束信息
    this.ctx.fillText('遊戲結束', this.canvas.width / 2, this.canvas.height / 2 - 40);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`你的分數: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText('按 R 鍵重新開始', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }
}
