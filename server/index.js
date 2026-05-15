const express = require('express')
const path = require('path')
const cors = require('cors')
require('dotenv').config()
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true')
  next()
})

app.use(express.static(path.join(__dirname, '../client')))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/questions', require('./routes/questions'))
app.use('/api/answers', require('./routes/answers'))

app.get('/api/hello', (req, res) => {
  res.json({ message: 'uniTalk работает! 🚀' })
})

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`)
})
