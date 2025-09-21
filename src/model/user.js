const mongoose = require('mongoose');
 const {Schema} = mongoose;
 const validator = require("validator")


 const userSchema = new Schema({
    FirstName:{
        type:String,
        required: true,
        minLength: 3,
        maxLenth: 30,
        trim: true,
        lowercase: true
        
    },
    LastName:{
        type:String,
        minLength: 3,
        maxLenth: 30,
        trim: true,
         lowercase: true
    },
    gender:{
        type:String,
        // required: true,
        validator(value){
            if(!["male","female","other"].includes(value)){
                throw new Error("Gender data is not valid")
            }
        }
        
    },
    password:{
        type:String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Please use a strong password")
            }
        }
    },
    email:{
        type: String,
        required: true,
        //  minLength: 3,
        maxLenth: 30,
        trim: true,
        unique: true,
        index: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },
    age:{
        type: Number,
        // required: true,
        minLength: 10, 
        maxLenth: 50

    },
    // about:{
    //     type: String,
    //     default: 'this is default section'
    // },
    // skills:{
    //     type: [String]
    // },
    // photourl:{
    //     type: String,
    //     default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWxmiQqKsGu4P4FulnB-hDH6_RyTFPzHo67Q&s"
    // }
    
 },{
    collection : 'users',
    timestamps: true
 })


 const User = mongoose.model('User',userSchema);

 module.exports ={
    User
 };