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

        // 添加超时保护：10秒后强制隐藏加载界面
        this.loadingTimeout = setTimeout(() => {
            console.warn('⚠️ 图片加载超时，强制隐藏加载界面');
            if (this.loadingOverlay && this.loadingOverlay.style.display !== 'none') {
                this.hideLoading();
            }
        }, 10000);

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
            // 清除超时保护
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
            }
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
            // 清除超时保护
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
            }
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
    
    // 音乐功能已禁用
    // setupMusicToggleButton();
    // startBackgroundMusic();
    
    // 用户交互检测已禁用
    // let userInteracted = false;
    // document.addEventListener('click', function() {
    //     if (!userInteracted && musicActive) {
    //         userInteracted = true;
    //         if (backgroundMusic && backgroundMusic.paused) {
    //             backgroundMusic.play().catch(function(error) {
    //                 console.log('音乐播放失败:', error);
    //             });
    //         }
    //     }
    // });
    
    // 设置分数点击事件
    setupScoreClickEvent();
    
    new LoadingManager();
    // 预加载关键图片
    preloadCriticalImages();
    
    // 初始化关心弹窗系统
    initCareSystem();
    
    // 检查是否为生日日期（1月2日）并显示生日彩蛋
    checkBirthdayEgg();
});

// ========== 生日惊喜彩蛋系统 ==========
let birthdayEggActive = false;

// 检查是否为生日日期（以北京时间为准）
function checkBirthdayEgg() {
    // 获取北京时间
    const beijingTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const month = beijingTime.getMonth() + 1; // getMonth() 返回 0-11，所以+1
    const date = beijingTime.getDate();
    
    // 调试信息
    console.log('🕐 当前北京时间:', beijingTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log('📅 检查日期: 月份=' + month + ', 日期=' + date);
    
    // 检查是否为1月2日
    if (month === 1 && date === 2) {
        birthdayEggActive = true;
        console.log('🎉 生日彩蛋已激活！');
        // 延迟一点显示，让页面先加载
        setTimeout(() => {
            showBirthdayEgg();
        }, 1500);
    } else {
        console.log('ℹ️ 今天不是1月2日，生日彩蛋未激活');
    }
}

// 显示生日彩蛋
function showBirthdayEgg() {
    // 第一步：创建暗场覆盖层
    createBirthdayDarkOverlay(() => {
        // 第二步：显示倒计时
        showBirthdayCountdown(() => {
            // 第三步：显示闪烁的"生日快乐"标题
            showBirthdayTitle(() => {
                // 第四步：创建生日背景粒子效果
                createBirthdayParticles();
                
                // 第五步：创建彩色纸屑效果
                createBirthdayConfetti();
                
                // 第六步：显示生日祝福弹窗（带蜡烛）
                setTimeout(() => {
                    showBirthdayModal();
                }, 800);
                
                // 第七步：启动生日元素掉落（可点击收集）
                startBirthdayElements();
                
                console.log('🎉 生日快乐！生日彩蛋已激活！');
            });
        });
    });
}

// 创建生日背景粒子效果
function createBirthdayParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.id = 'birthday-particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5000;
        overflow: hidden;
    `;
    document.body.appendChild(particleContainer);
    
    // 创建闪烁粒子
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createBirthdayParticle(particleContainer);
        }, i * 100);
    }
    
    // 持续创建新粒子
    const particleInterval = setInterval(() => {
        if (birthdayEggActive) {
            createBirthdayParticle(particleContainer);
        } else {
            clearInterval(particleInterval);
        }
    }, 300);
}

// 创建暗场覆盖层（仪式感第一步）
function createBirthdayDarkOverlay(callback) {
    const darkOverlay = document.createElement('div');
    darkOverlay.id = 'birthday-dark-overlay';
    darkOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 14000;
        animation: birthdayDarkFadeIn 0.8s ease;
    `;
    document.body.appendChild(darkOverlay);
    
    setTimeout(() => {
        callback();
    }, 800);
}

// 播放生日音效
function playBirthdaySound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'countdown') {
            // 倒计时音效：短促的提示音
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } else if (type === 'celebration') {
            // 庆祝音效：愉快的音调
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        }
    } catch (e) {
        // 如果音频不支持，静默失败
        console.log('音频播放不支持');
    }
}

