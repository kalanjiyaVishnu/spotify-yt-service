import express from "express"
import path from "node:path"
import SpotifyWebApi from "spotify-web-api-node"
import { BASE_DIR, credentials, scopes, state } from "./configs"
import { getPlaylistTracksYT } from "./getPlaylistTracksYT"
import { getMyData } from "./user"
const app = express()

const spotifyApi = new SpotifyWebApi(credentials)

app.get("/ping", (_, res) => res.send("hi bob"))
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
        function (data: any) {
          console.log(
            "Some information about the authenticated user",
            data.body
          )
        },
        function (err: any) {
          console.log("Something went wrong!", err)
        }
      )
      spotifyApi
        .getMySavedAlbums({
          limit: 1,
          offset: 0,
        })
        .then(
          function (data: any) {
            // Output items
            console.log("saved Albums by the user", data.body.items)
          },
          function (err: any) {
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

app.get("/download/:userId", async (req, res) => {
  try {
    const totalDownloads = await getPlaylistTracksYT(req.params.userId)
    return res.json({ msg: "success", totalDownloads })
  } catch (error) {
    return res.json({ msg: "failed", error: error })
  }
})

app.use(express.static(`${path.resolve(__dirname, "../public")}`))

app.listen(3000, () => console.log("Listening on 3000"))
