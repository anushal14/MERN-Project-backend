const {validationResult} = require('express-validator')
const HttpError = require('../models/http-error');
const User = require('../models/user')

const getUsers = async (req,res,next) => {
    let users;
    try{
        users = await User.find({},'-password')
    }catch(err){
        const error = new HttpError(err,500)
        return next(error)
    }
    res.json({users:users.map(user=>user.toObject({getters:true}))});
}

const signup = async (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('invalid inputs passed',422))
    }

   const {name,email,password} = req.body; 

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
    places: []
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
    res.json({message:"logged in",user: existingUser.toObject({getters:true})})

}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;