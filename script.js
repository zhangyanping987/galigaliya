// 吃到好吃的得到的快乐值 - JavaScript文件

// 加载管理
class LoadingManager {
    constructor() {
        this.images = [];
        this.loadedCount = 0;
        this.totalImages = 0;
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.progressBar = document.getElementById('progress-bar');
        this.percentage = document.getElementById('loading-percentage');
        this.details = document.getElementById('loading-details');
        this.startTime = performance.now();
        this.init();
    }

    init() {
        // 收集所有需要加载的图片
        this.collectImages();
        this.totalImages = this.images.length;
        
        // 如果只有懒加载图片，直接隐藏加载界面
        if (this.totalImages === 0) {
            this.hideLoading();
            return;
        }

        // 开始预加载图片
        this.preloadImages();
    }

    collectImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        this.images = Array.from(lazyImages);
    }

    preloadImages() {
        this.images.forEach((img, index) => {
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                this.onImageLoad(img, index);
            };
            
            imageLoader.onerror = () => {
                this.onImageError(img, index);
            };
            
            // 开始加载图片
            imageLoader.src = img.dataset.src;
        });
    }

    onImageLoad(img, index) {
        this.loadedCount++;
        
        // 更新进度
        const progress = (this.loadedCount / this.totalImages) * 100;
        this.updateProgress(progress);
        
        // 设置图片源并显示
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        img.classList.add('loaded');
        
        // 更新加载详情
        this.details.textContent = `已加载 ${this.loadedCount}/${this.totalImages} 张图片`;
        
        // 检查是否全部加载完成
        if (this.loadedCount >= this.totalImages) {
            setTimeout(() => {
                this.hideLoading();
            }, 500);
        }
    }

    onImageError(img, index) {
        this.loadedCount++;
        console.warn(`图片加载失败: ${img.dataset.src}`);
        
        // 即使失败也要更新进度
        const progress = (this.loadedCount / this.totalImages) * 100;
        this.updateProgress(progress);
        
        // 设置默认图片或隐藏
        img.style.display = 'none';
        
        if (this.loadedCount >= this.totalImages) {
            setTimeout(() => {
                this.hideLoading();
            }, 500);
        }
    }

    updateProgress(progress) {
        this.progressBar.style.width = progress + '%';
        this.percentage.textContent = Math.round(progress) + '%';
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
        // 隐藏游戏UI
        hideGameUI();
        // 显示积分按钮
        showScoreToggleButton();
        setTimeout(() => {
            this.loadingOverlay.style.display = 'none';
        }, 500);
    }
}

// 游戏状态管理
let gameScore = 0;
let comboCount = 0;
let lastClickTime = 0;

// 音乐状态 - 默认开启
let musicActive = true;
let backgroundMusic = null;
let gameStarted = false;
let scoreGameActive = false;

// 食物统计管理
let foodStats = {};
let totalFoodClicks = 0;

// 页面加载完成后初始化加载管理器
document.addEventListener('DOMContentLoaded', function() {
    // 创建底部摇动元素
    createBottomFloatingElements();
    
    // 立即启动掉落特效，让加载过程更有趣
    startFoodEffects();
    
    // 设置吃零食捕获层事件
    setupClickCaptureLayer();
    
    // 设置积分按钮事件
    setupScoreToggleButton();
    
    // 设置音乐控制事件
    setupMusicToggleButton();
    
    // 页面加载完成后自动开始播放音乐
    startBackgroundMusic();
    
    // 添加用户交互检测，当用户第一次点击时确保音乐开始播放
    let userInteracted = false;
    document.addEventListener('click', function() {
        if (!userInteracted && musicActive) {
            userInteracted = true;
            // 用户交互后重新尝试播放音乐
            if (backgroundMusic && backgroundMusic.paused) {
                backgroundMusic.play().catch(function(error) {
                    console.log('音乐播放失败:', error);
                });
            }
        }
    });
    
    // 设置分数点击事件
    setupScoreClickEvent();
    
    new LoadingManager();
    // 预加载关键图片
    preloadCriticalImages();
});

