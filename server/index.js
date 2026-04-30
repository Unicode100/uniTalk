const express = require('express')
const cors = require('cors')
require('dotenv').config()
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(express.static('client'))

// Подключаем маршруты
app.use('/api/auth', require('./routes/auth'))

app.get('/api/hello', (req, res) => {
  res.json({ message: 'uniTalk работает! 🚀' })
})

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`)
})
