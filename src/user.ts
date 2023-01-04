import path from "node:path"
import { writeFile } from "fs/promises"
import SpotifyWebApi from "spotify-web-api-node"
import _ from "lodash"
import downloadYouTubeVideo from "./download"

const spotifyApi = new SpotifyWebApi()

export async function getMyData(token: string) {
  spotifyApi.setAccessToken(token)
  const me = await spotifyApi.getMe()
  return getUserPlaylists(me.body.id)
}

//GET MY PLAYLISTS
async function getUserPlaylists(userId: string) {
  const data = await spotifyApi.getUserPlaylists(userId)
  let playlists = []

  for (let playlist of data.body.items) {
    console.log(playlist.name + " " + playlist.id)

    let tracks = await getPlaylistTracks(playlist.id, playlist.name)
    tracks &&
      tracks.length > 0 &&
      playlists.push({ tracks, playlistName: playlist.name })
  }
  try {
    const playlistPath = `${path.resolve(
      __dirname,
      "../public"
    )}/${userId}.json`
    await writeFile(path.join(playlistPath), JSON.stringify(playlists))
  } catch (err) {
    console.log(err)
  }
  return playlists
}

//GET SONGS FROM PLAYLIST
export async function getPlaylistTracks(
  playlistId: string,
  playlistName: string
) {
  if (playlistId == null) {
    return null
  }
  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 1,
    limit: 100,
    fields: "items",
  })

  console.log("The playlist contains these tracks", data.body)
  // console.log("The playlist contains these tracks: ", data.body.items[0].track)
  console.log("'" + playlistName + "'" + " contains these tracks:")
  let tracks: any = []

  for (let track_obj of data.body.items) {
    // const {
    //   available_markets,
    //   release_date_precision,
    //   type,
    //   href,
    //   external_urls = {},
    //   ...album
    // } = track_obj.track?.album as any
    // tracks.push({ artists: track_obj.track?.artists, album })
    tracks.push({
      trackName: track_obj.track?.name,
      by: track_obj.track?.artists[0].name,
    })
    console.log(
      track_obj.track?.name + " : " + track_obj.track?.artists[0].name
    )
  }

  return tracks
}

// GET YT LINKS FROM PLA`YLIST
export async function getPlaylistTracksYT(userId: string) {
  console.log("getPlaylistTracksYT")
  const playlistPath = `${path.resolve(__dirname, "../public")}/${userId}.json`
  const userData: Array<Object> = await import(playlistPath)
    .then((m) => m.default)
    .catch((err) => console.log(err))
  if (!userData || !_.isArray(userData)) return

  const downloadPromises = userData.slice(0, 2).map((playlist) =>
    _.get(playlist, "tracks", [])
      .slice(0, 1)
      .map(
        async (track) =>
          await downloadYouTubeVideo(
            `${_.get(track, "trackName")} ${_.get(track, "by")}`
          )
      )
  )
  console.log("downloadPromises", downloadPromises.length)
  return Promise.all(downloadPromises).then(() => downloadPromises.length)
}
