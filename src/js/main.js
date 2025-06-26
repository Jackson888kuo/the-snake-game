import { Game } from './Game.js';

console.log('遊戲模組已加載');

class GameState {
  constructor() {
    // DOM 元素將在 init 中獲取
    this.startScreen = null;
    this.gameScreen = null;
    this.gameContainerId = 'game-container';
    this.game = null;
    console.log('GameState 已創建');
  }

  // 顯示指定的畫面 ('start' 或 'game')
  showScreen(screenName) {
    console.log(`切換畫面到: ${screenName}`);
    if (this.startScreen) {
      this.startScreen.classList.toggle('hidden', screenName !== 'start');
    }
    if (this.gameScreen) {
      this.gameScreen.classList.toggle('hidden', screenName !== 'game');
    }
  }

  // 重啟遊戲的核心邏輯
  restartGame() {
    console.log('=== 開始重置遊戲 ===');
    this.showScreen('game');

    // 停止並清理舊的遊戲實例
    if (this.game) {
      this.game.stopGame();
      this.game = null;
    }

    // 清理並重建遊戲容器
    let container = document.getElementById(this.gameContainerId);
    if (container) {
      container.innerHTML = '';
    } else {
      console.error(`錯誤：找不到 ID 為 ${this.gameContainerId} 的容器`);
      // 嘗試在 game-screen 中創建它
      if (this.gameScreen) {
          container = document.createElement('div');
          container.id = this.gameContainerId;
          this.gameScreen.appendChild(container);
      } else {
          return; // 如果連 game-screen 都沒有，就無法繼續
      }
    }
    
    // 創建新的遊戲實例
    console.log('正在創建新遊戲實例...');
    this.game = new Game(this.gameContainerId);

    // 確保畫布可以接收鍵盤事件
    if (this.game && this.game.canvas) {
      this.game.canvas.focus();
      console.log('畫布已獲得焦點');
    } else {
      console.error('錯誤：無法創建遊戲實例或找不到畫布');
    }
  }

  // 初始化，設置事件監聽器
  init() {
    console.log('GameState.init() 已調用');
    // 在 init 中獲取 DOM 元素，確保它們已存在
    this.startScreen = document.getElementById('start-screen');
    this.gameScreen = document.getElementById('game-screen');

    if (!this.startScreen || !this.gameScreen) {
        console.error('錯誤：無法找到 start-screen 或 game-screen 元素。');
        return;
    }

    this.showScreen('start');

    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', () => {
        console.log('開始按鈕被點擊');
        this.restartGame();
      });
    } else {
      console.error('錯誤：找不到開始按鈕');
    }
  }
}

// 確保在 DOM 完全加載後再執行所有操作
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 已完全加載，開始初始化遊戲...');
  
  const gameState = new GameState();
  gameState.init();

  // 監聽來自 Game.js 的全局重啟請求 (例如按 'R' 鍵)
  document.addEventListener('restartgame', () => {
    console.log('接收到全局重啟請求，正在重啟遊戲...');
    gameState.restartGame();
  });

  // 添加全局鍵盤事件監聽器，以便在開始畫面按鍵也能開始遊戲
  window.addEventListener('keydown', (e) => {
      // 只有在開始畫面時才響應
      if (gameState.startScreen && !gameState.startScreen.classList.contains('hidden')) {
          if (e.key === 'Enter' || e.key === ' ') {
              console.log('通過鍵盤啟動遊戲...');
              e.preventDefault(); // 防止空格鍵滾動頁面
              gameState.restartGame();
          }
      }
  });
});
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOMContentLoaded 已經觸發
  init();
}