// 显示倒计时（仪式感第二步）
function showBirthdayCountdown(callback) {
    const countdownContainer = document.createElement('div');
    countdownContainer.id = 'birthday-countdown';
    countdownContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 14500;
        text-align: center;
    `;
    
    let count = 3;
    const countdownText = document.createElement('div');
    countdownText.style.cssText = `
        font-size: 120px;
        font-weight: bold;
        color: #ffeaa7;
        text-shadow: 0 0 30px rgba(255, 234, 167, 0.8), 0 0 60px rgba(255, 234, 167, 0.6);
        animation: birthdayCountdownPop 0.6s ease;
    `;
    countdownText.textContent = count;
    
    countdownContainer.appendChild(countdownText);
    document.body.appendChild(countdownContainer);
    
    // 播放第一个倒计时音效
    playBirthdaySound('countdown');
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.textContent = count;
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'birthdayCountdownPop 0.6s ease';
            }, 10);
            // 播放倒计时音效
            playBirthdaySound('countdown');
        } else {
            countdownText.textContent = '🎉';
            countdownText.style.fontSize = '150px';
            clearInterval(countdownInterval);
            // 播放庆祝音效
            playBirthdaySound('celebration');
            
            setTimeout(() => {
                countdownContainer.style.animation = 'birthdayCountdownFadeOut 0.5s ease';
                setTimeout(() => {
                    countdownContainer.remove();
                    callback();
                }, 500);
            }, 800);
        }
    }, 800);
}

// 显示"生日快乐"标题（仪式感第三步）- 大蛋糕为主角
function showBirthdayTitle(callback) {
    const titleContainer = document.createElement('div');
    titleContainer.id = 'birthday-title-screen';
    titleContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 14600;
        text-align: center;
        animation: birthdayTitleScreenIn 1s ease;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;
    
    // 创建大蛋糕（主角）
    const bigCake = document.createElement('div');
    bigCake.className = 'birthday-title-cake';
    bigCake.innerHTML = `
        <div class="title-cake-layer title-cake-layer-3"></div>
        <div class="title-cake-layer title-cake-layer-2"></div>
        <div class="title-cake-layer title-cake-layer-1"></div>
        <div class="title-cake-decoration">
            <span class="title-decoration">🍓</span>
            <span class="title-decoration">🍒</span>
            <span class="title-decoration">🍑</span>
            <span class="title-decoration">🍇</span>
        </div>
        <div class="title-candles">
            <span class="title-candle">🕯️</span>
            <span class="title-candle">🕯️</span>
            <span class="title-candle">🕯️</span>
        </div>
    `;
    
    // 创建"生日快乐"文字（作为点缀）
    const titleText = document.createElement('div');
    titleText.className = 'birthday-title-text-minor';
    titleText.innerHTML = `
        <div class="birthday-text">生日快乐</div>
        <div class="birthday-emojis">🎉 ✨ 🎈</div>
    `;
    
    titleContainer.appendChild(bigCake);
    titleContainer.appendChild(titleText);
    document.body.appendChild(titleContainer);
    
    // 蜡烛依次点亮
    setTimeout(() => {
        const candles = titleContainer.querySelectorAll('.title-candle');
        candles.forEach((candle, index) => {
            setTimeout(() => {
                candle.classList.add('title-candle-lit');
            }, index * 300);
        });
    }, 500);
    
    // 添加闪烁效果
    setTimeout(() => {
        titleText.style.animation = 'birthdayTitleFlash 1s ease-in-out 3';
        
        setTimeout(() => {
            titleContainer.style.animation = 'birthdayTitleScreenOut 0.8s ease';
            setTimeout(() => {
                titleContainer.remove();
                // 移除暗场覆盖层
                const darkOverlay = document.getElementById('birthday-dark-overlay');
                if (darkOverlay) {
                    darkOverlay.style.animation = 'birthdayDarkFadeOut 0.5s ease';
                    setTimeout(() => {
                        darkOverlay.remove();
                    }, 500);
                }
                callback();
            }, 800);
        }, 3500);
    }, 100);
}

// 创建单个闪烁粒子
function createBirthdayParticle(container) {
    const particle = document.createElement('div');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#ffeaa7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const emojis = ['✨', '⭐', '💫', '🌟', '💖', '💕'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    particle.textContent = randomEmoji;
    particle.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${Math.random() * 20 + 15}px;
        opacity: ${Math.random() * 0.5 + 0.3};
        animation: birthdayTwinkle ${Math.random() * 2 + 2}s ease-in-out infinite;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, 5000);
}

// 创建彩色纸屑效果
function createBirthdayConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'birthday-confetti';
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 4999;
        overflow: hidden;
    `;
    document.body.appendChild(confettiContainer);
    
    // 创建多波纸屑
    for (let wave = 0; wave < 3; wave++) {
        setTimeout(() => {
            createConfettiWave(confettiContainer);
        }, wave * 300);
    }
}

// 创建一波纸屑
function createConfettiWave(container) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#ffeaa7', '#fd79a8'];
    const shapes = ['🎉', '🎊', '✨', '⭐'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.textContent = randomShape;
        confetti.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -50px;
            font-size: ${Math.random() * 20 + 15}px;
            color: ${randomColor};
            opacity: 0.9;
            animation: confettiFall ${Math.random() * 3 + 3}s ease-out forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        container.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 6000);
    }
}