// 设置吃零食捕获层事件
function setupClickCaptureLayer() {
    const clickCaptureLayer = document.getElementById('click-capture-layer');
    if (clickCaptureLayer) {
        clickCaptureLayer.addEventListener('click', function(e) {
            // 阻止点击事件传播到下层
            e.stopPropagation();
            e.preventDefault();
            console.log('吃零食被捕获层拦截，不会触发后面的图片点击');
        });
    }
}

// 设置积分按钮事件
function setupScoreToggleButton() {
    const scoreToggleBtn = document.getElementById('score-toggle-btn');
    if (scoreToggleBtn) {
        scoreToggleBtn.addEventListener('click', function() {
            toggleScoreGame();
        });
    }
}

// 设置分数点击事件
function setupScoreClickEvent() {
    const scoreValue = document.getElementById('score-value');
    const gameScore = document.getElementById('game-score');
    
    // 点击分数数字弹出统计
    if (scoreValue) {
        scoreValue.addEventListener('click', function() {
            showFoodStatsModal();
        });
    }
    
    // 点击整个游戏计分框弹出统计
    if (gameScore) {
        gameScore.addEventListener('click', function() {
            showFoodStatsModal();
        });
        
        // 添加悬停效果提示
        gameScore.style.cursor = 'pointer';
        gameScore.title = '点击查看详细统计';
    }
}

// 切换积分游戏状态
function toggleScoreGame() {
    scoreGameActive = !scoreGameActive;
    const scoreToggleBtn = document.getElementById('score-toggle-btn');
    const gameScore = document.getElementById('game-score');
    const gameHint = document.getElementById('game-hint');
    
    if (scoreGameActive) {
        // 开启积分游戏
        scoreToggleBtn.textContent = '🎯 吃饱啦吃饱啦！停止收集快乐值';
        scoreToggleBtn.classList.add('active');
        if (gameScore) gameScore.style.display = 'block';
        if (gameHint) gameHint.style.display = 'block';
        
        // 重置分数
        gameScore = 0;
        comboCount = 0;
        updateScoreDisplay();
        
        console.log('积分游戏已开启');
    } else {
        // 关闭积分游戏
        scoreToggleBtn.textContent = '🎯 开吃！收集快乐值';
        scoreToggleBtn.classList.remove('active');
        if (gameScore) gameScore.style.display = 'none';
        if (gameHint) gameHint.style.display = 'none';
        
        console.log('积分游戏已关闭');
    }
}

// 启动所有食物特效
function startFoodEffects() {
    // 立即创建一些初始特效，让加载过程更有趣
    setTimeout(() => createFoodRain(), 200);
    setTimeout(() => createFoodMeteor(), 500);
    setTimeout(() => createBouncingFood(), 800);
    
    // 显示游戏UI
    showGameUI();
}

// 显示游戏UI
function showGameUI() {
    const gameScore = document.getElementById('game-score');
    const gameHint = document.getElementById('game-hint');
    const clickCaptureLayer = document.getElementById('click-capture-layer');
    
    if (gameScore) gameScore.style.display = 'block';
    if (gameHint) gameHint.style.display = 'block';
    if (clickCaptureLayer) clickCaptureLayer.style.display = 'block';
    
    gameStarted = true;
    // 加载时自动激活积分游戏
    scoreGameActive = true;
}

// 隐藏游戏UI
function hideGameUI() {
    const gameScore = document.getElementById('game-score');
    const gameHint = document.getElementById('game-hint');
    const clickCaptureLayer = document.getElementById('click-capture-layer');
    
    if (gameScore) gameScore.style.display = 'none';
    if (gameHint) gameHint.style.display = 'none';
    if (clickCaptureLayer) clickCaptureLayer.style.display = 'none';
    
    // 加载完成后关闭积分游戏
    scoreGameActive = false;
}

// 显示积分按钮
function showScoreToggleButton() {
    const scoreToggleBtn = document.getElementById('score-toggle-btn');
    if (scoreToggleBtn) {
        scoreToggleBtn.style.display = 'block';
    }
}

