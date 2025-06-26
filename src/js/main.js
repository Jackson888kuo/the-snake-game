import '../css/style.css';

// 遊戲配置
const GRID_SIZE = 20;
const TILE_COUNT = 20;

// 遊戲狀態管理
class GameState {
  constructor() {
    this.currentScreen = 'start'; // 'start' 或 'game'
    this.game = null;
    this.gameContainer = 'game-container';
    console.log('GameState 初始化，遊戲容器 ID:', this.gameContainer);
  }
  
  showScreen(screenName) {
    console.log('切換畫面到:', screenName);
    this.currentScreen = screenName;
    
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (startScreen) {
      startScreen.classList.toggle('hidden', screenName !== 'start');
    } else {
      console.error('錯誤：找不到開始畫面元素');
    }
    
    if (gameScreen) {
      gameScreen.classList.toggle('hidden', screenName !== 'game');
      
      // 如果是切換到遊戲畫面，確保遊戲容器存在
      if (screenName === 'game') {
        let container = document.getElementById('game-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'game-container';
          gameScreen.innerHTML = '';
          gameScreen.appendChild(container);
        }
      }
    } else {
      console.error('錯誤：找不到遊戲畫面元素');
    }
    
    console.log('畫面切換完成:', {
      startScreenHidden: startScreen ? startScreen.classList.contains('hidden') : 'N/A',
      gameScreenHidden: gameScreen ? gameScreen.classList.contains('hidden') : 'N/A'
    });
  }
  
  startGame() {
    this.showScreen('game');
    if (this.game) {
      this.game.stopGame();
      this.game = null;
    }
    
    this.game = new Game(this.gameContainer);
    if (this.game.canvas) {
      this.game.canvas.focus();
    }
  }
  
  restartGame() {
    console.log('=== 開始重置遊戲 ===');
    
    try {
      // 1. 確保遊戲畫面可見
      const gameScreen = document.getElementById('game-screen');
      if (gameScreen) {
        gameScreen.classList.remove('hidden');
      }
      
      // 2. 停止當前遊戲
      if (this.game) {
        console.log('正在停止當前遊戲...');
        this.game.stopGame();
        this.game = null;
      }
      
      // 3. 獲取或創建遊戲容器
      let container = document.getElementById('game-container');
      if (!container) {
        console.log('未找到 game-container，創建新的...');
        container = document.createElement('div');
        container.id = 'game-container';
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
          gameScreen.innerHTML = '';
          gameScreen.appendChild(container);
        } else {
          document.body.appendChild(container);
        }
      } else {
        // 清空現有容器
        container.innerHTML = '';
      }
      
      console.log('遊戲容器已準備好:', container);
      
      // 4. 創建新的遊戲實例
      console.log('正在創建新遊戲實例...');
      this.game = new Game('game-container');
      
      if (!this.game) {
        throw new Error('創建遊戲實例失敗');
      }
      
      // 5. 確保畫布獲得焦點
      if (this.game.canvas) {
        console.log('設置畫布焦點');
        this.game.canvas.focus();
      } else {
        console.warn('警告：無法獲取遊戲畫布');
      }
      
      console.log('=== 遊戲重置完成 ===');
      return true;
    } catch (error) {
      console.error('重置遊戲時發生錯誤:', error);
      return false;
    }
  }
}

// 初始化遊戲狀態
const gameState = new GameState();

