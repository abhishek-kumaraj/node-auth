const express = require('express');
const app = express();
const cors = require('cors');
// const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dbConnect = require('./db/connect');
require('dotenv').config()
const User = require('./model/userModel')

const jwt = require('jsonwebtoken')


app.use(cors())
app.use(express.json())
const port = 5000;

app.get('/',(req,res)=>{
    res.send('home page');
})

app.post('/api/v1/users/signup', async (req,res)=>{
    try {
            // Create a verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
        req.body.verificationCode = verificationCode;
        const {password, confirmPassword} = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ msg: 'Passwords do not match' });
          }
        const newUser = await User.create(req.body);

        // Send the verification email (you need to set up a real email sending service)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: 'Gmail', // Use your email service provider (e.g., 'Gmail', 'Outlook', 'Yahoo', etc.)
            auth: {
              user: 'samraatsingh0100@gmail.com', // Your email address
              pass: process.env.PASS_MAIL,    // Your email password or application-specific password
            },
          });
          transporter.verify().then(console.log).catch(console.error);

      const mailOptions = {
        from: 'samraatsingh0100@gmail.com',
        to: newUser.email,
        subject: 'Email Verification',
        text: `Your verification code is: ${verificationCode}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          // Handle the error and respond to the client
          res.status(500).json({ msg: 'Email verification failed' });
        } else {
          // Email sent successfully
          const token = jwt.sign({ id: newUser._id }, process.env.SECURITY_STR, {
            expiresIn: 1000000,
          });
  
          // res.status(201).json({ newUser, token });
          res.status(201).json({status:"success"});
        }
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
    

})

// Define a route for code verification
app.post('/api/v1/users/verify', async (req, res) => {
    const { email, code } = req.body;
  
    try {
      // Find the user by their email address
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Check if the user is already verified
      if (user.isVerified) {
        return res.status(400).json({ msg: 'User is already verified' });
      }
  
      // Compare the submitted code with the stored verification code
      if (code === user.verificationCode) {
        // Code is correct, mark the user as verified
        user.isVerified = true;
        user.verificationCode = null; // Clear the verification code
        await user.save();
  
        const token = jwt.sign({ id: user._id }, process.env.SECURITY_STR, {
          expiresIn: 1000000,
        });
  
        res.status(200).json({ msg: 'Email verified successfully', token });
      } else {
        // Code is incorrect
        res.status(400).json({ msg: 'Invalid verification code' });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
  

app.post('/api/v1/users/login',async (req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email}).select('+password');
        console.log(req.body)
        const isMatch = await user.checkPasswordInDb(password, user.password )
        console.log(isMatch)
        if(isMatch){
            return res.json({status:"matched"})
        }
        res.json({status:"didn't matched"})
        
    } catch (error) {
        res.json({error})
    }
})


const start = ()=>{
    try {
        dbConnect(process.env.MONGO_URI)
        app.listen(port,()=>{
            console.log(`server is listening at ${port}`);
        })
    } catch (error) {
        console.log(error.message);
    }
}

start()
