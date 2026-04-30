const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

// РЕГИСТРАЦИЯ — POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  // Проверяем что все поля заполнены
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Заполни все поля' })
  }

  try {
    // Проверяем что такой email ещё не зарегистрирован
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Этот email уже зарегистрирован' })
    }

    // Шифруем пароль — никогда не храним пароли открытым текстом
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаём handle из имени (например "Алексей Козлов" → "aleksey_kozlov")
    const handle = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()

    // Сохраняем пользователя в базу
    const result = await db.query(
      `INSERT INTO users (name, email, password, handle) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, handle`,
      [name, email, hashedPassword, handle]
    )

    const user = result.rows[0]

    // Создаём токен — это как пропуск, браузер будет его хранить
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // токен действует 7 дней
    )

    res.json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// ВХОД — POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполни все поля' })
  }

  try {
    // Ищем пользователя по email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Неверный email или пароль' })
    }

    const user = result.rows[0]

    // Проверяем пароль
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Неверный email или пароль' })
    }

    // Выдаём токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, handle: user.handle } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router