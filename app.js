//import
const express = require('express')
const  session = require('express-session')

// express app
const app = express()
//set PORT
const PORT = process.env.PORT||3000
const {v4:uuidv4} = require("uuid")

//set view engine 
app.set('view-engine', 'ejs')

 //static files
 app.use(express.static('public'))

 app.use(express.json());
 app.use(express.urlencoded({extended: true}))

const users = [   
  {id:1, name:'A', email:'a@gmail.com', password:'secret'},
  {id:2, name:'B', email:'b@gmail.com', password:'secret'},
  {id:3, name:'C', email:'c@gmail.com', password:'secret'}
]
  
app.use(session({
  name:'sid',
  resave: false ,
  saveUninitialized:false ,
  secret:uuidv4(),
    cookie:{
    maxAge:1000*60*60*2,
    sameSite: true,
     }
}))



const redirectLogin = (req,res,next)=>{
  if(!req.session.userId){
    res.redirect('/')
  }else{
    next()
  }
}
const redirectHome = (req,res,next)=>{
  if(req.session.userId){
    res.redirect('/home')
  }else{
    next()
  }
}

app.use((req,res, next)=>{
  const {userId} = req.session;
   if(userId){
    res.locals.user = users.find(
      user=> user.id === userId
    )
   }
   next()
})

app.get('/home',redirectLogin, (req,res)=>{
  const {user} = res.locals
  res.setHeader('Cache-Control', 'no-store, no-cache,must-revalidate, private')
  res.render('home.ejs', {title : 'Home'})
})
app.get('/about',redirectLogin, (req,res)=>{
  res.render('about.ejs',  {title : 'About'})
})

app.get('/courses',redirectLogin, (req,res)=>{
  res.render('courses.ejs',  {title : 'Courses'})
})

//login get route
app.get('/',redirectHome, (req, res) => {
  const message = req.query.message;
  const {userId} = req.session
  if(userId){
    res.redirect('/home')
  }else{

    res.render('login.ejs', { message });
  }

});

//login post route
app.post("/", redirectHome, (req,res)=>{
  const {email,password} = req.body
console.log(email,password);

  if(email && password){
   
    const user = users.find(
      user=>user.email ===email && user.password === password
    )
  if(user){
      req.session.userId = user.id
      return res.redirect('/home')
    }
    else{
      res.redirect('/?message=Invalid Credentials!!');
    }
  }

  res.redirect('/?message=Please Enter your Credentials!');

})

//register get route
app.get('/register', (req,res)=>{
  res.render('register.ejs', {title : 'Register'})
})

//register post route
app.post('/register', (req,res)=>{
  const {name, email, password} = req.body
  console.log(name, email, password)
  if(name && email && password){
    const exists = users.some(
      user=>user.email === email
    )
    if(!exists){
      const user = {
        id: users.length+1,
        name,
        email,
        password
      }
      users.push(user)
      console.log(users)
      req.session.userId = user.id
      res.redirect('/')
  
    }
  }
  res.redirect('/register')
})

//logout route
app.post('/logout',redirectLogin ,(req,res)=>{
req.session.destroy(err=>{ 
  if(err){
    console.log(err);
    return res.redirect('/home')
  
  }
res.redirect('/?message=Logged Out SUCCESSFULLY!!');
})
})

// 404 page
app.use((req,res)=>{
    res.status(404).render('404.ejs',  {title : '404'})
})

//listen on PORT 3000
app.listen(PORT)
