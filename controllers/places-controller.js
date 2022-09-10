const HttpError = require('../models/http-error')


const DUMMY_PLACES =[
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

const getPlaceByUserId = (req,res,next)=>{
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find(p=>{
        return p.creator === userId;
    })
    if(!place){
        return next(new HttpError('could not find a place for provided user id.',404));
     }
     res.json({place});
}

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;