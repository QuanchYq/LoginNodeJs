if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const mongoose = require('mongoose')
const express = require('express');
const app = express()
const bcrypt = require('bcrypt')
const users = []
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const initializePassport = require('./passport-config')
initializePassport(passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

app.use(express.urlencoded({extended: false}))
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.set('view-engine', 'ejs')
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


app.get('/',(req,res) => {
    res.render('index.ejs')
})

app.get('/login', (req,res) => {
    res.render('login.ejs')
})
app.get('/register' , (req,res) => {
    res.render('register.ejs')
})
app.post('/register', async(req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        console.log(users)
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))




app.listen(3000)