const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const connectDB = require('./config/db');
const path = require('path');
const passport = require('passport');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
//Load Config
dotenv.config({path:'./config/config.env'});

//Passport Config
require('./config/passport')(passport)


connectDB();
const app = express();

//Body parser

app.use(express.urlencoded({extended:false}))

//Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

//Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Handlebars HElpers
const { formatDate, stripTags, truncate, editIcon, select}  = require('./helpers/hbs');


//Handlebars
app.engine('.hbs', exphbs({helpers:{
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
},defaultLayout: 'main',extname: '.hbs'}));
app.set('view engine', '.hbs');

// Sesssion Middleware
app.use(session({
    secret:'roshil',
    resave:false,
    saveUninitialized:false,
    store: new MongoStore({mongooseConnection:mongoose.connection})
}))

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set Global variable
app.use(function(req,res,next){
    res.locals.user = req.user || null
    next()
})

//Static Folder
app.use(express.static(path.join(__dirname,'public')));

//Routes
app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>console.log(`Server is Running in ${process.env.NODE_ENV} mode on port ${PORT}`))