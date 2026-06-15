const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const options = {
      method: "GET",
      url: "https://social-media-video-downloader.p.rapidapi.com/smvd/get/all",
      params: { url },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "social-media-video-downloader.p.rapidapi.com"
      }
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!data || !data.links || data.links.length === 0) {
      return res.status(404).json({ error: "No video found" });
    }

    const videoLink =
      data.links.find(l => l.quality === "hd") ||
      data.links.find(l => l.quality === "sd") ||
      data.links[0];

    return res.status(200).json({
      result: videoLink.link,
      cp: `🎬 ${data.title || "Video"}\n👤 Rocky Chowdhury`
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
