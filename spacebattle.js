const ship = document.querySelector('.player-ship');
const alienShips = document.getElementsByClassName('alien-ship');
const alienStats = document.getElementsByClassName('alien-stats');

const playerScore = document.getElementById('player-score');
const playerStats = document.querySelector('.player-stats');

const attackBtn = document.getElementById('attack-btn');
const retreatBtn = document.getElementById('retreat-btn');

const currentTurn = document.getElementById('current-turn');
const actionsDisplay = document.querySelector('.current-actions');
const actionsList = [];

const playerScoreTemplate = (score) =>
    `USS Assembly: <span>${score}</span>`;
const playerStatsTemplate = (currentHull, maxHull, firepower, accuracy) =>
    `
            <p>HP: ${currentHull}/${maxHull}</p>
            <p>FP: ${firepower}</p>
            <p>Acc: ${accuracy}%</p>
`;

const range = (min, max) => Math.random() * (max - min) + min;

const alienStatsTemplate = (currentHull, maxHull, firepower, accuracy) => `<div class="alien-stats"><p>HP:${currentHull}/${maxHull}</p><p>FP:${firepower}</p><p>A: ${accuracy}%</p></div>`

class Ship {
    constructor() {
        this.name = 'USS Assembly';
        this.maxHull = 20;
        this.currentHull = this.maxHull;
        this.firepower = 5;
        this.accuracy = 0.7;
        this.score = 0;
    }

    DoDamage() {
        let target = Aliens[CurrentAlienIndex];
        actionsList.push(`${this.name} Attacking ${target.name}`);
        // console.log(`${this.name} Attacking ${target.name}`);
        let chance = Math.random();
        if (chance <= this.accuracy) {
            target.currentHull -= this.firepower;
            actionsList.push(`${this.name} hit ${target.name} for ${this.firepower} damage!`);

            if (target.currentHull <= 0)
                onAlienDestroyed();
            // console.log(`${this.name} hit ${this.name} for ${this.firepower} damage!`)
        } else {
            actionsList.push(`${this.name} missed!`);
            // console.log(`${this.name} missed!`);
        }

        // updateActionsDisplay();
    }

    Animate(element, className) {
        element.classList.add(className);
    }

    OnAnimationCompleted(element, className, callback) {
        element.classList.remove(className);
        this.DoDamage(Aliens[CurrentAlienIndex]);
        callback();
    }
}
class Alien {
    constructor(name) {
        this.name = name;
        this.maxHull = Math.trunc(range(8, 12));
        this.currentHull = this.maxHull;
        this.firepower = Math.trunc(range(2, 4));
        this.accuracy = range(.6, .8);
    }

    DoDamage() {
        let target = USSAssembly;
        //actionsList.push(`${this.name} Attacking ${target.name}`);
        // console.log(`${this.name} Attacking ${target.name}`);
        let chance = Math.random();
        if (chance <= this.accuracy) {
            target.currentHull -= this.firepower;
            actionsList.push(`${this.name} hit ${target.name} for ${this.firepower} damage!`);
            // console.log(`${this.name} hit ${this.name} for ${this.firepower} damage!`)

            if (target.currentHull <= 0)
                onPlayerDestroyed();
        } else {
            actionsList.push(`${this.name} missed!`);
            // console.log(`${this.name} missed!`);
        }
        // updateActionsDisplay();
    }

    Animate(element, className) {
        element.classList.add(className);
    }

    OnAnimationCompleted(element, className, callback) {
        element.classList.remove(className);
        this.DoDamage(Aliens[CurrentAlienIndex]);
        callback();
    }
}

// 0 = Player, 1 = Alien.
let CurrentTurnDisplay = '';
let PlayerTurn = true;
let CurrentAlienIndex = 0;

let USSAssembly = new Ship();

let Aliens = [];

const activeAlienData = () => Aliens[0];
const activeAlienShip = () => alienShip[0];

const SwitchTurn = () => {
    console.log('Switching Turns...');
    PlayerTurn = !PlayerTurn;
    if (PlayerTurn) {
        CurrentTurnDisplay = "Player's Turn!";
    } else {
        CurrentTurnDisplay = "Alien's Turn!";
    }
}

