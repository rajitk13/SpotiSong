require("dotenv").config();
const express = require("express");
var SpotifyWebApi = require("spotify-web-api-node");
const app = express();
const bp = require("body-parser");
const port = process.env.PORT||3000;

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

//Scopes
const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];

// Auth Variables and Credentials
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "http://localhost:3000/callback",
  accessToken: process.env.ACCESS_TOKEN,
});

//Load the HTTP library
var http = require("http");

//Configuring EJS
let ejs = require("ejs");
const { stringify } = require("querystring");
const { redirect } = require("express/lib/response");
app.set("view engine", "ejs");

//Static Files folder
app.use(express.static("public"));

//Serving home.ejs
app.get("/", (req, res) => {
  res.render("home");
});

// Login Route
app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

//Get Started Button
app.post("/start", function (req, res) {
  res.redirect("/login");
});

//sod route
app.get("/sod", function (req, res) {
  spotifyApi.getArtistTopTracks("4YRxDV8wJFPHPTeXepOstw", "GB").then(
    function (data) {
      // console.log(data.body);
      var rand = Math.floor(Math.random(20) * 10);
      var name_song = data.body.tracks[rand].name;
      var url = data.body.tracks[rand].preview_url;
      var songuri = data.body.tracks[rand].uri;

      spotifyApi.getUserPlaylists(username).then(
        function (playlistUser) {
          // console.log("Retrieved playlists", playlistUser.body);
          // console.log(songuri);
          res.render("sod", {
            name: name_song,
            url: url,
            playlistDisp: playlistUser,
            songuri: songuri,
          });
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});

var username;
//Profile info Route
app.get("/profile", (req, res) => {
  function getMyData() {
    (async () => {
      const me = await spotifyApi.getMe();
      username = me.body.name;
      res.render("profile", { body: me.body });
    })().catch((e) => {
      res.redirect('/login');
      console.error(e);
    });
  }
  getMyData();
});

//Get Selected Playlist
app.post("/playID", function (req, res) {
  console.log(req.body.songVal);
  spotifyApi.addTracksToPlaylist(req.body.radVal, [req.body.songVal]).then(
    function (data) {
      console.log("Added tracks to playlist!");
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
  res.redirect("/sod");
});

//Success login page

app.get("/success", (req, res) => {
  res.render("success");
});

//Callback Route
app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      res.redirect("success");
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
