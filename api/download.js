const axios = require("axios");

// =============================================
//   All-in-One Video Downloader API
//   Author  : Rocky Chowdhury
//   Version : 1.0
// =============================================

const SUPPORTED = [
  "tiktok.com",
  "youtube.com", "youtu.be",
  "twitter.com", "x.com",
  "facebook.com", "fb.watch",
  "instagram.com",
  "threads.net",
  "snapchat.com",
  "pinterest.com", "pin.it",
  "reddit.com",
  "linkedin.com",
  "dailymotion.com", "dai.ly",
  "capcut.com",
  "spotify.com",
  "soundcloud.com",
  "bsky.app",
  "tumblr.com",
  "kwai.com", "kuaishou.com",
  "douyin.com"
];

// ---------- helper: pick the right sub-API ----------
async function fetchVideoUrl(url) {
  // TikTok
  if (url.includes("tiktok.com")) {
    const r = await axios.get(
      `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`
    );
    return {
      result: r.data?.video?.noWatermark || r.data?.video?.watermark || null,
      cp: r.data?.title || "TikTok Video"
    };
  }

  // YouTube / Shorts
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const r = await axios.get(
      `https://yt-api.p.rapidapi.com/dl?id=${encodeURIComponent(url)}`,
      { headers: { "x-rapidapi-host": "yt-api.p.rapidapi.com" } }
    );
    const formats = r.data?.formats || [];
    const mp4 = formats.find(f => f.mimeType?.includes("video/mp4"));
    return {
      result: mp4?.url || null,
      cp: r.data?.title || "YouTube Video"
    };
  }

  // Facebook / FB Watch
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    const r = await axios.get(
      `https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`,
      { headers: { "x-rapidapi-host": "facebook-reel-and-video-downloader.p.rapidapi.com" } }
    );
    return {
      result: r.data?.links?.Download_HD || r.data?.links?.Download_SD || null,
      cp: r.data?.title || "Facebook Video"
    };
  }

  // Instagram / Reels
  if (url.includes("instagram.com")) {
    const r = await axios.get(
      `https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`,
      { headers: { "x-rapidapi-host": "instagram-downloader-download-instagram-videos-stories.p.rapidapi.com" } }
    );
    return {
      result: r.data?.media || null,
      cp: r.data?.title || "Instagram Video"
    };
  }

  // Twitter / X
  if (url.includes("twitter.com") || url.includes("x.com")) {
    const r = await axios.get(
      `https://twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com/status?url=${encodeURIComponent(url)}`,
      { headers: { "x-rapidapi-host": "twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com" } }
    );
    const videos = r.data?.media?.video || [];
    const best = videos.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
    return {
      result: best?.url || null,
      cp: r.data?.text || "Twitter/X Video"
    };
  }

  // Fallback — generic cobalt-style endpoint
  const r = await axios.post(
    "https://co.wuk.sh/api/json",
    { url, vCodec: "h264", vQuality: "720", aFormat: "mp3", isAudioOnly: false },
    { headers: { Accept: "application/json", "Content-Type": "application/json" } }
  );
  return {
    result: r.data?.url || null,
    cp: "Downloaded by Rocky Chowdhury"
  };
}

// ---------- main handler ----------
module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      author: "Rocky Chowdhury",
      error: "Missing ?url= parameter"
    });
  }

  const isSupported = SUPPORTED.some(d => url.includes(d));
  if (!isSupported) {
    return res.status(400).json({
      success: false,
      author: "Rocky Chowdhury",
      error: "Unsupported platform"
    });
  }

  try {
    const { result, cp } = await fetchVideoUrl(url);

    if (!result) {
      return res.status(404).json({
        success: false,
        author: "Rocky Chowdhury",
        error: "Could not extract video URL"
      });
    }

    return res.status(200).json({
      success: true,
      author: "Rocky Chowdhury",
      result,
      cp
    });

  } catch (err) {
    console.error("[Rocky API Error]", err.message);
    return res.status(500).json({
      success: false,
      author: "Rocky Chowdhury",
      error: err.message
    });
  }
};
