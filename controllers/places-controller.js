const { validationResult } = require('express-validator')
const fs = require('fs')
const  mongoose = require('mongoose')
const HttpError = require('../models/http-error')
const Place = require('../models/place')
const User = require('../models/user')
const {uploadFileToFirebase} =require('../middleware/file-upload')

const getPlaceById =async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place =await Place.findById(placeId);
    } catch (err){
        const error = new HttpError(err,500)
        return next(error);
    }
    if (!place) {
        const error = new HttpError('could not find a place for provided id.', 404);
        return next(error);
    }
    res.json({ place:place.toObject({getters:true}) });
}

const getPlacesByUserId =async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try {
        places =await Place.find({creator:userId})
    } catch (err){
        const error = new HttpError(err,500)
        return next(error);
    }
    
    // if (!places || places.length === 0) {
    //     return next(new HttpError('could not find a place for provided user id.', 404));
    // }
    res.json({ places:places.map(place=>place.toObject({getters:true})) });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('invalid inputs passed', 422))
    }
    const { title, description, address, creator } = req.body;
    let uploadedFileUrl
    try {
         uploadedFileUrl = await uploadFileToFirebase(req.file);
       
      } catch (error) {
        res.status(500).send(`Error uploading file: ${error}`);
      }
    const createdPlace = new Place({
        title,
        description,
        address,
        location: {"lat":-45.4484,"lng":85.467474},
        image: uploadedFileUrl,
        creator
    })

    let user;
    try {
        user = await User.findById(creator)
    } catch (err){
        const error = new HttpError("err",500)
        return next(error);
    }
    if(!user){
        const error = new HttpError("could not find the user for provided id",404)
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess});
        await sess.commitTransaction();
    } catch (err){
        const error = new HttpError(err,500)
        return next(error);
    }
    res.status(201).json({ place: createdPlace })
}

const updatePlace =async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('invalid inputs passed', 422))
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;
   
    let place;
    try{
        place = await Place.findById(placeId)
    }catch(err){
        const error = new HttpError(err,500);
        return next(error);
    }

    if(place.creator.toString() !== req.userData.userId){
        const error = new HttpError('You are not allowed to edit this place',401)
        return next(error)
    }

    place.title = title;
    place.description = description;
    
    try{
        await place.save();
    }catch(err){
        const error = new HttpError(err,500);
        return next(error);
    }
    
    res.status(200).json({ place: place.toObject({getters:true}) });
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
    }catch(err){
        const error = new HttpError(err,500);
        return next(error)
    }
    if(!place){
        const error = new HttpError("could not find the place for provided id",404)
        return next(error);
    }

    if(place.creator.id !== req.userData.userId){
        const error = new HttpError('You are not allowed to edit this place',401)
        return next(error)
    }
    // const imagePath = place.image;
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction()
        await place.remove({session: sess})
        place.creator.places.pull(place)
        await place.creator.save({session : sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError(err,500);
        return next(error)
    }
    // fs.unlink(imagePath,err=>{
    //     console.log(err)
    // })
    res.status(200).json({ message: "Deleted place" })

}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;