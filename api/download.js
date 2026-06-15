const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const apiUrl = `https://api.cobalt.tools/`;
    
    const response = await axios.post(apiUrl, 
      { url: url },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;

    if (!data || !data.url) {
      return res.status(404).json({ error: "No video found" });
    }

    return res.status(200).json({
      result: data.url,
      cp: `🎬 ${data.filename || "Video"}\n👤 Rocky Chowdhury`
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
