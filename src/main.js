// Main entry point
let game;
let username = "Warrior";

// Menu handling
document.getElementById('play-btn').addEventListener('click', startGame);
document.getElementById('username-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startGame();
});

function startGame() {
    username = document.getElementById('username-input').value.trim() || "Warrior";
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('stats-hud').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'block';
    document.getElementById('player-name').textContent = username;
    
    // Initialize Phaser game
    const config = {
        type: Phaser.AUTO,
        width: 1400,
        height: 900,
        parent: 'game-container',
        backgroundColor: '#2d5016',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [GameScene]
    };
    
    game = new Phaser.Game(config);
}

// Death screen handling
document.getElementById('respawn-btn').addEventListener('click', () => {
    if (game && game.scene.keys.GameScene) {
        game.scene.keys.GameScene.respawn();
    }
});

console.log('âš”ï¸ Medieval FFA .io - Ready');