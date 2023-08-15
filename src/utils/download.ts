import fs from "fs"
import path from "path"
import youtubeDl, { YtFlags } from "youtube-dl-exec"
import { BASE_DIR } from "../configs"

const getInfo = (url: string, flags?: YtFlags) =>
  youtubeDl(url, { dumpSingleJson: true, ...flags })

const fromInfo = (infoFile: string, flags: YtFlags) =>
  youtubeDl.exec(infoFile, { loadInfoJson: infoFile, ...flags })

async function downloadWithUrl(url: string, ext = "mp3") {
  const info = await getInfo(url)

  const current_url = new URL(url)
  const search_params = current_url.searchParams
  const v = search_params.get("v")
  const infoJsonFileName = `${v}.json`
  const downloadDir = path.join(BASE_DIR, "./downloads-spotify-yt/yt")

  if (!fs.existsSync(downloadDir))
    fs.mkdirSync(downloadDir, {
      recursive: true,
    })

  const infoJsonPath = path.join(downloadDir, infoJsonFileName)
  fs.writeFileSync(infoJsonPath, JSON.stringify(info))

  console.log(info.description)
  console.log((await fromInfo(infoJsonPath, { listThumbnails: true })).stdout)

  const outputFilePath = path.join(downloadDir, `${v}.${ext}`)

  await fromInfo(infoJsonPath, {
    output: outputFilePath,
    extractAudio: true,
    audioFormat: ext,
  } as YtFlags)
}

export { downloadWithUrl }
