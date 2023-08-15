import { config } from "dotenv"
import path from "node:path"
config()

export const scopes = [
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
  state = "some-state",
  credentials = {
    clientId: "ffb4a8719d1b4fcd90c2a2e35085587c",
    clientSecret: process.env.SPOTIFY_SECRET,
    redirectUri:
      process.env.NODE_ENV === "production"
        ? process.env.REDIRECT_URI
        : "http://localhost:3000/callback",
  },
  YOUTUBE_KEY = process.env.YOUTUBE_KEY,
  BASE_YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search",
  BASE_DIR = path.join(__dirname, "../../")
