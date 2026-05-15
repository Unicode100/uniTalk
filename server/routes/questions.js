const express = require('express')
const router = express.Router()
const db = require('../db')
const jwt = require('jsonwebtoken')

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT q.id, q.title, q.body, q.tags, q.created_at,
             COALESCE(u.name, 'Аноним') as author_name,
             COUNT(a.id) as answer_count
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN answers a ON a.question_id = q.id
      GROUP BY q.id, u.name
      ORDER BY q.created_at DESC
      LIMIT 20
    `)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка загрузки вопросов' })
  }
})

router.post('/', async (req, res) => {
  const { title, body, tags } = req.body
  const authHeader = req.headers.authorization

  if (!authHeader) return res.status(401).json({ error: 'Нет токена' })

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('decoded:', decoded)

    const result = await db.query(
      'INSERT INTO questions (user_id, title, body, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [decoded.id, title, body, tags]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Ошибка авторизации' })
  }
})

module.exports = router
