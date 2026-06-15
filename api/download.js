const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.post(
      "https://all-social-media-video-downloader4.p.rapidapi.com/index.php",
      new URLSearchParams({ url }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-rapidapi-host": "all-social-media-video-downloader4.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY
        }
      }
    );

    const data = response.data;

    if (!data || !data.links) {
      return res.status(404).json({ error: "No video found" });
    }

    const videoLink =
      data.links.find(l => l.quality === "hd") ||
      data.links.find(l => l.quality === "sd") ||
      data.links[0];

    return res.status(200).json({
      result: videoLink.link || videoLink.url,
      cp: `🎬 ${data.title || "Video"}\n👤 Rocky Chowdhury`
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
