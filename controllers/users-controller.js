const {v4:uuidv4} = require('uuid');
const {validationResult} = require('express-validator')
const HttpError = require('../models/http-error');
const User = require('../models/user')
const DUMMY_USERS = [
    {
        id:'u1',
        name:'Anushal',
        email:'abc@gmail.com',
        password:'tester'
    }
]

const getUsers = (req,res,next) => {
    res.json({users:DUMMY_USERS});
}

const signup = async (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('invalid inputs passed',422))
    }

   const {name,email,password,places} = req.body; 

//    const hasUser = DUMMY_USERS.find(u=>u.email === email)
//    if(hasUser){
//     throw new HttpError('email already exists',422)
//    }
    let existingUser;
    try{
        existingUser = await User.findOne({email:email})
    }catch(err){
        const error = new HttpError(err,500);
        return next(error)
    }

    if(existingUser){
       const error =new HttpError('email already exists',422) ;
       return next(error)
    }

   const createdUser = new User({
    name,
    email,
    image:'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
    password,
    places
   });

//    DUMMY_USERS.push(createdUser);

try{
    await createdUser.save()
}catch(err){
    const error =new HttpError(err,500) ;
    return next(error)
}
   res.status(201).json({user:createdUser.toObject({getters:true})})
}

const login = async (req,res,next) => {
    const {email,password} = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email:email})
    }catch(err){
        const error = new HttpError('Logging in failed,please try again later',500);
        return next(error)
    }
    if(!existingUser || existingUser.password !== password){
        const error = new HttpError('invalid credentials',401);
        return next(error)
    }
    res.json({message:"logged in"})

}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;