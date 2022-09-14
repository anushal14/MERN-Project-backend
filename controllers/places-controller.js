const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const Place = require('../models/place')


let DUMMY_PLACES = [
    {
        id: 'p1',
        title: "Infopark Kochi",
        description: "Information technology park situated in the city of Kochi, Kerala, India",
        imageURL: "https://infopark.in/assets/images/slider/homeBanner2.jpg",
        address: "Phase 1, Info Road, Near Tapasya Block Kakkanad, Kochi, Kerala 682042",
        location: {
            lat: 10.0115718,
            lng: 76.3599615
        },
        creator: 'u1'
    }
]

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
    
    if (!places || places.length === 0) {
        return next(new HttpError('could not find a place for provided user id.', 404));
    }
    res.json({ places:places.map(place=>place.toObject({getters:true})) });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('invalid inputs passed', 422)
    }
    const { title, description, coordinates, address, creator } = req.body;
    const createdPlace = new Place({
        title,
        description,
        location: coordinates,
        address,
        image: 'https://infopark.in/assets/images/slider/homeBanner2.jpg',
        creator
    })
    try {
        await createdPlace.save();
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
        throw new HttpError('invalid inputs passed', 422)
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

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: "Deleted place" })

}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;