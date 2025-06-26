import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'

class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;
    document.querySelector('#app').appendChild(this.canvas);
    
    // 遊戲狀態
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    
    // 初始化遊戲
    this.init();
    
    // 開始遊戲循環
    this.gameLoop();
  }
  
  init() {
    // 初始化遊戲元素
    this.drawGame();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // 鍵盤控制
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }
  
  handleKeyPress(e) {
    // 處理按鍵輸入
    console.log('Key pressed:', e.key);
  }
  
  drawGame() {
    // 清空畫布
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 繪製遊戲元素
    this.ctx.fillStyle = '#333';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);
    this.ctx.fillText(`Level: ${this.level}`, 20, 70);
  }
  
  update() {
    // 更新遊戲狀態
  }
  
  gameLoop() {
    if (this.gameOver) {
      this.gameOverScreen();
      return;
    }
    
    this.update();
    this.drawGame();
    
    // 繼續遊戲循環
    requestAnimationFrame(() => this.gameLoop());
  }
  
  gameOverScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'center';
    this.ctx.font = '48px Arial';
    this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
  }
}

// 啟動遊戲
window.onload = () => {
  const game = new Game();
  
  // 重新開始遊戲的快捷鍵
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
      document.querySelector('#app').innerHTML = '';
      new Game();
    }
  });
};