const animationCompletedLogic = {
    'player-ship': (element) => USSAssembly.OnAnimationCompleted(element, 'player-ship-attack-animation', () => {
        // console.log('Current Alien Index: ' + CurrentAlienIndex);
        // console.log('Alien Health before Attack: ' + Aliens[CurrentAlienIndex].currentHull);

        USSAssembly.DoDamage();
        // console.log('Alien Health after Attack: ' + Aliens[CurrentAlienIndex].currentHull);

        UpdateAlienStats();
        SwitchTurn();
        if (Aliens[CurrentAlienIndex].currentHull > 0)
            onAlienAttack();
    }),
    'alien-ship': (element) => Aliens[CurrentAlienIndex].OnAnimationCompleted(element, 'alien-ship-attack-animation', () => {
        Aliens[0].DoDamage();
        UpdatePlayerStats();
        SwitchTurn();
        attackBtn.disabled = false;
    })
}
const onAnimationCompleted = (element) => {
    if (element.classList.contains('player-ship-attack-animation') ||
        element.classList.contains('alien-ship-attack-animation')) {
        let className = element.classList[0];
        animationCompletedLogic[className](element);
    } else if (element.classList.contains('alien-ship') && element.classList.contains('player-ship-destroyed-animation')) {
        alienShips[CurrentAlienIndex].remove();
        Aliens.splice(CurrentAlienIndex, 1);
        console.log(Aliens);
        USSAssembly.score++;
        updatePlayerScore();

        if (alienShips.length === 0) {
            USSAssembly.Animate(ship, 'player-ship-leave-animation');
        }

        attackBtn.disabled = false;
    }
}

const updateActionsDisplay = () => {
    let repeat = () => {
        let actionsString = '';
        actionsList.forEach(action => actionsString += `<p>${action}</p>`);
        actionsDisplay.innerHTML = actionsString;

        actionsDisplay.scroll(0, 350);

        let t = setTimeout(() => {
            repeat();
            clearTimeout(t);
        }, 10);
    }
    repeat();
}

const updatePlayerScore = () => {
    playerScore.innerHTML = playerScoreTemplate(USSAssembly.score);
}

const onAlienDestroyed = () => {
    // console.log(alienStats);
    let alienShip = alienShips[0];
    alienShip.classList.add('player-ship-destroyed-animation');
    alienShip.classList.add('destroyed');
}
const onPlayerDestroyed = () => {
    ship.classList.add('player-ship-destroyed-animation');
}
const onPlayerAttack = () => {
    USSAssembly.Animate(ship, 'player-ship-attack-animation');
    attackBtn.disabled = true;
}
const onAlienAttack = () => {
    Aliens[CurrentAlienIndex].Animate(alienShips[CurrentAlienIndex], 'alien-ship-attack-animation');
}
const onRetreat = () => {
    ship.classList.add('player-ship-retreat-animation');
}

const Init = () => {
    CurrentAlienIndex = 0;
}

const UpdateAlienStats = () => {
    for (let i = 0; i < alienShips.length; i++) {
        let alienShipDiv = alienShips[i];
        let alienStats = Aliens[i];
        let currentHull = Math.trunc(alienStats.currentHull);
        let maxHull = Math.trunc(alienStats.maxHull);
        let firepower = Math.trunc(alienStats.firepower);
        let accuracy = Math.trunc(alienStats.accuracy * 100);

        alienShipDiv.innerHTML = alienStatsTemplate(currentHull, maxHull, firepower, accuracy);
    }
}
const UpdatePlayerStats = () => {
    playerStats.innerHTML = playerStatsTemplate(USSAssembly.currentHull, USSAssembly.maxHull, USSAssembly.firepower, USSAssembly.accuracy * 100);
}

window.onload = function () {
    Init();

    for (let i = 0; i < 6; i++) {
        Aliens.push(new Alien('Alien' + i, 5, 1, 1));
    }
    UpdateAlienStats();
    UpdatePlayerStats();
    updateActionsDisplay();
};