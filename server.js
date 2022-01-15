require("dotenv").config();
const express = require("express");
var SpotifyWebApi = require('spotify-web-api-node');
const app = express();
const port = 3000;

//Scopes
const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];

// Auth Variables and Credentials
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/callback'
});
const token = process.env.ACCESS_TOKEN;
spotifyApi.setAccessToken(token);

//Load the HTTP library
var http = require("http");

//Configuring EJS
let ejs = require("ejs");
app.set("view engine", "ejs");

//Static Files folder
app.use(express.static("public"));

//Serving home.ejs
app.get("/", (req, res) => {
  res.render("home");
});

// Login Route
app.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

//Get Playlist
app.get('/playlist',function(req,res){
  function getMyData() {
    (async () => {
      const me = await spotifyApi.getMe();
      console.log(me.body);
   
    })().catch(e => {
      console.error(e);
    });
  }
  getMyData();
  
});

//Callback Route
app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.send('Success! You can now close the window.');

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];

        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        spotifyApi.setAccessToken(access_token);
      }, expires_in / 2 * 1000);
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
