const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path')

const usersRoutes = require('./routes/users-routes')
const placeRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json())

app.use('/uploads/images',express.static(path.join('uploads','images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placeRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError("Couldn't find this route", 404)
    throw error;
})

app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path,err=>{
      console.log(err);
    })
  }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500).json({ message: error.message || 'An unknown error occured' })
})


mongoose.connect(`mongodb+srv://Anushal:Anushal123@cluster0.cex4b7b.mongodb.net/places?retryWrites=true&w=majority`)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});

app.listen(5000);

