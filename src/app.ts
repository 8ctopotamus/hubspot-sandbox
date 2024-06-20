import express from 'express'

const PORT = process.env.PORT || 3001

const app = express()

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})