// 显示生日祝福弹窗
function showBirthdayModal() {
    const modal = document.createElement('div');
    modal.className = 'birthday-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 15000;
        backdrop-filter: blur(8px);
        animation: birthdayFadeIn 0.8s ease;
    `;
    
    const content = document.createElement('div');
    content.className = 'birthday-modal-content';
    content.innerHTML = `
        <div class="birthday-cake-wrapper">
            <div class="birthday-special-cake">
                <div class="cake-layer cake-layer-3"></div>
                <div class="cake-layer cake-layer-2"></div>
                <div class="cake-layer cake-layer-1"></div>
                <div class="cake-decoration">
                    <span class="decoration decoration-1">🍓</span>
                    <span class="decoration decoration-2">🍒</span>
                    <span class="decoration decoration-3">🍑</span>
                    <span class="decoration decoration-4">🍇</span>
                    <span class="decoration decoration-5">🍓</span>
                </div>
                <div class="birthday-candles">
                    <span class="candle">🕯️</span>
                    <span class="candle">🕯️</span>
                    <span class="candle">🕯️</span>
                </div>
            </div>
        </div>
        <h1 class="birthday-title">生日快乐！🎉</h1>
        <p class="birthday-message">今天是你的专属日子！</p>
        <p class="birthday-submessage">这份专属的生日蛋糕，是我为你精心准备的～</p>
        <div class="birthday-wishes">
            <div class="wish-item">💝 愿你的每一天都像这蛋糕一样甜美</div>
            <div class="wish-item">🌟 愿你所有的愿望都能实现</div>
            <div class="wish-item">🎁 愿你被这个世界温柔以待</div>
        </div>
        <div class="birthday-heart-message">
            <span class="heart-emoji">💕</span>
            <span>愿你永远开心，永远被爱</span>
            <span class="heart-emoji">💕</span>
        </div>
        <div class="birthday-balloons">
            <span class="balloon">🎈</span>
            <span class="balloon">🎈</span>
            <span class="balloon">🎈</span>
        </div>
        <div class="birthday-interactions">
            <button class="birthday-blow-btn" id="blow-candles-btn">💨 吹蜡烛许愿</button>
        </div>
        <button class="birthday-close-btn" id="close-modal-btn" style="display: none;">知道啦</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    let candlesBlown = 0;
    const totalCandles = 3;
    let wishMade = false;
    
    // 蜡烛点燃动画
    setTimeout(() => {
        const candles = content.querySelectorAll('.candle');
        candles.forEach((candle, index) => {
            setTimeout(() => {
                candle.classList.add('candle-lit');
                setTimeout(() => {
                    candle.classList.add('candle-burn');
                }, 100);
            }, index * 250);
        });
    }, 500);
    
    // 吹蜡烛功能
    const blowBtn = content.querySelector('#blow-candles-btn');
    const candles = content.querySelectorAll('.candle');
    
    blowBtn.addEventListener('click', () => {
        if (candlesBlown < totalCandles) {
            // 播放吹气音效
            playBlowSound();
            
            // 依次吹灭蜡烛
            candles.forEach((candle, index) => {
                if (!candle.classList.contains('candle-blown')) {
                    setTimeout(() => {
                        blowOutCandle(candle);
                        candlesBlown++;
                        
                        // 所有蜡烛都吹灭后，显示许愿界面
                        if (candlesBlown === totalCandles) {
                            setTimeout(() => {
                                showWishModal(content, modal);
                            }, 800);
                        }
                    }, index * 300);
                    return;
                }
            });
        }
    });
    
    // 也可以直接点击蜡烛吹灭
    candles.forEach((candle) => {
        candle.addEventListener('click', () => {
            if (!candle.classList.contains('candle-blown') && candle.classList.contains('candle-lit')) {
                playBlowSound();
                blowOutCandle(candle);
                candlesBlown++;
                
                if (candlesBlown === totalCandles) {
                    setTimeout(() => {
                        showWishModal(content, modal);
                    }, 800);
                }
            }
        });
        
        // 添加提示
        candle.style.cursor = 'pointer';
        candle.title = '点击吹灭蜡烛';
    });
    
    // 关闭按钮事件
    const closeBtn = content.querySelector('#close-modal-btn');
    closeBtn.addEventListener('click', () => {
        // 添加关闭特效
        content.style.animation = 'birthdayModalShake 0.3s ease';
        setTimeout(() => {
            modal.style.animation = 'birthdayFadeOut 0.5s ease';
            setTimeout(() => {
                modal.remove();
            }, 500);
        }, 300);
    });
    
    // 点击背景也可以关闭（但需要先许愿）
    modal.addEventListener('click', (e) => {
        if (e.target === modal && wishMade) {
            content.style.animation = 'birthdayModalShake 0.3s ease';
            setTimeout(() => {
                modal.style.animation = 'birthdayFadeOut 0.5s ease';
                setTimeout(() => {
                    modal.remove();
                }, 500);
            }, 300);
        }
    });
}

