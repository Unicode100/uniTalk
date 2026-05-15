const express = require('express')
const router = express.Router()
const db = require('../db')
const jwt = require('jsonwebtoken')

// Получить ответы на вопрос
router.get('/:questionId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, a.body, a.created_at,
             COALESCE(u.name, 'Аноним') as author_name
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.created_at ASC
    `, [req.params.questionId])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка загрузки ответов' })
  }
})

// Опубликовать ответ
router.post('/:questionId', async (req, res) => {
  const { body } = req.body
  const authHeader = req.headers.authorization

  if (!authHeader) return res.status(401).json({ error: 'Нет токена' })

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const result = await db.query(
      'INSERT INTO answers (question_id, user_id, body) VALUES ($1, $2, $3) RETURNING *',
      [req.params.questionId, decoded.id, body]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Ошибка авторизации' })
  }
})

module.exports = router