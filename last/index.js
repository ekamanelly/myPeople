var   express                 = require('express'),
      app                     = express(),
      ejs                     = require('ejs'),
      passport                = require('passport'),
      mongoose                = require('mongoose'),
      allSchema               = require('./js/schema/schema'),
      support                 = require('./js/football')
      unirest                 = require('unirest'),
      bodyParser              = require('body-parser'),
      session                 = require('express-session'),
      localStrategy           = require('passport-local'),
      passportLocalMongoose   = require('passport-local-mongoose'),
      schema                  = mongoose.Schema;


// The order of app should not be altered as is after functionally
// 2. session
// 3. passport.initialize
// 4. passport.session
// 1. cookieParser
// 5. app.router
// The order of app should not be altered as is after functionally
// key = 7e5217d5e1mshc7875972ae2d9b6p15263ajsn52c864a5bce7

mongoose.connect('mongodb://localhost:27017/logbd',{useNewUrlParser: true});
mongoose.set('useCreateIndex', true);
app.set('view engine', 'ejs');

app.use(session({
 secret: 'need to lunch this site b4 month end',
 resave: false,
 saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next)=>{
  res.locals.currentUser = req.user;
  next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
passport.use(new localStrategy(allSchema.User.authenticate()));
passport.serializeUser(allSchema.User.serializeUser());
passport.deserializeUser(allSchema.User.deserializeUser());


// roates
app.get('/form', (req, res)=> res.render('form'));
app.get('/', (req, res)=>res.render('home'));
app.get('/ads', isLoggedIn, (req, res)=> res.render('ad'));
app.get('/logout', (req, res)=>{
  req.logout();
  res.redirect('/');
});
app.get('/secret', isLoggedIn, function(req, res){
  allSchema.Ad.find({}, function(err, allAds){
    if(err){
      console.log(err);
    }else{

      res.render('secret', {currentUser:req.user, allAds:allAds});
    }
  })
});
app.get('/login', (req, res)=> res.render('home'));
app.get('/signup', (req, res)  => res.render('signup'));

//not in use
// app.get('/secret/:id', isLoggedIn, function(req, res){
//   allSchema.Ad.findById(req.params.id).populate('comment').exec(function(err, singleAd){
//     if(err){
//       console.log(err);
//     }else{
//       console.log('from if else  ' + singleAd);
//       res.send({singleAd:singleAd});
//     }
//   });
// });
// display more details about ads
app.get('/secret/:id', isLoggedIn, function(req, res){
  allSchema.Ad.findById(req.params.id).populate('comment').exec(function(err, singleAd){
    if(err){
      console.log(err);
    }else{
      console.log('===========is');
      console.log(singleAd);
      res.render('form', {currentUser:req.user, singleAd:singleAd});
    }
  });
});


//post comment route, which is an ajax call
app.post('/secret/:id/new', isLoggedIn, function(req, res){
  allSchema.Ad.findById(req.params.id, function(err, singleAd){
    if(err){
      consolle.log(err);
    }else{

      allSchema.Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.log(err);
        }else{
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.time = new Date();
          comment.save();
          singleAd.comment.push(comment);
          singleAd.save();
          console.log('=========comment=========');
          console.log(comment);
          res.redirect(`/secret/${req.params.id}`);
        }
      })
    }
  })
});

//login route
app.post('/login', passport.authenticate('local',{
  successRedirect: '/secret',
  failureRedirect: '/'
}),function(req, res){});

app.get('/fashion', isLoggedIn, function(req, res){
  allSchema.Ad.find({"owner":"ad061"}, function(err, fashionAd){
    if(err){
      console.log(err);
    }else{
      res.render('secret', {currentUser:req.user, allAds: fashionAd});
    }
  });
});
app.post('/signup', function(req, res){
  req.body.username;
  req.body.email;
  req.body.password;
    allSchema.User.register(new allSchema.User({username:req.body.username, email:req.body.email}), req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render('signup');
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect('/secret');

    });
  });
});




app.post('/ads', function(req, res) {

    allSchema.Ad.create( {
       title: req.body.title,
       image: req.body.image,
       description: req.body.description,
       owner: req.body.adType
      }, function(err, ad){
        if(err){
          console.log(err);
        }else{
          console.log(ad);
          res.redirect('/secret');

        }
    });

});
// ===========
app.get('/football', function(req, res){
      let pucket = {};

      unirest("GET", `https://api-football-v1.p.rapidapi.com/v2/fixtures/date/${time()}`)
      .headers({
      	"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      	"x-rapidapi-key": "get one from rapi api"
      }).end(function (result) {
      	if (result.error){
          console.log (result.error);
          pucket.today = null;

        }else{
          console.log(time());
          pucket.today = result.body;
        }

        // unirest("GET", `https://api-football-v1.p.rapidapi.com/v2/fixtures/date/${tomorrow()}`)
        // .headers({
        //   "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        //   "x-rapidapi-key": "7e5217d5e1mshc7875972ae2d9b6p15263ajsn52c864a5bce7"
        // }).end(function (result) {
        //   if (result.error){
        //     console.log (result.error);
        //     pucket.tomorrow = null;
        //   }else{
        //     console.log(time());
        //     pucket.tomorrow = result.body;
        //
        //   }
        // unirest("GET", `https://api-football-v1.p.rapidapi.com/v2/fixtures/date/${yesterday()}`)
        //   .headers({
        //     "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        //     "x-rapidapi-key": "7e5217d5e1mshc7875972ae2d9b6p15263ajsn52c864a5bce7"
        //   }).end(function (result) {
        //     if (result.error){
        //       console.log (result.error);
        //       pucket.yesterday = null;
        //     }else{
        //       console.log(time());
        //       pucket.yesterday = result.body;
        //       res.render('football', {pucket, league:support.league});
        //     }
        //
        //     // var data = JSON.parse()
        //     // console.log(selectDate('-08-08'));
        //     // res.send(result.body);
        //   });
        // });
      });


  // res.send(support.league)
});
app.get('football/:league_id', function(req, res){
  let s = req.params.league_id;
  console.log(s);
})


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.send('not login in');
};
// date function
function time(day, month){
	let d = new Date();
  let f = d.getFullYear()+ '-' +(day? day: d.getMonth() + 1).toString().padStart(2,0)+ '-' + (month? month: d.getDate()).toString().padStart(2,0);
	return(f);

};
function yesterday(){
	let d = new Date();
	let f = d.getFullYear()+'-'+(d.getMonth() + 1).toString().padStart(2,0)+ '-' + (d.getDate()-1).toString().padStart(2,0);
	return(f);


};
function tomorrow(){
	let d = new Date();
	let f = d.getFullYear()+'-'+(d.getMonth() + 1).toString().padStart(2,0)+ '-' + (d.getDate()+1).toString().padStart(2,0);
	return(f);
};

app.listen(3000, () =>console.log('server is working'));
