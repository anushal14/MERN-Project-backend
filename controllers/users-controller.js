const {validationResult} = require('express-validator')
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const {uploadFileToFirebase} =require('../middleware/file-upload')

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
    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password,12);
    }catch(err){
        const error = new HttpError('could not create user,please try again',500);
        return next(error)
    }
    let uploadedFileUrl
    try {
         uploadedFileUrl = await uploadFileToFirebase(req.file);
       
      } catch (error) {
        res.status(500).send(`Error uploading file: ${error}`);
      }

   const createdUser = new User({
    name,
    email,
    image:uploadedFileUrl,
    password:hashedPassword,
    places: []
   });

//    DUMMY_USERS.push(createdUser);

try{
    await createdUser.save()
}catch(err){
    const error =new HttpError(err,500) ;
    return next(error)
}
let token;
try{
    token = jwt.sign({userId:createdUser.id,email:createdUser.email},'supersecret_dont_share',{expiresIn:'1h'})
}catch(err){
    const error =new HttpError(err,500) ;
    return next(error)
}
   res.status(201).json({userId:createdUser.id,email:createdUser.email,token:token})
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
    if(!existingUser){
        const error = new HttpError('invalid credentials',403);
        return next(error)
    }
    let isValidPassword;
    try{
        isValidPassword = await bcrypt.compare(password,existingUser.password);
    }catch(err){
        const error = new HttpError('Logging in failed,please check credentials',500);
        return next(error)
    }
    if(!isValidPassword){
        const error = new HttpError('invalid credentials',403);
        return next(error)
    }
    let token;
    try{
         token = jwt.sign({userId:existingUser.id,email:existingUser.email},'supersecret_dont_share',{expiresIn:'1h'})
     }catch(err){
        const error =new HttpError(err,500) ;
        return next(error)
    }
    res.json({userId:existingUser.id,email:existingUser.email,token:token})

}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;