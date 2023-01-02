import fs from "node:fs/promises"
import path from "node:path"
import youtubedl from "youtube-dl"
import axios from "axios"

const YOUTUBE_KEY = "AIzaSyCSR7EH9xhoAZMTYEhaWtNOSzu-lG9eraU"
const BASE_YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

async function getYoutubeSearchId(query: string) {
  const params = {
    part: "id",
    type: "video",
    q: query,
    key: YOUTUBE_KEY,
  }
  const res = await axios.get(BASE_YT_SEARCH_URL, { params })
  console.log("res", JSON.stringify(res))
  return res.data.items[0].id.videoId
}

export default async function downloadYouTubeVideo(query: string) {
  try {
    const videoId = await getYoutubeSearchId(query)
    console.log(`Video found: https://www.youtube.com/watch?v=${videoId}`)
    const output = await downloadAudio(
      `https://www.youtube.com/watch?v=${videoId}`
    )
    return output
  } catch (e) {
    console.error(e)
    return e
  }
}

async function downloadAudio(url: string): Promise<string> {
  fs.mkdir(path.resolve(__dirname.slice(0, __dirname.length - 4) + "public"), {
    recursive: true,
  })
  return new Promise((resolve, reject) =>
    youtubedl.exec(
      url,
      [
        "-o",
        "public/%(title)s.%(ext)s",
        "--extract-audio",
        "--audio-format",
        "mp3",
      ],
      {},
      (err, output) => (err ? reject(err) : resolve(output.join("\n")))
    )
  )
}

// async function downloadVideo(url: string, fileName: string) {
//   const video = youtubedl(url, ["--format=18", "-o", "%(title)s.%(ext)s"], {
//     cwd: __dirname,
//   })
//   return new Promise((resolve, reject) => {
//     video.on("info", function (info: { _filename: string; size: string }) {
//       console.log("Download started")
//       console.log("filename: " + info._filename)
//       console.log("size: " + info.size)
//     })
//     video.on("error", (error) => reject(error))
//     video.on("end", function () {
//       console.log("finished downloading!")
//       resolve(fileName)
//     })

//     video.pipe(createWriteStream(fileName))
//   })
// }
