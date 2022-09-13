const express = require('express');
const bodyParser = require('body-parser');

const usersRoutes = require('./routes/users-routes')
const placeRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

const app =express();

app.use(bodyParser.json())

app.use('/api/places',placeRoutes)
app.use('/api/users',usersRoutes)

app.use((req,res,next)=>{
    const error = new HttpError("Couldn't find this route",404)
    throw error;
})

app.use((error,req,res,next)=>{
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500).json({message:error.message || 'An unknown error occured'})
})

app.listen(5000);