require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

//auth variables
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = "http://localhost:3000/";
var querystring = require("querystring");

//Load the HTTP library
var http = require("http");

//Configuring EJS
let ejs = require("ejs");
const { render } = require("express/lib/response");
const { LOADIPHLPAPI } = require("dns");
app.set("view engine", "ejs");

//Static Files folder
app.use(express.static("public"));

//Serving home.ejs
app.get("/", (req, res) => {
  res.render("home");
});

//Serving login

app.get("/login", function (req, res) {
  var state = " ";
  var scope = "user-read-private user-read-email";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );

  
});

app.post('/api/token', function(req, res) {
  console.log('receiving data ...');
  console.log('body is ',req.body);
  res.send(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