// 吹灭蜡烛
function blowOutCandle(candle) {
    candle.classList.add('candle-blown');
    candle.classList.remove('candle-burn');
    
    // 创建烟雾效果
    const smoke = document.createElement('div');
    smoke.className = 'candle-smoke';
    const rect = candle.getBoundingClientRect();
    smoke.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top}px;
        width: 20px;
        height: 20px;
        background: rgba(200, 200, 200, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 15001;
        animation: smokeRise 1.5s ease-out forwards;
    `;
    document.body.appendChild(smoke);
    
    setTimeout(() => {
        smoke.remove();
    }, 1500);
}

// 播放吹气音效
function playBlowSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 吹气音效：低频风声
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('音频播放不支持');
    }
}

// 显示许愿界面
function showWishModal(content, modal) {
    // 隐藏吹蜡烛按钮
    const blowBtn = content.querySelector('#blow-candles-btn');
    if (blowBtn) {
        blowBtn.style.display = 'none';
    }
    
    const wishContainer = document.createElement('div');
    wishContainer.className = 'wish-modal-container';
    wishContainer.innerHTML = `
        <div class="wish-modal-content">
            <div class="wish-title">✨ 许个愿吧 ✨</div>
            <p class="wish-hint">闭上眼睛，在心里默默许下你的愿望...</p>
            <div class="wish-options">
                <button class="wish-option-btn" data-wish="健康快乐">💚 健康快乐</button>
                <button class="wish-option-btn" data-wish="心想事成">💫 心想事成</button>
                <button class="wish-option-btn" data-wish="学业有成">📚 学业有成</button>
                <button class="wish-option-btn" data-wish="工作顺利">💼 工作顺利</button>
                <button class="wish-option-btn" data-wish="爱情甜蜜">💕 爱情甜蜜</button>
                <button class="wish-option-btn" data-wish="财源滚滚">💰 财源滚滚</button>
            </div>
            <div class="wish-custom">
                <input type="text" class="wish-input" placeholder="或者写下你的专属愿望..." maxlength="20">
                <button class="wish-submit-btn">许愿</button>
            </div>
        </div>
    `;
    
    content.appendChild(wishContainer);
    
    // 许愿选项按钮
    const wishOptions = wishContainer.querySelectorAll('.wish-option-btn');
    wishOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const wish = btn.dataset.wish;
            completeWish(wish, wishContainer, content, modal);
        });
    });
    
    // 自定义愿望
    const wishInput = wishContainer.querySelector('.wish-input');
    const wishSubmit = wishContainer.querySelector('.wish-submit-btn');
    
    wishSubmit.addEventListener('click', () => {
        const customWish = wishInput.value.trim();
        if (customWish) {
            completeWish(customWish, wishContainer, content, modal);
        } else {
            wishInput.style.border = '2px solid #ff6b6b';
            setTimeout(() => {
                wishInput.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            }, 500);
        }
    });
    
    // 回车提交
    wishInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            wishSubmit.click();
        }
    });
}

// 许愿数据收集配置（GitHub Pages 专用）
// 
// 由于 GitHub Pages 只支持静态网站，推荐使用以下方案：
//
// ⭐ 方案一：使用 Webhook.site（最简单，强烈推荐）
// 1. 访问 https://webhook.site
// 2. 复制生成的唯一URL（类似：https://webhook.site/xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx）
// 3. 填入下面的 WISH_API_URL
// 4. 所有许愿会发送到 webhook.site，你可以在网页上实时查看
//
// 方案二：使用 Formspree（发送到邮箱）
// 1. 访问 https://formspree.io 注册
// 2. 创建表单获取ID
// 3. 填入：'https://formspree.io/f/你的表单ID'
//
// 如果留空，许愿内容会在浏览器控制台输出（按F12查看）
// 详细说明请查看：GitHub-Pages-许愿收集方案.md
const WISH_API_URL = 'https://webhook.site/31956b7c-12fb-458d-8c6b-52e64a1fd0c6'; // 在这里填入你的接收地址

// 发送许愿数据到服务器
function sendWishToServer(wish) {
    // 获取北京时间
    const beijingTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    
    const wishData = {
        wish: wish,
        timestamp: beijingTime.toISOString(),
        date: beijingTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        beijingTime: beijingTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: 'Asia/Shanghai',
        referrer: document.referrer || 'direct'
    };
    
    // 如果有配置API地址，发送到服务器
    if (WISH_API_URL && WISH_API_URL.trim() !== '') {
        // 先输出调试信息
        console.log('📤 正在发送许愿数据...');
        console.log('许愿内容:', wish);
        console.log('完整数据:', wishData);
        console.log('发送地址:', WISH_API_URL);
        
        // 确保数据不为空
        if (!wish || wish.trim() === '') {
            console.error('❌ 许愿内容为空，无法发送');
            return;
        }
        
        const jsonData = JSON.stringify(wishData);
        console.log('JSON数据:', jsonData);
        
        // 检测是否为本地文件访问（file://协议）
        const isLocalFile = window.location.protocol === 'file:';
        // 检测是否为webhook.site（需要使用FormData避免CORS预检请求）
        const isWebhookSite = WISH_API_URL && WISH_API_URL.includes('webhook.site');
        
        console.log('🔍 调试信息:', { isLocalFile, isWebhookSite, WISH_API_URL });
        
        // 对于webhook.site或本地文件，使用FormData方式（避免CORS问题）
        if (isLocalFile || isWebhookSite) {
            if (isLocalFile) {
                console.log('ℹ️ 检测到本地文件访问，使用FormData方式发送');
            } else {
                console.log('ℹ️ 检测到webhook.site，使用FormData方式发送（避免CORS预检请求）');
            }
            
            // 使用FormData方式（不会触发CORS预检请求）
            const formData = new FormData();
            formData.append('wish', wish);
            formData.append('data', jsonData); // 完整JSON数据
            formData.append('timestamp', wishData.timestamp);
            formData.append('date', wishData.date);
            formData.append('beijingTime', wishData.beijingTime);
            formData.append('userAgent', wishData.userAgent);
            formData.append('language', wishData.language);
            formData.append('timezone', wishData.timezone);
            formData.append('referrer', wishData.referrer);
            
            fetch(WISH_API_URL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors', // 使用no-cors模式避免CORS预检请求（webhook.site支持）
                cache: 'no-cache'
            })
            .then(() => {
                // no-cors模式下无法读取响应，但请求应该已发送
                console.log('✅ 许愿数据已发送（FormData + no-cors模式）');
                console.log('💡 提示：请在webhook.site查看是否收到数据');
            })
            .catch(error => {
                console.error('❌ 发送许愿时出错:', error);
                console.error('错误详情:', error.message);
                console.log('许愿内容:', wishData);
            });
        } else {
            // 其他API使用JSON格式（需要API服务器支持CORS）
            fetch(WISH_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonData,
                mode: 'cors',
                cache: 'no-cache'
            })
            .then(response => {
                console.log('📥 收到响应:', response.status, response.statusText);
                if (response.ok) {
                    console.log('✅ 许愿已成功发送到服务器');
                    return response.text().then(text => {
                        console.log('响应内容:', text);
                    });
                } else {
                    console.warn('⚠️ 许愿发送失败，状态码:', response.status);
                    console.log('许愿内容:', wishData);
                    return response.text().then(text => {
                        console.log('错误响应:', text);
                    });
                }
            })
            .catch(error => {
                console.error('❌ 发送许愿时出错:', error);
                console.error('错误详情:', error.message);
                console.error('错误堆栈:', error.stack);
                console.log('许愿内容:', wishData);
                console.log('JSON数据:', jsonData);
            });
        }
    } else {
        // 如果没有配置API，在控制台输出（方便调试和查看）
        console.log('🎂 收到新的许愿:');
        console.log('愿望内容:', wish);
        console.log('许愿时间（北京时间）:', wishData.beijingTime);
        console.log('完整数据:', wishData);
        console.log('💡 提示: 要接收许愿内容，请在 script.js 中配置 WISH_API_URL');
    }
}

// 完成许愿
function completeWish(wish, wishContainer, content, modal) {
    // 发送许愿数据到服务器
    sendWishToServer(wish);
    
    // 播放许愿音效
    playWishSound();
    
    // 创建愿望飞走动画
    const wishText = document.createElement('div');
    wishText.className = 'wish-flying';
    wishText.textContent = wish;
    wishText.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 36px;
        font-weight: bold;
        color: #ffeaa7;
        text-shadow: 0 0 20px rgba(255, 234, 167, 0.8);
        z-index: 15002;
        animation: wishFlyAway 2s ease-out forwards;
        pointer-events: none;
    `;
    document.body.appendChild(wishText);
    
    // 创建星星特效
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createWishStar();
        }, i * 50);
    }
    
    // 移除许愿界面
    wishContainer.style.animation = 'wishFadeOut 0.5s ease';
    setTimeout(() => {
        wishContainer.remove();
        
        // 确保吹蜡烛按钮已隐藏
        const blowBtn = content.querySelector('#blow-candles-btn');
        if (blowBtn) {
            blowBtn.style.display = 'none';
        }
        
        // 显示完成消息
        const completeMsg = document.createElement('div');
        completeMsg.className = 'wish-complete-msg';
        completeMsg.innerHTML = `
            <div class="complete-emoji">✨</div>
            <div class="complete-text">愿望已许下，一定会实现的！</div>
        `;
        content.appendChild(completeMsg);
        
        // 显示关闭按钮
        const closeBtn = content.querySelector('#close-modal-btn');
        closeBtn.style.display = 'block';
        
        // 标记已许愿
        modal.wishMade = true;
        
        setTimeout(() => {
            wishText.remove();
        }, 2000);
    }, 500);
}

