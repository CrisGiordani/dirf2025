const express = require('express')
const { result } = require('./generate')

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/generate/:cpf', result)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
