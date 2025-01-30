import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "./App.css";
import searchIcon from "./assets/search.png";
import cloudIcon from "./assets/cloud.png";
import sunIcon from "./assets/sun.jpg";
import drazzilIcon from "./assets/drazzil.jpeg";
import windIcon from "./assets/wind.png";
import snowIcon from "./assets/snow.jpeg";
import humidityIcon from "./assets/humidity.png";
import rainIcon from "./assets/rain.png";
import Login from "./Login"; 
import MyChart from "./MyChart";


const WeatherDetails = ({ icon, temp, city, country, lat, log, humidity, wind }) => {
  return (
    <div className="weather-details">
      <div className="image">
        <img src={icon} alt="Weather Icon" />
      </div>
      <div className="temp">{temp}{"\u00B0"}C</div>
      <div className="location">{city}</div>
      <div className="country">{country}</div>
      <div className="cord">
        <div>
          <span className="lat">Latitude:</span>
          <span>{lat}</span>
        </div>
        <div>
          <span className="log">Longitude:</span>
          <span>{log}</span>
        </div>
      </div>
      <div className="data-container">
        <div className="element">
          <img src={humidityIcon} alt="Humidity Icon" className="icon" />
          <div className="humidity-percent">{humidity}%</div>
          <div className="text">Humidity</div>
        </div>
        <div className="element">
          <img src={windIcon} alt="Wind Icon" className="icon" />
          <div className="wind-percent">{wind} km/h</div>
          <div className="text">Wind Speed</div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [text, setText] = useState("");
  const [icon, setIcon] = useState(rainIcon);
  const [temp, setTemp] = useState(0);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("IN");
  const [lat, setLat] = useState(0);
  const [log, setLog] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [wind, setWind] = useState(0);
  const [history, setHistory] = useState([]);
  const [cityNotFound, setCityNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm:ss"));
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [list, setListData] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition) => {
    if (condition.includes("clear")) return sunIcon;
    if (condition.includes("cloud")) return cloudIcon;
    if (condition.includes("rain")) return rainIcon;
    if (condition.includes("snow")) return snowIcon;
    if (condition.includes("wind")) return windIcon;
    return drazzilIcon; 
  };

  const search = async () => {
    setLoading(true);
    setCityNotFound(false);

    try {
      
      const response = await fetch("http://localhost:3000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

    
      const data = await response.json();

      setTemp(data.list[0].main.temp);
      setCity(data.city.name);
      setHumidity(data.list[0].main.humidity);
      setLat(data.city.coord.lat);
      setLog(data.city.coord.lon);
      setCountry(data.city.country);
      setWind(data.list[0].wind.speed);

      const weatherCondition = data.list[0].weather[0].description;
      setIcon(getWeatherIcon(weatherCondition));
      const new_list = data.list
      .filter((item) => item.dt_txt.includes("00:00:00"))
    
    
      setListData(new_list);
    
      setHistory((prevHistory) => [
        ...prevHistory,
        { city: data.city.name, createdAt: new Date() },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setCityNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCity = (e) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const deleteAll = () => {
    fetch("http://localhost:3000/", {
      method: "DELETE",
    })
      .then(() => {
        console.log("deleted successfully");
        setHistory([]);
      })
      .catch((err) => console.log(err));
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); 
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  

  return (
    <div className="container">
      <div className="input-container">
        <input
          type="text"
          className="cityInput"
          placeholder="Search City"
          onChange={handleCity}
          value={text}
          onKeyDown={handleKeyDown}
        />
        <div className="search-icon" onClick={search}>
          <img src={searchIcon} alt="Search" />
        </div>
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : cityNotFound ? (
        <div className="error">City not found. Please try again.</div>
      ) : (
        <WeatherDetails
          icon={icon}
          temp={temp}
          city={city}
          country={country}
          lat={lat}
          log={log}
          humidity={humidity}
          wind={wind}
        />
      )}

      <div className="history-container">
      
        {history.length > 0 ? (
          history.map((data, index) => (
            <p key={index}>
              {data.city} - {dayjs(data.createdAt).format("DD/MM/YY hh:mm")}
            </p>
          ))
        ) : (
          <p>No history available.</p>
        )}
     

      <div className="delete-button">
       
        <button onClick={deleteAll}>Delete All</button>
        
  
      </div>
      </div>
      <div className="forecast-container">
  {list.map((item, index) => (
    <div key={index} className="forecast-item">
      <img
        src={getWeatherIcon(item.weather[0].description)}
        alt="Weather Icon"
        className="forecast-icon"
      />
      <p className="forecast-date">
        {new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "long" })}
      </p>
      <p>Temp: {item.main.temp}{"\u00B0"}C</p>
      <div className="humidity-percent">humidity:{humidity}%</div>
    </div>
  ))}
</div>
<div className="chart-container">
  <MyChart forecastData={list}/>
</div>

    </div>
  );
}

export default App;
