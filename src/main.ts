import express from "express"
import SpotifyWebApi from "spotify-web-api-node"
import downloadYouTubeVideo from "./download"
import { getMyData } from "./user"

const app = express()

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
  ],
  state = "some-state"
const credentials = {
  clientId: "ffb4a8719d1b4fcd90c2a2e35085587c",
  clientSecret: "6563a7bd574a41d38ebf429e4e3dac0a",
  redirectUri: "http://localhost:8000/callback",
}

const spotifyApi = new SpotifyWebApi(credentials)

app.get("/login", (_, res) =>
  res.redirect(spotifyApi.createAuthorizeURL(scopes, state))
)

app.get("/callback", (req, res) => {
  const error = req.query.error
  const code = req.query.code as string
  //   const state = req.query.state

  if (error) {
    console.error("Callback Error:", error)
    res.send(`Callback Error: ${error}`)
    return
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body["access_token"]
      const refresh_token = data.body["refresh_token"]
      const expires_in = data.body["expires_in"]

      spotifyApi.setAccessToken(access_token)
      spotifyApi.setRefreshToken(refresh_token)

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      )

      spotifyApi.getMe().then(
        function (data) {
          console.log(
            "Some information about the authenticated user",
            data.body
          )
        },
        function (err) {
          console.log("Something went wrong!", err)
        }
      )
      spotifyApi
        .getMySavedAlbums({
          limit: 1,
          offset: 0,
        })
        .then(
          function (data) {
            // Output items
            console.log("saved Albums by the user", data.body.items)
          },
          function (err) {
            console.log("Something went wrong!", err)
          }
        )

      getMyData(access_token).then((playlists) =>
        res.json({
          msg: "Success! You can now close the window.",
          data: data.body,
          playlists,
        })
      )

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken()
        const access_token = data.body["access_token"]
        console.log("The access token has been refreshed!")
        spotifyApi.setAccessToken(access_token)
      }, (expires_in / 2) * 1000)
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error)
      res.send(`Error getting Tokens: ${error}`)
    })
})

app.get("/download", (_, res) => {
  downloadYouTubeVideo("By Design [Evel Knievel]").then((url) => {
    res.json({ msg: "success", url })
  })
})
app.listen(8000, () => console.log("Listening on 8000"))

// getPlaylistTracksYT("oxfl5tg3u665zzl26383snworp")