// 处理食物被吃 - 核心逻辑：吃到食物 → 获得快乐值 → 累计统计
function handleFoodClick(element, food) {
    if (!gameStarted) return;
    
    // 如果积分游戏未激活，只播放特效不记录统计
    if (!scoreGameActive) {
        createEnhancedClickEffect(element, food);
        createRippleEffect(element);
        createScreenShake();
        playClickSound();
        
        // 移除元素
        element.style.animation = 'none';
        element.style.transform = 'scale(0)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
        }, 200);
        return;
    }
    
    // 第一步：统计食物被吃次数（仅在积分游戏激活时）
    recordFoodClick(food);
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // 计算连击
    if (timeDiff < 1000) { // 1秒内连续吃零食
        comboCount++;
    } else {
        comboCount = 1;
    }
    
    lastClickTime = currentTime;
    
    // 第二步：计算快乐值（基础快乐值 + 连击奖励）
    const baseScore = getFoodScore(food);
    const comboBonus = Math.min(comboCount - 1, 5) * 2; // 最多5连击奖励
    const totalScore = baseScore + comboBonus;
    
    // 第三步：累计快乐值
    gameScore += totalScore;
    
    // 第四步：记录食物快乐值统计
    recordFoodScore(food, totalScore);
    
    // 更新UI
    updateScoreDisplay();
    
    // 创建增强的吃零食特效
    createEnhancedClickEffect(element, food);
    
    // 创建快乐值弹出效果
    createScorePopup(element, totalScore);
    
    // 创建波纹效果
    createRippleEffect(element);
    
    // 震动屏幕（轻微）
    createScreenShake();
    
    // 播放吃零食音效（如果支持）
    playClickSound();
    
    // 移除元素
    element.style.animation = 'none';
    element.style.transform = 'scale(0)';
    element.style.opacity = '0';
    
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
    }, 200);
}

// 获取食物分数
function getFoodScore(food) {
    const scoreMap = {
        '🍟': 10, '🍕': 15, '🍰': 20, '🍭': 8, '🍪': 12, '🍩': 18,
        '🍫': 14, '🍬': 6, '🧁': 25, '🥨': 16, '🍯': 22, '🧀': 13,
        '🥞': 11, '🍞': 9, '🥖': 7, '🥐': 8
    };
    return scoreMap[food] || 10;
}

// 记录食物被吃次数 - 统计每个食物被吃的次数
function recordFoodClick(food) {
    if (!foodStats[food]) {
        foodStats[food] = {
            clicks: 0,
            totalScore: 0,
            baseScore: getFoodScore(food)
        };
    }
    foodStats[food].clicks++;
    totalFoodClicks++;
}

// 记录食物快乐值 - 累计每个食物获得的快乐值
function recordFoodScore(food, score) {
    if (foodStats[food]) {
        foodStats[food].totalScore += score;
    }
}

