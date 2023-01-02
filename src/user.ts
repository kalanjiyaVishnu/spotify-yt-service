import path from "node:path"
import { writeFile } from "fs/promises"
import SpotifyWebApi from "spotify-web-api-node"
import _ from "lodash"
import downloadYouTubeVideo from "./download"
// const token =
// "BQAPP7kgUHbBKgRI9Pk38qzpNvHmo-7Nv4Lo10I7cwn6qqHrSe5qrStVvYTAYcj6HyPYr3d_zhvBv33dLmY_0ilCs76HL7OcwSfM46C6L94bRXQN1Ho60LLJ4n3GJaF_kdb6Gfh_5X_Ssl_JqbIAFYn9JNnjACkuAR3uQjdcRQy0GpOurVmNlLLIFNjaoAdaYkCAI-TAnhe_3jqKFXiiuTO_1EiLJV1thxp8XPlN27g9MQydk4fo1uw_X5D_pmc0HuqzgqiUX0JOm3LlveFEL9YpE1xeCKjCMqBwgNalsn7uTvUBjeOit76xmZyqn9A1a88gKDL_ylHgE4RKakDY"

const spotifyApi = new SpotifyWebApi()
// spotifyApi.setAccessToken(token)

export async function getMyData(token: string) {
  spotifyApi.setAccessToken(token)
  const me = await spotifyApi.getMe()
  console.table(me.body)
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

  const downloadPromises = userData.slice(0, 1).map((playlist) =>
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
  return Promise.all(downloadPromises)
}
