const express = require('express')
const multer = require('multer')
const fs = require('fs')
const util = require('util');
const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);

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
    return {
      url: req.protocol + "://" + req.headers.host + '/photos/' + file.filename,
      name: file.filename
    }
  }))
})

app.get('/photos', (req, res) => {
  fs.readdir('uploads', (err, filesName) => {
    const files = []
    filesName.forEach(file => {
      files.push({
        url: req.protocol + "://" + req.headers.host + '/photos/' + file,
        name: file
      })
    });
    res.send(files)
  });
})

app.delete('/photos', (req, res) => {
  (async () => {
    try {
      const files = await readdir('uploads');
      const unlinkPromises = files.map(filename => unlink(`uploads/${filename}`));
      await Promise.all(unlinkPromises);
      res.send({ result: 'success' })
    } catch (err) {
      res.send({ result: err });
    }
  })()
})

app.listen(4000)