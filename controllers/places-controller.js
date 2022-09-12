const {v4:uuidv4} = require('uuid')
const HttpError = require('../models/http-error')


let DUMMY_PLACES =[
    {
        id:'p1',
        title:"Infopark Kochi",
        description:"Information technology park situated in the city of Kochi, Kerala, India",
        imageURL:"https://infopark.in/assets/images/slider/homeBanner2.jpg",
        address:"Phase 1, Info Road, Near Tapasya Block Kakkanad, Kochi, Kerala 682042",
        location:{
            lat:10.0115718,
            lng:76.3599615
        },
        creator:'u1'
    }
]

const getPlaceById = (req,res,next)=>{
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p=>{
        return p.id === placeId;
    })
    if(!place){
        throw new HttpError('could not find a place for provided id.',404);
    }
    res.json({place});
}

const getPlacesByUserId = (req,res,next)=>{
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter(p=>{
        return p.creator === userId;
    })
    if(!places || places.length === 0){
        return next(new HttpError('could not find a place for provided user id.',404));
     }
     res.json({places});
}

const createPlace = (req,res,next) => {
    const {title,description,coordinates,address,creator} = req.body;
    const createdPlace = {
        id:uuidv4(),
        title,
        description,
        location:coordinates,
        address,
        creator
    }
    DUMMY_PLACES.push(createdPlace);
    res.status(201).json({place:createdPlace})
}

const updatePlace =(req,res,next) => {
    const {title,description} = req.body;
    const placeId = req.params.pid; 
    const updatedPlace ={...DUMMY_PLACES.find(p=>p.id === placeId)};
    const placeIndex = DUMMY_PLACES.findIndex(p=>p.id ===placeId)
    updatedPlace.title = title;
    updatedPlace.description = description;
    DUMMY_PLACES[placeIndex] = updatedPlace;
    res.status(200).json({place:updatedPlace});
}

const deletePlace =(req,res,next) => {
    const placeId = req.params.pid;
    DUMMY_PLACES = DUMMY_PLACES.filter(p=>p.id !== placeId);
    res.status(200).json({message:"Deleted place"})

}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;