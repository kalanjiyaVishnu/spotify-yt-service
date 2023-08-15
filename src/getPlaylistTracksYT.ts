import { get, isArray } from "lodash"
import path from "node:path"
import { download } from "./utils/download"

export async function getPlaylistTracksYT(userId: string) {
  try {
    const publicDir = path.resolve(__dirname, "../public")
    const playlistPath = `${publicDir}/${userId}.json`
    const userData: Object[] = (await import(playlistPath)).default

    if (!userData || !isArray(userData)) return

    const downloadPromises = userData.slice(0, 2).flatMap((playlist) =>
      get(playlist, "tracks", [])
        .slice(0, 1)
        .map((track: any) =>
          download(`${get(track, "trackName")} ${get(track, "by")}`)
        )
    )
    const resolvedPromises = await Promise.all(downloadPromises)
    return resolvedPromises.length
  } catch (error) {
    return error
  }
}
