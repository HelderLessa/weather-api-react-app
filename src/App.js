import { useState, useRef, useEffect } from "react";

const KEY = "YOUR OPENWEATHERMAP API KEY";

export default function App() {
  const inputRef = useRef(null);
  const [cityName, setCityName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleSubmit = async function (e) {
    const controller = new AbortController();

    try {
      e.preventDefault();
      if (!cityName) {
        setError(true);
        setIsLoading(false);
        alert("Type a city first!");
        setError(false);
        inputRef.current.focus();
        return;
      }
      setError(false);
      setIsLoading(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&APPID=${KEY}`,
        { signal: controller.signal }
      );
      if (res.status === 404) {
        setError(true);
        throw new Error("City not found!");
      }
      if (!res.ok) {
        setError(true);
        throw new Error("Something went wrong with fetching weather data.");
      }
      const data = await res.json();
      setWeatherInfo(data);

      setCityName("");
      setIsLoading(false);
      inputRef.current.focus();
    } catch (err) {
      alert(err.message);
      setError(false);
      setIsLoading(false);
      setCityName("");
      inputRef.current.focus();
    } finally {
      controller.abort();
    }
  };

  let displayContent = "";
  if (error) {
    displayContent = "";
  } else if (isLoading && !error) {
    displayContent = <p className="loading">LOADING...</p>;
  } else if (!isLoading && !error && weatherInfo) {
    const {
      main: { temp, humidity, feels_like },
      weather: {
        0: { main: sky },
      },
      sys: { sunrise, sunset },
    } = weatherInfo;

    const sunriseTime = new Date(sunrise * 1000);
    const sunsetTime = new Date(sunset * 1000);

    const formattedSunrise = sunriseTime.toLocaleTimeString();
    const formattedSunset = sunsetTime.toLocaleTimeString();

    displayContent = (
      <ul className="output">
        <li>{sky}</li>
        <li>{`Average temperature: ${temp}° C`}</li>
        <li>{`Humidity: ${humidity}%`}</li>
        <li>{`Feels like: ${feels_like}° C`}</li>
        <li>{`Sunrise: ${formattedSunrise}`}</li>
        <li>{`Sunset: ${formattedSunset}`}</li>
      </ul>
    );
  }

  return (
    <main className="container">
      <Form
        handleSubmit={handleSubmit}
        inputRef={inputRef}
        cityName={cityName}
        setCityName={setCityName}
      />
      <div>{displayContent}</div>
    </main>
  );
}

function Form({ handleSubmit, inputRef, cityName, setCityName }) {
  return (
    <form onSubmit={handleSubmit} className="form-box">
      <h1 className="title">How's the weather in your city?</h1>
      <input
        ref={inputRef}
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
        className="user-input"
        placeholder="type your city..."
      ></input>
      <button type="submit" className="btn btn-light">
        Check it out!
      </button>
    </form>
  );
}