// 显示食物统计弹窗
function showFoodStatsModal() {
    // 创建弹窗背景
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'stats-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20000;
        backdrop-filter: blur(5px);
    `;
    
    // 创建弹窗内容
    const modalContent = document.createElement('div');
    modalContent.className = 'stats-modal-content';
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%);
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        position: relative;
    `;
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid rgba(255, 107, 107, 0.5);
        border-radius: 50%;
        width: 35px;
        height: 35px;
        cursor: pointer;
        font-size: 18px;
        color: #ff6b6b;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 30000;
    `;
    
    // 创建标题
    const title = document.createElement('h2');
    title.textContent = '🍔 食物统计报告';
    title.style.cssText = `
        text-align: center;
        margin-bottom: 20px;
        color: #333;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    `;
    
    // 创建统计内容
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    
    // 总体统计
    const totalStats = document.createElement('div');
    totalStats.style.cssText = `
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        text-align: center;
    `;
    totalStats.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">📊 快乐值统计</h3>
        <p style="margin: 5px 0; font-size: 16px;"><strong>总吃零食次数:</strong> ${totalFoodClicks}</p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>累计快乐值:</strong> ${gameScore}</p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>当前连击:</strong> ${comboCount}</p>
    `;
    
    // 食物详细统计
    const foodStatsList = document.createElement('div');
    foodStatsList.style.cssText = `
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 20px;
    `;
    
    const foodStatsTitle = document.createElement('h3');
    foodStatsTitle.textContent = '🍽️ 食物快乐值详细统计';
    foodStatsTitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #ff6b6b;
        text-align: center;
    `;
    
    foodStatsList.appendChild(foodStatsTitle);
    
    // 按被吃次数排序
    const sortedFoods = Object.entries(foodStats).sort((a, b) => b[1].clicks - a[1].clicks);
    
    if (sortedFoods.length === 0) {
        const noStats = document.createElement('p');
        noStats.textContent = '还没有吃任何零食哦~';
        noStats.style.cssText = `
            text-align: center;
            color: #666;
            font-style: italic;
        `;
        foodStatsList.appendChild(noStats);
    } else {
        sortedFoods.forEach(([food, stats], index) => {
            const foodItem = document.createElement('div');
            foodItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                margin: 8px 0;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 10px;
                border-left: 4px solid ${index < 3 ? '#ff6b6b' : '#4ecdc4'};
            `;
            
            const foodInfo = document.createElement('div');
            foodInfo.style.cssText = 'display: flex; align-items: center; gap: 10px;';
            foodInfo.innerHTML = `
                <span style="font-size: 24px;">${food}</span>
                <div>
                    <div style="font-weight: bold; color: #333;">被吃 ${stats.clicks} 次</div>
                    <div style="font-size: 12px; color: #666;">单次快乐值: ${stats.baseScore}</div>
                </div>
            `;
            
            const scoreInfo = document.createElement('div');
            scoreInfo.style.cssText = 'text-align: right;';
            scoreInfo.innerHTML = `
                <div style="font-weight: bold; color: #ff6b6b; font-size: 18px;">${stats.totalScore}</div>
                <div style="font-size: 12px; color: #666;">累计快乐值</div>
            `;
            
            foodItem.appendChild(foodInfo);
            foodItem.appendChild(scoreInfo);
            foodStatsList.appendChild(foodItem);
        });
    }
    
    // 组装弹窗
    modalContent.appendChild(title);
    modalContent.appendChild(totalStats);
    modalContent.appendChild(foodStatsList);
    modalOverlay.appendChild(modalContent);
    modalOverlay.appendChild(closeBtn);  // 将关闭按钮添加到背景层，确保不被遮挡
    document.body.appendChild(modalOverlay);
    
    // 关闭按钮悬停效果
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 107, 107, 0.9)';
        closeBtn.style.color = '#fff';
        closeBtn.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        closeBtn.style.color = '#ff6b6b';
        closeBtn.style.transform = 'scale(1)';
    });
    
    // 关闭事件
    closeBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
    
    // 添加动画效果
    modalOverlay.style.opacity = '0';
    modalContent.style.transform = 'scale(0.8)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modalOverlay.style.transition = 'opacity 0.3s ease';
        modalContent.style.transition = 'all 0.3s ease';
        modalOverlay.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';
    }, 10);
}

// 更新分数显示
function updateScoreDisplay() {
    const scoreValue = document.getElementById('score-value');
    const scoreCombo = document.getElementById('score-combo');
    
    if (scoreValue) {
        scoreValue.textContent = gameScore;
        // 添加吃零食事件来显示统计
        scoreValue.style.cursor = 'pointer';
        scoreValue.title = '点击查看快乐值统计';
    }
    
    if (scoreCombo) {
        if (comboCount > 1) {
            scoreCombo.textContent = `连击: ${comboCount}`;
            scoreCombo.classList.add('show');
        } else {
            scoreCombo.classList.remove('show');
        }
    }
}

// 创建增强的吃零食特效
function createEnhancedClickEffect(element, food) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 创建多个星星特效
    const effects = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < 3; i++) {
        const clickEffect = document.createElement('div');
        clickEffect.className = 'food-click-effect';
        clickEffect.textContent = effects[Math.floor(Math.random() * effects.length)];
        clickEffect.style.left = (centerX + (Math.random() - 0.5) * 40) + 'px';
        clickEffect.style.top = (centerY + (Math.random() - 0.5) * 40) + 'px';
        clickEffect.style.animationDelay = (i * 0.1) + 's';
        
        document.body.appendChild(clickEffect);
        
        setTimeout(() => {
            clickEffect.remove();
        }, 600);
    }
}

// 创建波纹效果
function createRippleEffect(element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.left = (rect.left + rect.width / 2) + 'px';
    ripple.style.top = (rect.top + rect.height / 2) + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 创建屏幕震动
function createScreenShake() {
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, 300);
}

// 播放吃零食音效
function playClickSound() {
    try {
        // 创建简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // 如果音频不支持，静默失败
        console.log('音频播放不支持');
    }
}

// 创建分数弹出效果
function createScorePopup(element, score) {
    const rect = element.getBoundingClientRect();
    const scorePopup = document.createElement('div');
    scorePopup.className = 'score-popup';
    scorePopup.textContent = `+${score}`;
    scorePopup.style.left = (rect.left + rect.width / 2) + 'px';
    scorePopup.style.top = (rect.top + rect.height / 2) + 'px';
    
    document.body.appendChild(scorePopup);
    
    setTimeout(() => {
        scorePopup.remove();
    }, 1000);
}

// 添加图片加载优化提示
function addLoadingOptimizations() {
    // 为所有图片添加加载优化属性
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // 添加解码提示
        img.setAttribute('decoding', 'async');
        // 添加加载优先级
        if (img.classList.contains('gif-image')) {
            img.setAttribute('fetchpriority', 'high');
        }
    });
}

// 在DOM加载完成后应用优化
document.addEventListener('DOMContentLoaded', addLoadingOptimizations);

// 吃GIF时创建特效
function createClickEffect(event) {
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    clickEffect.textContent = '🎉';
    
    const rect = event.target.getBoundingClientRect();
    clickEffect.style.left = (event.clientX - rect.left) + 'px';
    clickEffect.style.top = (event.clientY - rect.top) + 'px';
    
    event.target.parentNode.appendChild(clickEffect);
    
    // 移除特效元素
    setTimeout(() => {
        clickEffect.remove();
    }, 600);
}

// 创建底部摇动元素
function createBottomFloatingElements() {
    const emojis = ['🌟', '💫', '⭐', '🎊', '🎉', '💖', '💕', '🌈', '🦄', '🐱'];
    const container = document.getElementById('bottom-floating-elements');
    
    if (container) {
        emojis.forEach(emoji => {
            const element = document.createElement('div');
            element.className = 'bottom-floating-element';
            element.textContent = emoji;
            container.appendChild(element);
        });
    }
}

// 雪花式缓慢掉落
function createFoodRain() {
    const foods = ['🍟', '🍕', '🍰', '🍭', '🍪', '🍩', '🍫', '🍬', '🍭', '🧁', '🥨', '🍯', '🧀', '🥞', '🍞', '🥖', '🥐'];
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    
    const rainElement = document.createElement('div');
    rainElement.className = 'food-rain';
    rainElement.textContent = randomFood;
    
    // 随机水平位置
    rainElement.style.left = (Math.random() * 90 + 5) + '%';
    
    // 缓慢匀速掉落，8-12秒
    const speed = Math.random() * 4 + 8; // 8-12秒
    rainElement.style.animationDuration = speed + 's';
    
    // 立即开始动画，不延迟
    rainElement.style.animationDelay = '0s';
    
    // 确保从屏幕外开始
    rainElement.style.top = '-150px';
    
    // 随机大小，增加层次感
    const size = Math.random() * 12 + 28; // 28-40px
    rainElement.style.fontSize = size + 'px';
    
    // 随机透明度
    rainElement.style.opacity = Math.random() * 0.4 + 0.6; // 0.6-1.0
    
    // 添加吃零食事件
    rainElement.addEventListener('click', function(e) {
        e.stopPropagation();
        handleFoodClick(rainElement, randomFood);
    });
    
    document.getElementById('food-effects-container').appendChild(rainElement);
    
    setTimeout(() => {
        if (rainElement.parentNode) {
            rainElement.remove();
        }
    }, (speed + 1) * 1000);
}

// 流星式划过
function createFoodMeteor() {
    const foods = ['🍟', '🍕', '🍰', '🍭', '🍪', '🍩', '🍫', '🍬', '🧁', '🥨', '🍯', '🧀', '🥞'];
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    
    const meteorElement = document.createElement('div');
    meteorElement.className = 'food-meteor';
    meteorElement.textContent = randomFood;
    
    // 从左上角开始
    meteorElement.style.left = (Math.random() * 30) + '%';
    meteorElement.style.top = '-100px';
    
    // 匀速划过，6-8秒
    const speed = Math.random() * 2 + 6; // 6-8秒
    meteorElement.style.animationDuration = speed + 's';
    
    // 立即开始动画，不延迟
    meteorElement.style.animationDelay = '0s';
    
    // 随机大小
    const size = Math.random() * 8 + 24; // 24-32px
    meteorElement.style.fontSize = size + 'px';
    
    // 随机透明度
    meteorElement.style.opacity = Math.random() * 0.3 + 0.7; // 0.7-1.0
    
    // 添加吃零食事件
    meteorElement.addEventListener('click', function(e) {
        e.stopPropagation();
        handleFoodClick(meteorElement, randomFood);
    });
    
    document.getElementById('food-effects-container').appendChild(meteorElement);
    
    setTimeout(() => {
        if (meteorElement.parentNode) {
            meteorElement.remove();
        }
    }, (speed + 1) * 1000);
}

// 食物弹跳效果
function createBouncingFood() {
    const foods = ['🍟', '🍕', '🍰', '🍭', '🍪', '🍩'];
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    
    const bounceElement = document.createElement('div');
    bounceElement.className = 'bouncing-food';
    bounceElement.textContent = randomFood;
    bounceElement.style.left = Math.random() * 80 + 10 + '%';
    bounceElement.style.top = Math.random() * 60 + 20 + '%';
    // 立即开始动画，不延迟
    bounceElement.style.animationDelay = '0s';
    
    // 添加吃零食事件
    bounceElement.addEventListener('click', function(e) {
        e.stopPropagation();
        handleFoodClick(bounceElement, randomFood);
    });
    
    document.getElementById('food-effects-container').appendChild(bounceElement);
    
    setTimeout(() => {
        if (bounceElement.parentNode) {
            bounceElement.remove();
        }
    }, 5000);
}

// 零食旋转效果
function createSpinningFood() {
    const foods = ['🍟', '🍕', '🍰', '🍭', '🍪', '🍩', '🍫'];
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    
    const spinElement = document.createElement('div');
    spinElement.className = 'spinning-food';
    spinElement.textContent = randomFood;
    spinElement.style.left = Math.random() * 80 + 10 + '%';
    spinElement.style.top = Math.random() * 60 + 20 + '%';
    spinElement.style.animationDelay = Math.random() * 1 + 's';
    
    // 添加吃零食事件
    spinElement.addEventListener('click', function(e) {
        e.stopPropagation();
        handleFoodClick(spinElement, randomFood);
    });
    
    document.getElementById('food-effects-container').appendChild(spinElement);
    
    setTimeout(() => {
        if (spinElement.parentNode) {
            spinElement.remove();
        }
    }, 3000);
}

// 零食摇摆效果
function createSwayingFood() {
    const foods = ['🍟', '🍕', '🍰', '🍭', '🍪', '🍩'];
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    
    const swayElement = document.createElement('div');
    swayElement.className = 'swaying-food';
    swayElement.textContent = randomFood;
    swayElement.style.left = Math.random() * 80 + 10 + '%';
    swayElement.style.top = Math.random() * 60 + 20 + '%';
    swayElement.style.animationDelay = Math.random() * 2 + 's';
    
    // 添加吃零食事件
    swayElement.addEventListener('click', function(e) {
        e.stopPropagation();
        handleFoodClick(swayElement, randomFood);
    });
    
    document.getElementById('food-effects-container').appendChild(swayElement);
    
    setTimeout(() => {
        if (swayElement.parentNode) {
            swayElement.remove();
        }
    }, 4000);
}

// 定期创建各种零食特效
setInterval(createFoodRain, 3000);      // 每3秒雪花掉落
setInterval(createFoodMeteor, 4000);    // 每4秒流星划过
setInterval(createBouncingFood, 8000);  // 每8秒弹跳
setInterval(createSpinningFood, 10000);  // 每10秒旋转
setInterval(createSwayingFood, 12000);   // 每12秒摇摆

// 额外的零食掉落效果
setInterval(() => {
    // 同时创建1-2个雪花零食
    for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        setTimeout(() => createFoodRain(), i * 800);
    }
}, 8000); // 每8秒创建一批

// 额外的流星效果
setInterval(() => {
    // 同时创建1个流星
    setTimeout(() => createFoodMeteor(), 0);
}, 10000); // 每10秒创建一批

// 触摸设备支持
document.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    clickEffect.textContent = '💖';
    clickEffect.style.left = touch.clientX + 'px';
    clickEffect.style.top = touch.clientY + 'px';
    document.body.appendChild(clickEffect);
    
    setTimeout(() => {
        clickEffect.remove();
    }, 500);
});

// 性能优化：图片预加载和缓存
function preloadCriticalImages() {
    // 关键图片已经通过HTML直接加载，这里只处理非关键图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // 提前50px开始加载
            threshold: 0.1
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // 降级处理：直接加载所有图片
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
        });
    }
}

// 页面加载完成后的欢迎效果
window.addEventListener('load', function() {
    // 性能监控
    const loadTime = performance.now();
    console.log(`页面加载时间: ${loadTime.toFixed(2)}ms`);
    
    // 资源加载统计
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
        console.log(`资源加载: ${resource.name} - ${resource.duration.toFixed(2)}ms`);
    });
    
    setTimeout(() => {
        const welcomeEffect = document.createElement('div');
        welcomeEffect.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 25px;
            z-index: 1000;
            animation: welcomePop 2s ease-out forwards;
            pointer-events: none;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        `;
        welcomeEffect.textContent = '嗨~咖喱咖喱！😊';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes welcomePop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                30% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
                70% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(welcomeEffect);
        
        setTimeout(() => {
            welcomeEffect.remove();
            style.remove();
        }, 2000);
    }, 500);
});

