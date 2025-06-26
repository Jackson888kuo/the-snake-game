class Score {
  constructor() {
    this.score = 0;
    this.highScore = localStorage.getItem('snakeHighScore') || 0;
    this.comboCount = 0;
    this.lastComboTime = 0;
    this.comboTimeout = 2000; // 連擊時間窗口：2秒
  }

  // 增加分數
  add(points, isCombo = false) {
    const now = Date.now();
    
    // 處理連擊
    if (isCombo) {
      if (now - this.lastComboTime < this.comboTimeout) {
        this.comboCount++;
        // 連擊獎勵：每連擊一次額外+5分，最高+30分
        const comboBonus = Math.min(this.comboCount * 5, 30);
        points += comboBonus;
      } else {
        this.comboCount = 0;
      }
      this.lastComboTime = now;
    } else {
      this.comboCount = 0; // 重置連擊
    }

    this.score += points;
    
    // 更新最高分
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore);
    }

    return points; // 返回實際增加的分數（用於顯示動畫）
  }

  // 重置分數（開始新遊戲時調用）
  reset() {
    this.score = 0;
    this.comboCount = 0;
    this.lastComboTime = 0;
  }

  // 獲取當前分數
  getScore() {
    return this.score;
  }

  // 獲取最高分
  getHighScore() {
    return this.highScore;
  }

  // 獲取連擊數
  getComboCount() {
    return this.comboCount;
  }
}

export default Score;
