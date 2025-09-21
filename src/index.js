const express = require('express');
const app = express();
const { connectDB } =  require('./config/database');
const { User } = require('./model/user');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middleware/user');
const { Product } = require('./model/product');
app.use(express.json())
app.use(cookieParser())



app.use("/signup", async(req,res)=>{
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


app.use("/login", async(req,res)=>{
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


app.get("/profile", userAuth, async(req,res)=>{
    try {
        
        const user = req.user;
        res.send(user);
    } catch (error) {
         res.status(400).send({
            message: 'user not found !',
            error: error.message
        })
    }
})

app.post('/addproduct',userAuth,async (req,res)=>{
    try {
        const {name, price, description} = req.body;
        if(!name || !price || !description){
            throw new Error("All fields are required");
        }
        const product = await Product({name, price, description});
        await product.save();
        res.status(201).send({message: `${req.user.FirstName} ${req.user.LastName} added product successfully`, product});
    } catch (error) {
        res.status(400).send({message: "Add Product Error", error: error.message});
    }
})


app.get('/products',userAuth,async (req,res)=>{
    try {
       
        const products = await Product.find({});
        res.status(200).send({message: `${req.user.FirstName} ${req.user.LastName} fetched products successfully`, products});
    } catch (error) {
        res.status(400).send({message: "Fetch Products Error", error: error.message});
    }
})

app.delete('/deleteproduct/:id',userAuth,async (req,res)=>{
    try {
        const {id} = req.params;
        const product = await Product.findByIdAndDelete(id);
        if(!product){
            throw new Error("Product not found");
        }
        res.status(200).send({message: `${req.user.FirstName} ${req.user.LastName} deleted product successfully`, product});
    } catch (error) {
        res.status(400).send({message: "Delete Product Error", error: error.message});
    }
})


app.put('/updateproduct/:id',userAuth,async (req,res)=>{
    try {
        const {id} = req.params;
        const {name, price, description} = req.body;
        const product = await Product.findByIdAndUpdate(id,{ name, price, description }, { new: true, runValidators: true });
        if(!product){
            throw new Error("Product not found");
        }
        res.status(200).send({message: `${req.user.FirstName} ${req.user.LastName} updated product successfully`, product});
    } catch (error) {
        res.status(400).send({message: "Update Product Error", error: error.message});
    }
})


app.post('/logout',(req,res)=>{
    res.cookie("token",null,{expires: new Date(Date.now() * 0)})
    res.status(200).send({message: `Logout Successful`});
})


connectDB().then(() => {
    console.log('Connected to the Database !');

    app.listen(3000, () => {
        console.log('Server is running on port 3000')
    })
}).catch((error) => {
    console.log('Database not connected', error);
});