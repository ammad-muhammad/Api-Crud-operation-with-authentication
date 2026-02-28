const express = require("express");
const  authRouter = express.Router();
// const { connectDB } =  require('./config/database');
const { User } = require('../model/user');
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken');
// const { userAuth } = require('./middleware/user');
// const { Product } = require('./model/product');
app.use(express.json())
// app.use(cookieParser())




authRouter.post('/signup', async(req,res)=>{
      try {
        const {FirstName, LastName, email, password, age , gender} = req.body;
        if(!FirstName || !LastName){
            throw new Error("name is not valid")
        }else if(!validator.isEmail(email)){
            throw new Error("Email is not valid")
        }else if(!validator.isStrongPassword(password)){
            throw new Error("password is not valid")
        }else if(!age > 18){
            throw new Error("you must be greate than 18")

        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User({
            FirstName,
            LastName,
            email,
            age,
            gender,
            password: hashPassword
        })
        
        await user.save();

         const token =  jwt.sign({id: user._id,}, "ammad",{expiresIn: "1d"});
            console.log("token",token);

        res.cookie("token", token);

        res.send({
            message: "user signup successfully",
            data : user,
        })

    } catch (error) {
        res.status(400).send({
            message: 'Signup error !',
            error: error.message
        })
    }
})


authRouter.post("/login", async(req,res)=>{
     try {
      
        const {email , password} = req.body;
        const user = await User.findOne({
            email
        });
        if(!user){
            throw new Error("Invalid Credentials !");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
           const token =  jwt.sign({id: user._id}, "ammad",{expiresIn: "1d"});
            console.log("token",token);

            //   console.log(token)
            res.cookie("token", token);
            res.send({
                message: "login succesfully",
                data: user
            })
        }else{
            throw new Error('Invalid Credentials!')
        }

    } catch (error) {
         res.status(400).send({
            message: 'Login error !',
            error: error.message
        })
    }
})



authRouter.post("/logout", async(req,res)=>{
    res.cookie("token",null,{expires: new Date(Date.now() * 0)})
    res.status(200).send({message: `Logout Successful`});
})