// 设置音乐控制事件
function setupMusicToggleButton() {
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    
    if (musicToggleBtn) {
        // 设置初始状态为开启
        musicToggleBtn.textContent = '🎵 关闭音乐';
        musicToggleBtn.classList.add('active');
        
        musicToggleBtn.addEventListener('click', function() {
            toggleBackgroundMusic();
        });
    }
}

// 切换背景音乐
function toggleBackgroundMusic() {
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    
    if (!musicActive) {
        // 开启音乐
        startBackgroundMusic();
        musicToggleBtn.textContent = '🎵 关闭音乐';
        musicToggleBtn.classList.add('active');
        musicActive = true;
        console.log('背景音乐已开启');
    } else {
        // 关闭音乐
        stopBackgroundMusic();
        musicToggleBtn.textContent = '🎵 开启音乐';
        musicToggleBtn.classList.remove('active');
        musicActive = false;
        console.log('背景音乐已关闭');
    }
}

// 开始背景音乐
function startBackgroundMusic() {
    // 外部音乐链接 - 您可以根据需要替换为其他音乐链接
    // QQ音乐外链方法：
    // 1. 使用QQ音乐外链API：https://api.qq.jsososo.com/
    // 2. 使用第三方解析服务：https://api.uomg.com/api/qqmusic
    // 3. 直接使用歌曲ID：https://music.163.com/song/media/outer/url?id=歌曲ID.mp3
    
    // 使用本地音频文件
    const musicUrl = '林心念 - 下次见.flac';
    
    if (!backgroundMusic) {
        backgroundMusic = new Audio();
        backgroundMusic.src = musicUrl;
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3; // 设置音量为30%
        
        // 处理音乐加载错误
        backgroundMusic.addEventListener('error', function() {
            console.log('音乐加载失败，请检查网络连接或音乐链接');
            // 可以在这里添加备用音乐链接
        });
        
        // 处理音乐加载成功
        backgroundMusic.addEventListener('canplaythrough', function() {
            console.log('音乐加载成功');
        });
    }
    
    // 播放音乐
    backgroundMusic.play().catch(function(error) {
        console.log('音乐播放失败:', error);
        // 某些浏览器需要用户交互后才能播放音频
        console.log('需要用户交互后才能播放音频，请点击页面任意位置');
    });
}

// 停止背景音乐
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}