// 開始畫面事件監聽
document.addEventListener('DOMContentLoaded', () => {
  // 啟動遊戲
  function initGame() {
    console.log('初始化遊戲...');
    
    // 確保開始畫面可見
    gameState.showScreen('start');
    
    // 初始化預覽畫面
    const previewCanvas = document.getElementById('preview-canvas');
    if (previewCanvas) {
      previewCanvas.width = GRID_SIZE * TILE_COUNT;
      previewCanvas.height = GRID_SIZE * TILE_COUNT;
      const ctx = previewCanvas.getContext('2d');
      
      // 繪製預覽內容
      ctx.fillStyle = '#4CAF50';
      // 繪製蛇身
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(100 + i * GRID_SIZE, 100, GRID_SIZE - 2, GRID_SIZE - 2);
      }
      // 繪製食物
      ctx.fillStyle = '#FF5252';
      ctx.fillRect(200, 100, GRID_SIZE - 2, GRID_SIZE - 2);
    } else {
      console.error('找不到預覽畫布元素');
    }
    
    console.log('遊戲初始化完成');
  }
  
  initGame();
  
  // 開始按鈕
  const startButton = document.getElementById('start-button');
  if (startButton) {
    startButton.addEventListener('click', () => {
      gameState.startGame();
    });
  } else {
    console.error('開始按鈕元素未找到');
  }
  
  // 預覽畫布（開始畫面中的靜態預覽）
  const previewCanvas = document.createElement('canvas');
  const previewCtx = previewCanvas.getContext('2d');
  previewCanvas.width = GRID_SIZE * TILE_COUNT;
  previewCanvas.height = GRID_SIZE * TILE_COUNT;
  
  // 繪製預覽畫面
  function drawPreview() {
    // 清空畫布
    previewCtx.fillStyle = '#fff';
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // 繪製網格
    previewCtx.strokeStyle = '#f0f0f0';
    previewCtx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
      // 垂直線
      previewCtx.beginPath();
      previewCtx.moveTo(i * GRID_SIZE, 0);
      previewCtx.lineTo(i * GRID_SIZE, previewCanvas.height);
      previewCtx.stroke();
      
      // 水平線
      previewCtx.beginPath();
      previewCtx.moveTo(0, i * GRID_SIZE);
      previewCtx.lineTo(previewCanvas.width, i * GRID_SIZE);
      previewCtx.stroke();
    }
    
    // 繪製靜態的蛇
    const snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 5, y: 9 },
      { x: 5, y: 8 },
      { x: 6, y: 8 },
      { x: 7, y: 8 },
      { x: 7, y: 7 },
      { x: 7, y: 6 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
      { x: 9, y: 5 },
      { x: 10, y: 5 },
      { x: 10, y: 6 },
      { x: 10, y: 7 },
      { x: 10, y: 8 },
      { x: 10, y: 9 },
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
      { x: 11, y: 12 },
      { x: 12, y: 12 },
      { x: 12, y: 11 },
      { x: 12, y: 10 },
      { x: 13, y: 10 },
      { x: 14, y: 10 },
      { x: 15, y: 10 }
    ];
    
    // 繪製蛇身
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      previewCtx.fillStyle = isHead ? '#4CAF50' : '#8BC34A';
      previewCtx.fillRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
      );
      
      // 添加蛇頭的眼睛
      if (isHead) {
        previewCtx.fillStyle = 'white';
        previewCtx.beginPath();
        previewCtx.arc(
          segment.x * GRID_SIZE + GRID_SIZE - 5,
          segment.y * GRID_SIZE + 5,
          2, 0, Math.PI * 2
        );
        previewCtx.fill();
      }
    });
    
    // 繪製食物
    previewCtx.fillStyle = '#FF5252';
    previewCtx.beginPath();
    const foodX = 15 * GRID_SIZE + GRID_SIZE / 2;
    const foodY = 5 * GRID_SIZE + GRID_SIZE / 2;
    previewCtx.arc(foodX, foodY, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    previewCtx.fill();
    
    // 添加一些葉子裝飾
    previewCtx.fillStyle = '#8BC34A';
    previewCtx.beginPath();
    previewCtx.arc(foodX - 3, foodY - 2, 3, 0, Math.PI * 2);
    previewCtx.fill();
    
    previewCtx.beginPath();
    previewCtx.arc(foodX + 2, foodY - 4, 2, 0, Math.PI * 2);
    previewCtx.fill();
  }
  
  // 繪製預覽
  drawPreview();
  
  // 將預覽畫布添加到頁面
  const container = document.getElementById('game-canvas-container');
  container.appendChild(previewCanvas);
  
  // 顯示開始畫面
  gameState.showScreen('start');
});

