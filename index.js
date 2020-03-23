const express = require('express')
const multer = require('multer')

const app = express()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png'
    || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter
})


app.use(express.static('public'))
app.use('/photos', express.static('uploads'))

app.post('/photos', upload.array('photos'), (req, res) => {
  res.send(req.files.map(file => {
    return { dest: `/photos/${file.filename}` }
  }))
})

app.listen(3000)