// 创建许愿星星
function createWishStar() {
    const star = document.createElement('div');
    const stars = ['✨', '⭐', '💫', '🌟'];
    star.textContent = stars[Math.floor(Math.random() * stars.length)];
    star.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${Math.random() * 20 + 20}px;
        pointer-events: none;
        z-index: 15001;
        animation: wishStarTwinkle 2s ease-out forwards;
    `;
    document.body.appendChild(star);
    
    setTimeout(() => {
        star.remove();
    }, 2000);
}

// 播放许愿音效
function playWishSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 许愿音效：美妙的音调
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15); // E
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3); // G
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.45); // C高
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
    } catch (e) {
        console.log('音频播放不支持');
    }
}

// 启动生日元素掉落（可点击收集）- 各种蛋糕
function startBirthdayElements() {
    const birthdayElements = ['🎂', '🍰', '🧁', '🍩', '🎂', '🍰', '🧁', '🍩'];
    
    // 每隔一段时间掉落生日元素
    const birthdayElementInterval = setInterval(() => {
        if (birthdayEggActive) {
            createBirthdayElement(birthdayElements[Math.floor(Math.random() * birthdayElements.length)]);
        } else {
            clearInterval(birthdayElementInterval);
        }
    }, 2000);
    
    // 立即创建几个
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            createBirthdayElement(birthdayElements[Math.floor(Math.random() * birthdayElements.length)]);
        }, i * 500);
    }
}

// 创建可点击的生日元素
function createBirthdayElement(emoji) {
    const element = document.createElement('div');
    element.className = 'birthday-element';
    element.textContent = emoji;
    element.style.cssText = `
        position: fixed;
        left: ${Math.random() * 80 + 10}%;
        top: -100px;
        font-size: ${Math.random() * 30 + 40}px;
        cursor: pointer;
        z-index: 10002;
        animation: birthdayElementFall ${Math.random() * 2 + 4}s linear forwards;
        pointer-events: auto;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        transition: transform 0.2s ease;
    `;
    
    // 悬停效果
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'scale(1.3) rotate(15deg)';
    });
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1) rotate(0deg)';
    });
    
    // 点击事件 - 收集生日元素获得额外快乐值
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        handleBirthdayElementClick(element, emoji);
    });
    
    document.body.appendChild(element);
    
    // 自动移除
    setTimeout(() => {
        if (element.parentNode) {
            element.style.animation = 'birthdayElementDisappear 0.5s ease forwards';
            setTimeout(() => {
                if (element.parentNode) {
                    element.remove();
                }
            }, 500);
        }
    }, 6000);
}

// 处理生日元素点击
function handleBirthdayElementClick(element, emoji) {
    // 创建收集特效
    const effect = document.createElement('div');
    effect.textContent = `+50 🎁`;
    effect.style.cssText = `
        position: fixed;
        left: ${element.getBoundingClientRect().left}px;
        top: ${element.getBoundingClientRect().top}px;
        font-size: 24px;
        font-weight: bold;
        color: #ff6b6b;
        pointer-events: none;
        z-index: 20000;
        animation: birthdayScorePop 1s ease-out forwards;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(effect);
    
    // 增加快乐值（如果游戏激活）
    if (scoreGameActive) {
        gameScore += 50;
        updateScoreDisplay();
    }
    
    // 创建星星爆炸特效
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const star = document.createElement('div');
        star.textContent = '✨';
        const angle = (i / 8) * Math.PI * 2;
        const distance = 60;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        star.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            font-size: 20px;
            pointer-events: none;
            z-index: 19999;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(star);
        
        // 使用requestAnimationFrame实现爆炸动画
        let startTime = null;
        const duration = 800;
        const startX = centerX;
        const startY = centerY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        function animateStar(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓出函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const currentX = startX + deltaX * easeOut;
            const currentY = startY + deltaY * easeOut;
            const scale = 1 + easeOut * 0.5;
            const rotate = progress * 360;
            const opacity = 1 - progress;
            
            star.style.left = currentX + 'px';
            star.style.top = currentY + 'px';
            star.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
            star.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animateStar);
            } else {
                if (star.parentNode) {
                    star.remove();
                }
            }
        }
        
        requestAnimationFrame(animateStar);
    }
    
    // 移除元素
    element.style.animation = 'birthdayElementCollect 0.5s ease forwards';
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
        if (effect.parentNode) {
            effect.remove();
        }
    }, 500);
}

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
        // 开启积分游戏，关闭关心弹窗
        scoreToggleBtn.textContent = '🎯 吃饱啦吃饱啦！停止收集快乐值';
        scoreToggleBtn.classList.add('active');
        if (gameScore) gameScore.style.display = 'block';
        if (gameHint) gameHint.style.display = 'block';
        
        // 重置分数
        gameScore = 0;
        comboCount = 0;
        updateScoreDisplay();
        
        // 关闭关心弹窗
        stopCareAutoMode();
        
        console.log('积分游戏已开启');
    } else {
        // 关闭积分游戏，开启关心弹窗
        scoreToggleBtn.textContent = '🎯 开吃！收集快乐值';
        scoreToggleBtn.classList.remove('active');
        if (gameScore) gameScore.style.display = 'none';
        if (gameHint) gameHint.style.display = 'none';
        
        // 重新开启关心弹窗
        startCareAutoMode();
        
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

// 获取食物分数（主要是各种蛋糕）
function getFoodScore(food) {
    const scoreMap = {
        '🎂': 25,  // 生日蛋糕 - 最高分
        '🍰': 22,  // 蛋糕
        '🧁': 20,  // 纸杯蛋糕
        '🍩': 18,  // 甜甜圈
        // 保留一些原有食物以防万一
        '🍟': 10, '🍕': 15, '🍭': 8, '🍪': 12,
        '🍫': 14, '🍬': 6, '🥨': 16, '🍯': 22, '🧀': 13,
        '🥞': 11, '🍞': 9, '🥖': 7, '🥐': 8
    };
    return scoreMap[food] || 18; // 默认值改为蛋糕的平均分
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

// 雪花式缓慢掉落 - 各种蛋糕
function createFoodRain() {
    const foods = ['🎂', '🍰', '🧁', '🍩', '🎂', '🍰', '🧁', '🍩', '🎂', '🍰', '🧁', '🍩'];
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

// 流星式划过 - 各种蛋糕
function createFoodMeteor() {
    const foods = ['🎂', '🍰', '🧁', '🍩', '🎂', '🍰', '🧁', '🍩', '🎂', '🍰', '🧁', '🍩'];
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

// 食物弹跳效果 - 各种蛋糕
function createBouncingFood() {
    const foods = ['🎂', '🍰', '🧁', '🍩', '🎂', '🍰'];
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

// 零食旋转效果 - 各种蛋糕
function createSpinningFood() {
    const foods = ['🎂', '🍰', '🧁', '🍩', '🎂', '🍰', '🧁'];
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

// 零食摇摆效果 - 各种蛋糕
function createSwayingFood() {
    const foods = ['🎂', '🍰', '🧁', '🍩', '🎂', '🍰'];
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

// ========== 关心弹窗系统 ==========
// 关心文案库
const cares = [
    '今天也很棒呀，别忘了多喝水，闭眼休息一分钟~',
    '记得按时吃饭，热乎乎的饭菜会给你新的能量！',
    '别急，慢慢来就好，我一直都在为你加油~',
    '深呼吸三次，看看窗外的天空，你已经很努力了。',
    '你真的很好，不要和别人比，做独一无二的你。',
    '早点休息，今晚的星星也替我守护你的梦。',
    '给自己一个抱抱吧，你值得被温柔以待。',
    '晒晒太阳，走几步路，快乐会悄悄跟上来。',
    '如果觉得难，就把目标拆小一点，一步一步来。',
    '你并不孤单，有需要就叫我，我随时出现。',
    '奖励自己一杯喜欢的饮料吧，今天也辛苦啦！',
    '你的感受很重要，被看见、被理解也同样重要。',
    '做题卡住就歇口气，换个角度它就有答案了。',
    '优先做最重要的一件事，完成它你就会更轻松。',
    '给颈椎放个假，轻轻转动肩颈，放松一下～',
    '出门带件外套，风会小点，你会暖一些。',
    '别和情绪对抗，先接住它，然后温柔放下。',
    '哪怕只前进一步，也是在靠近你想要的生活。',
    '谢谢今天辛苦的自己，也谢谢正在努力的你。',
    '和朋友分享一件小快乐，快乐会加倍。',
    '伸个懒腰或走两步路，心情会跟着亮一点。',
    '放一首喜欢的歌，世界立刻有了滤镜。',
    '任何小小进步都值得一个拥抱和庆祝！',
    '允许难过一会儿，醒来后我们继续走。',
    '早安呀，今天要带着喜欢出发～',
    '晚安，月亮和我都祝你做个甜甜的梦。',
    '周一不紧不慢，先把状态找回来就好。',
    '把待办放一放，今天留给喜欢和休息。',
    '会做的稳稳拿下，不会的别纠缠，先过一遍！',
    '拆解任务、画个小清单，你会更有掌控感。',
    '你说的很重要，先记下来，我们一起优化它。',
    '给感受命名：紧张/期待/轻松…它会变得可聊。',
    '买杯小甜饮，奖励认真生活的自己。',
    '设置25分钟专注计时器，结束后拥抱一下自己。',
    '学会说不，守住精力，才能更好地爱。',
    '再难的夜也会过去，太阳总会升起来。',
    '吃好、睡好、动一动，是最基础也最重要的爱。',
    '点一支香薰或整理书桌，让生活发光。',
    '把想说的话写下来，清晰就从这一步开始。',
    // 新增好朋友之间的暖心关心
    '累了就说，我陪你停下来歇会儿。',
    '不开心的时候，可以随时来找我聊天哦。',
    '你的小进步我都看在眼里，真的很棒！',
    '困了就早点睡，明天的事明天再说。',
    '喝口热水，慢慢来，别着急。',
    '想吃什么就去吃，开心最重要。',
    '遇到难题别硬扛，休息一下脑子会更清醒。',
    '今天辛苦了，记得好好对待自己。',
    '别熬夜了，身体比什么都重要。',
    '眼睛酸了就看看远处，让眼睛休息一下。',
    '天冷了，记得多穿点衣服，别感冒了。',
    '最近压力大吗？需要的话我随时在。',
    '别总想着完美，你已经做得很好了。',
    '遇到开心的事记得跟我分享呀！',
    '有什么心事可以跟我说，不用自己憋着。',
    '先吃点东西垫垫肚子，饿着会没精神的。',
    '工作学习之余，也要留点时间给自己放松。',
    '别太在意别人的看法，你自己舒服最重要。',
    '今天天气不错，出去走走会心情好一点。',
    '遇到烦心事了吗？说出来会好受一些。',
    '你已经够努力了，不用逼自己那么紧。',
    '记得定时站起来活动活动，久坐对身体不好。',
    '晚上别玩手机太晚，对眼睛不好。',
    '心情不好的时候，就做点喜欢的事吧。',
    '别一个人扛着，有我在呢。',
    '慢慢来，不着急，一步一步来就好。',
    '今天过得怎么样？记得照顾好自己。',
    '累的时候就放下手里的事，休息比什么都重要。',
    '别忘了给家里人打个电话，他们会想你的。',
    '试着对镜子里的自己笑一笑，会感觉好一点。',
    '遇到挫折很正常，谁都会有不顺的时候。',
    '别把所有事都往心里装，该放下的就放下。',
    '最近睡得好吗？睡眠不好什么都做不好。',
    '别总是想着还没做的，看看自己已经完成的。',
    '偶尔偷个懒也没关系，劳逸结合才能走得更远。',
    '你比自己想象的要坚强很多。',
    '别急着否定自己，给自己多一点耐心。',
    '下次一起出去玩吧，放松一下心情。',
    '记得按时吃药，健康最重要。',
    '别总熬夜刷手机，早睡早起身体好。',
    '遇到困难记得向别人求助，不是软弱的表现。',
    '你的努力大家都看得见，别妄自菲薄。',
    '心情低落的时候，听听音乐会好一些。',
    '别对自己太苛刻，人无完人。',
    '今天也要开开心心的，你值得所有美好。',
    '记得多喝温水，对身体好。',
    '有时候放空一下也挺好的，不用想太多。',
    '别憋着情绪，哭出来也没什么丢人的。',
    '你已经做得很好了，相信自己。',
    '别让负面情绪一直困扰你，试着转移注意力。',
];

let careAutoTimer = null;

// 单个随机位置小弹窗
function spawnCareBubble() {
    const b = document.createElement('div');
    const c = cares[Math.floor(Math.random() * cares.length)];
    b.textContent = c;
    const left = Math.random() * 86 + 4;
    const top = Math.random() * 86 + 6;
    
    // 检测是否为移动端
    const isMobile = window.innerWidth <= 768;
    
    b.style.cssText = `
        position: fixed;
        left: ${left}vw;
        top: ${top}vh;
        max-width: ${isMobile ? '30vw' : '52vw'};
        background: rgba(255,255,255,.98);
        border: ${isMobile ? '1px' : '2px'} solid rgba(255,107,107,.35);
        color: #444;
        padding: ${isMobile ? '5px 7px' : '14px 16px'};
        font-size: ${isMobile ? '8px' : '18px'};
        border-radius: ${isMobile ? '6px' : '12px'};
        box-shadow: 0 ${isMobile ? '4px 12px' : '8px 22px'} rgba(0,0,0,.22);
        z-index: 10005;
        animation: careFadeUp 4.5s ease forwards;
        pointer-events: auto;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        line-height: ${isMobile ? '1.25' : '1.5'};
    `;
    
    let removeTimer = setTimeout(() => b.remove(), 4500);
    
    // 鼠标/触摸悬停时暂停消失动画并保持显示
    const handleEnter = () => {
        b.style.animationPlayState = 'paused';
        b.style.opacity = '1';
        b.style.transform = `translateY(0) scale(${isMobile ? '1.03' : '1.05'})`;
        b.style.boxShadow = '0 12px 30px rgba(0,0,0,.3)';
        clearTimeout(removeTimer);
    };
    
    // 鼠标/触摸移出后恢复并在1秒后消失
    const handleLeave = () => {
        b.style.animationPlayState = 'running';
        b.style.transform = 'translateY(0) scale(1)';
        b.style.boxShadow = '0 8px 22px rgba(0,0,0,.22)';
        removeTimer = setTimeout(() => b.remove(), 1000);
    };
    
    b.addEventListener('mouseenter', handleEnter);
    b.addEventListener('mouseleave', handleLeave);
    b.addEventListener('touchstart', handleEnter);
    b.addEventListener('touchend', handleLeave);
    
    b.addEventListener('click', () => {
        clearTimeout(removeTimer);
        b.remove();
    });
    
    document.body.appendChild(b);
}

// 开启关心弹窗自动模式
function startCareAutoMode() {
    if (careAutoTimer) return; // 已经在运行
    
    spawnCareBubble();
    careAutoTimer = setInterval(() => {
        const k = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < k; i++) {
            setTimeout(spawnCareBubble, i * 120);
        }
    }, Math.floor(Math.random() * 600) + 700);
    
    console.log('关心弹窗已开启');
}

// 停止关心弹窗自动模式
function stopCareAutoMode() {
    if (careAutoTimer) {
        clearInterval(careAutoTimer);
        careAutoTimer = null;
        console.log('关心弹窗已关闭');
    }
}

// 初始化关心弹窗系统
function initCareSystem() {
    // 默认开启关心弹窗
    setTimeout(() => {
        startCareAutoMode();
    }, 1000);
}
