let express = require("express");
let mongo = require("mongoose");
let cors = require("cors");

let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

let port = 3000;


mongo
  .connect("mongodb://127.0.0.1:27017/HomeService")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("DB connection failed:", err));

let searchschema = new mongo.Schema(
  {
    text: String,
  },
  { timestamps: true }
);
const Search = mongo.model("Search", searchschema, "Search"); 

app.get("/", (req, res) => {
  res.send("Weather API is running!");
});

app.post("/", async (req, res) => {
  const text = req.body.text;
  
  console.log("Received text from request body:", text); 
  
  if (!text) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const fetch = (await import("node-fetch")).default;
    const apiKey = "06e6298bc8d9d866002c5a304233fc3b";
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&q=${text}&units=metric`
    );

    if (!result.ok) {
      return res.status(result.status).json({ error: "City not found" });
    }

    const weatherData = await result.json();
    console.log("Weather Data:", weatherData);

  
    const newSearch = new Search({ text: text });
    await newSearch.save();
    console.log("Data Saved to MongoDB:", newSearch);

    res.json(weatherData);
  } catch (err) {
    console.error("Error fetching weather data:", err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
