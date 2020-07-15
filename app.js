var express=require("express");
var app=express();
var bodyparser=require("body-parser");
var mongoose=require("mongoose");
var session=require("express-session");
var Product=require("./models/product");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User=require("./models/user");
var seedDB=require("./seed");
var MongoStore=require("connect-mongo")(session);
var Cart=require("./models/cart");
var paypal = require('paypal-rest-sdk');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUNpUff46JyY83IOAXes86my9LlBbO5PewquaYu0MyBTfHZCHwaeacu65Wt2Z-4WxCBqIL1m8NhUensV',
  'client_secret': 'EI1YnhW5yfTuJrBTDOg78qz263HLXcGWcqEbx0YTGLx90UPrmq8425UuLYRACM9PzuNlKBVmc48zDXNn'
});

const nexmo = new Nexmo({
  apiKey: "1285b85f",
  apiSecret: "Glu9wFvXIGLcktCm"
}, { debug: true });

var cost=0;

app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.json());
app.use(express.static("public"));
app.use(express.static("images"));
app.use(bodyparser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost/SwissTime");

app.use(require("express-session")({
	secret:"Rusty is the best dog",
	resave:false,
	saveUninitialized:false,
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	cookie:{maxAge: 5*60*1000}
}));

passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//seedDB();

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.session=req.session;
	next();
});


app.get("/",function(req,res){
	res.render("landing");
});

app.get("/home",isLoggedIn,function(req,res){
  var cart=new Cart(req.session.cart ? req.session.cart : {items:{},totalQty:0,totalPrice:0});
  req.session.cart=cart;
  Product.find({},function(err,allProducts){
    if(err)
    {
      console.log(err);
    }
    else
    {
      res.render("index",{Products:allProducts});
    }
  })
});

app.post('/send', (req, res) => {
  // res.send(req.body);
  // console.log(req.body);
  const { number, text } = req.body;
  console.log(req.body);
  nexmo.message.sendSms(
    '919953270799', number, text, { type: 'unicode' },
    (err, responseData) => {
      if(err) {
        console.log(err);
      } else {
        const { messages } = responseData;
        const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
        console.dir(responseData);
        // Get data from response
        const data = {
          id,
          number,
          error
        };

        // Emit to the client
        io.emit('smsStatus', data);
      }
    }
  );
});

app.get("/add-to-cart/:id",function(req,res,next){
	var productId=req.params.id;
    var cart=new Cart(req.session.cart ? req.session.cart : {items:{},totalQty:0,totalPrice:0});
	Product.findById(productId,function(err,product){
		if(err)
		{
			return res.redirect("/home");
		}
		cart.add(product,product.id);
		req.session.cart=cart;
		console.log(req.session.cart);
		res.redirect("/home");
	})
});

app.get("/remove-from-cart/:id",function(req,res,next){

  var productId=req.params.id;
    var cart=new Cart(req.session.cart);
  Product.findById(productId,function(err,product){
    if(err)
    {
      console.log(err);
      return res.redirect("/home");
    }
    cart.remove(product,product.id);
    console.log(req.session.cart);
    req.session.cart=cart;
    res.redirect("/home");
  })
});

app.get("/shopping-cart",isLoggedIn,function(req,res){
  if(!req.session.cart)
  {
    return res.render("shopping-cart",{products:null});
  }
  var cart=new Cart(req.session.cart);
  return res.render("shopping-cart",{products:cart.generateArray(),totalPrice:cart.totalPrice});
});

app.get("/checkout",function(req,res,next){
	if(!req.session.cart)
	{
		res.redirect("/shopping-cart");
	}
	var cart=new Cart(req.session.cart);
	res.render("checkout",{total:cart.totalPrice})

})

app.get("/logout",function(req,res){
	req.session.destroy();
	req.logout();
	res.redirect("/");
});

app.get("/login",function(req,res){
	res.render("login");
});

app.post("/pay",function(req,res){
	cost=req.body.amount;
	const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:2806/success",
        "cancel_url": "http://localhost:2806/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": cost,
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": cost
        },
        "description": "This is the payment description."
    }]

};

 console.log(cost);

paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
         for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
    }
});

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": cost
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.render("confirm");
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.post("/login",passport.authenticate("local",
  {
    successRedirect:"/home",
    failureRedirect:"/login"
  }),function(req,res){
});



app.get("/signup",function(req,res){
	res.render("signup");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("login");
}


app.post("/signup",function(req,res){
    var newuser=new User({username:req.body.username});
   User.register(newuser,req.body.password,function(err,user){

       if(err)
       {
           console.log(err);
           return res.render("signup");
       }
       passport.authenticate("local")(req,res,function(){
           res.redirect("/home");
       });
   });
});


const port=2806;
const server = app.listen(port, () => console.log(`Server started on port ${port}`));


const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});