class Game {
  constructor(containerId) {
    if (!containerId) {
      console.error('錯誤：未提供容器 ID');
      return;
    }
    
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`錯誤：找不到容器元素 #${containerId}`);
      return;
    }
    
    console.log(`找到容器 #${containerId}:`, this.container);
    
    // 確保容器是空的
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    
    // 創建遊戲畫布
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = GRID_SIZE * TILE_COUNT;
    this.canvas.height = GRID_SIZE * TILE_COUNT;
    this.container.appendChild(this.canvas);
    
    // 創建分數顯示
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.className = 'score-display';
    this.container.insertBefore(this.scoreDisplay, this.canvas);
    
    // 遊戲狀態
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.speed = 150; // 移動速度（毫秒）
    this.lastRenderTime = 0;
    this.gameLoopId = null;
    this.paused = false;
    
    // 蛇的初始狀態
    this.resetGame();
    
    // 初始化遊戲
    this.init();
    
    console.log('遊戲初始化完成');
    
    // 開始遊戲循環
    this.lastRenderTime = performance.now();
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
    this.updateScore();
    this.drawGame();
  }
  
  setupEventListeners() {
    // 確保只添加一次事件監聽器
    if (!this._hasEventListeners) {
      // 綁定 this 到實例
      this.boundHandleKeyPress = this.handleKeyPress.bind(this);
      
      // 添加事件監聽器
      document.addEventListener('keydown', this.boundHandleKeyPress);
      
      // 確保畫布可以獲得焦點
      this.canvas.setAttribute('tabindex', '0');
      this.canvas.focus();
      
      this._hasEventListeners = true;
      console.log('事件監聽器已設置');
    }
  }
  
  handleKeyPress(e) {
    const key = e.key.toLowerCase();
    console.log('按鍵:', key, '遊戲結束:', this.gameOver, '暫停:', this.paused);
    
    // 處理 R 鍵重新開始遊戲
    if (key === 'r') {
      console.log('收到 R 鍵，重新開始遊戲');
      gameState.restartGame();
      return;
    }
    
    // 處理暫停/繼續
    if (key === 'p') {
      console.log('收到 P 鍵，切換暫停狀態');
      this.togglePause();
      e.preventDefault(); // 防止默認行為
      return;
    }
    
    // 如果遊戲結束或暫停，不處理方向鍵
    if (this.gameOver || this.paused) {
      return;
    }
    
    // 處理方向鍵
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (this.direction !== 'down') this.nextDirection = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (this.direction !== 'up') this.nextDirection = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this.direction !== 'right') this.nextDirection = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this.direction !== 'left') this.nextDirection = 'right';
        break;
    }
  }
  
  togglePause() {
    if (this.gameOver) {
      console.log('遊戲已結束，不能暫停');
      return;
    }
    
    this.paused = !this.paused;
    console.log('遊戲', this.paused ? '已暫停' : '已繼續');
    
    if (this.paused) {
      this.drawPauseScreen();
    } else {
      // 確保畫布獲得焦點
      this.canvas.focus();
      this.lastRenderTime = performance.now();
      if (!this.gameLoopId) {
        this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
      }
    }
  }
  
  updateScore() {
    this.scoreDisplay.textContent = `分數: ${this.score} | 等級: ${this.level}`;
  }
  
  drawPauseScreen() {
    // 半透明黑色遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 暫停文字
    this.ctx.fillStyle = 'white';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('遊戲暫停', this.canvas.width / 2, this.canvas.height / 2 - 30);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText('按 P 繼續遊戲', this.canvas.width / 2, this.canvas.height / 2 + 20);
  }
  
  drawGameOver() {
    // 半透明黑色遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 遊戲結束文字
    this.ctx.fillStyle = 'white';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('遊戲結束', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`最終分數: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText('按 R 重新開始', this.canvas.width / 2, this.canvas.height / 2 + 50);
  }
  
  drawGame() {
    // 清空畫布
    this.ctx.fillStyle = '#f9f9f9';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 繪製網格（輔助線）
    this.ctx.strokeStyle = '#f0f0f0';
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
    
    // 檢查是否撞牆
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      this.gameOver = true;
      return;
    }
    
    // 檢查是否撞到自己
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver = true;
      return;
    }
    
    // 添加新頭部
    this.snake.unshift(head);
    
    // 檢查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.updateScore();
      
      // 每100分升一級，提高速度
      if (this.score % 100 === 0) {
        this.level++;
        this.speed = Math.max(50, this.speed - 10); // 速度有下限
      }
      
      // 生成新食物
      this.food = this.generateFood();
    } else {
      // 如果沒吃到食物，移除尾部
      this.snake.pop();
    }
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
  
  resetGame() {
    // 重置遊戲狀態
    this.gameOver = false;
    this.paused = false;
    this.score = 0;
    this.level = 1;
    this.speed = 150;
    this.direction = 'right';
    this.nextDirection = 'right';
    this.lastRenderTime = performance.now();
    
    // 重置蛇的初始位置
    const startX = Math.floor(TILE_COUNT / 3);
    this.snake = [
      { x: startX, y: Math.floor(TILE_COUNT / 2) },
      { x: startX - 1, y: Math.floor(TILE_COUNT / 2) },
      { x: startX - 2, y: Math.floor(TILE_COUNT / 2) }
    ];
    
    // 生成初始食物
    this.food = this.generateFood();
    
    // 更新分數顯示
    this.updateScore();
    
    // 確保遊戲循環正在運行
    if (!this.gameLoopId) {
      this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }
  
  gameLoop(timestamp) {
    // 如果遊戲已停止，直接返回
    if (!this.gameLoopId) return;
    
    // 計算幀間隔時間
    const deltaTime = timestamp - this.lastRenderTime;
    
    // 繪製遊戲畫面
    this.drawGame();
    
    if (this.gameOver) {
      this.drawGameOver();
    } else if (this.paused) {
      this.drawPauseScreen();
    } else {
      // 只有在遊戲運行中且不暫停時才更新遊戲狀態
      if (deltaTime >= this.speed) {
        this.update();
        this.lastRenderTime = timestamp;
      }
    }
    
    // 繼續遊戲循環
    this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  
  stopGame() {
    console.log('停止遊戲');
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
    // 移除事件監聽器
    if (this.boundHandleKeyPress) {
      document.removeEventListener('keydown', this.boundHandleKeyPress);
      this._hasEventListeners = false;
    }
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
