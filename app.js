const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

let ship,
  torpedo,
  target,
  sunkenTarget,
  torpedoesLeft,
  shipsDestroyed,
  consecutiveDestroys,
  gameEnded
const restartButton = document.getElementById('restartButton')
const leftButton = document.getElementById('leftButton')
const rightButton = document.getElementById('rightButton')
const fireButton = document.getElementById('fireButton')

// Функция для определения правильного склонения
function getShipDeclension(count) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'корабль'
  } else if (
    [2, 3, 4].includes(count % 10) &&
    ![12, 13, 14].includes(count % 100)
  ) {
    return 'корабля'
  } else {
    return 'кораблей'
  }
}

function initializeGame() {
  ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 10,
  }
  torpedo = null
  target = null
  sunkenTarget = null
  torpedoesLeft = 10
  shipsDestroyed = 0
  consecutiveDestroys = 0
  gameEnded = false

  initTarget()
  restartButton.style.display = 'none'
}

function initTarget() {
  target = {
    x: -40,
    y: Math.random() * 100,
    width: 40,
    height: 40,
    speed: 0.5 + Math.random(),
    direction: 1,
  }
}

function onResize() {
  const maxWidth = document.body.clientWidth
  canvas.width = maxWidth < 600 ? maxWidth : 600
  canvas.height = canvas.width
  initializeGame()
}

function update() {
  if (gameEnded) return

  if (torpedo) {
    torpedo.y -= 4
    if (torpedo.y < 0) {
      torpedo = null
    }
  }

  if (target && !sunkenTarget) {
    target.x += target.speed * target.direction
    if (target.x > canvas.width) {
      target = null
      initTarget()
    }
  }

  if (
    torpedo &&
    target &&
    torpedo.x < target.x + target.width &&
    torpedo.x + 5 > target.x &&
    torpedo.y < target.y + target.height &&
    torpedo.y + 10 > target.y
  ) {
    sunkenTarget = { ...target, sinkStep: 0 }
    target = null
    torpedo = null
    shipsDestroyed += 1
    consecutiveDestroys += 1

    if (consecutiveDestroys === 3) {
      torpedoesLeft += 1
      consecutiveDestroys = 0
    }
  }

  if (sunkenTarget) {
    sunkenTarget.sinkStep += 0.5
    if (sunkenTarget.sinkStep >= sunkenTarget.height) {
      sunkenTarget = null
      if (torpedoesLeft > 0) {
        initTarget()
      } else {
        endGame()
      }
    }
  }

  if (torpedoesLeft <= 0 && !torpedo) {
    endGame()
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#00f'
  ctx.fillRect(ship.x, ship.y, ship.width, ship.height)

  if (torpedo) {
    ctx.fillStyle = '#f00'
    ctx.fillRect(torpedo.x, torpedo.y, 5, 10)
  }

  if (target) {
    ctx.fillStyle = '#0f0'
    ctx.fillRect(target.x, target.y, target.width, target.height)
  }

  if (sunkenTarget) {
    ctx.fillStyle = '#0f0'
    ctx.fillRect(
      sunkenTarget.x,
      sunkenTarget.y + sunkenTarget.sinkStep,
      sunkenTarget.width,
      sunkenTarget.height - sunkenTarget.sinkStep
    )
  }

  // Отрисовка оставшихся торпед
  ctx.fillStyle = '#fff'
  for (let i = 0; i < torpedoesLeft; i++) {
    ctx.fillRect(20 + i * 20, canvas.height - 20, 10, 10)
  }

  // Счетчик сбитых кораблей с корректным склонением
  ctx.fillStyle = '#fff'
  ctx.font = '20px Arial'
  ctx.fillText(
    `Сбитые корабли: ${shipsDestroyed} ${getShipDeclension(shipsDestroyed)}`,
    10,
    30
  )

  // Сообщение об окончании игры
  if (gameEnded) {
    ctx.fillStyle = 'red'
    ctx.font = '40px Arial'
    ctx.fillText(
      'Игра окончена',
      canvas.width / 2 - 150,
      canvas.height / 2 - 20
    )
    ctx.font = '20px Arial'
    ctx.fillText(
      `Ваш результат: ${shipsDestroyed} ${getShipDeclension(shipsDestroyed)}`,
      canvas.width / 2 - 120,
      canvas.height / 2 + 20
    )
  }
}

function endGame() {
  gameEnded = true
  restartButton.style.display = 'block'
}

function gameLoop() {
  update()
  draw()
  requestAnimationFrame(gameLoop)
}

restartButton.addEventListener('click', () => {
  initializeGame()
  gameLoop()
})

// Обработчики для кнопок управления
leftButton.addEventListener('click', () => {
  if (!gameEnded && ship.x > 0) {
    ship.x -= 10
  }
})

rightButton.addEventListener('click', () => {
  if (!gameEnded && ship.x < canvas.width - ship.width) {
    ship.x += 10
  }
})

fireButton.addEventListener('click', () => {
  if (!gameEnded && !torpedo && torpedoesLeft > 0) {
    torpedo = { x: ship.x + ship.width / 2 - 2.5, y: ship.y }
    torpedoesLeft--
  }
})

window.addEventListener('keydown', (e) => {
  if (gameEnded) return

  if (e.key === 'ArrowLeft' && ship.x > 0) {
    ship.x -= 10
  }
  if (e.key === 'ArrowRight' && ship.x < canvas.width - ship.width) {
    ship.x += 10
  }
  if (e.key === ' ' && !torpedo && torpedoesLeft > 0) {
    torpedo = { x: ship.x + ship.width / 2 - 2.5, y: ship.y }
    torpedoesLeft--
  }
})

window.addEventListener('resize', onResize)
onResize()
gameLoop()
