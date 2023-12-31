const mongoose  = require('mongoose');

const dbConnect = (url)=>{
    return mongoose.connect(url,{
        // 
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}

module.exports = dbConnect;