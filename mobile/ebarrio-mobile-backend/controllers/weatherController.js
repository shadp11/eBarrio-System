import axios from "axios";
import { configDotenv } from "dotenv";
import User from "../models/Users.js";
import { sendPushNotification } from "../utils/collectionUtils.js";
configDotenv();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

let isRaining = false;
let isRainExpected = false;

export const checkRainForecast = async () => {
  try {
    const user = await User.find().select("pushtoken");

    const response = await axios.get(
      "http://api.weatherapi.com/v1/forecast.json",
      {
        params: {
          key: WEATHER_API_KEY,
          q: "14.4613,120.9658",
          days: 1,
        },
      }
    );

    const hourlyData = response.data.forecast.forecastday[0].hour;
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const rainingNow = hourlyData.some((hour) => {
      const hourTime = new Date(hour.time);
      if (
        hourTime <= now &&
        hourTime > new Date(now.getTime() - 60 * 60 * 1000)
      ) {
        return (
          hour.condition.text.toLowerCase().includes("rain") ||
          hour.condition.text.toLowerCase().includes("heavy") ||
          hour.condition.text.toLowerCase().includes("shower") ||
          hour.condition.text.toLowerCase().includes("showers") ||
          hour.condition.text.toLowerCase().includes("drizzle") ||
          hour.condition.text.toLowerCase().includes("heavy")
        );
      }
      return false;
    });

    const rainExpectedInOneHour = hourlyData.some((hour) => {
      const hourTime = new Date(hour.time);
      if (hourTime > now && hourTime <= oneHourLater) {
        return (
          hour.condition.text.toLowerCase().includes("rain") ||
          hour.condition.text.toLowerCase().includes("heavy") ||
          hour.condition.text.toLowerCase().includes("shower") ||
          hour.condition.text.toLowerCase().includes("showers") ||
          hour.condition.text.toLowerCase().includes("drizzle") ||
          hour.condition.text.toLowerCase().includes("heavy")
        );
      }
      return false;
    });

    if (rainingNow && !isRaining) {
      console.log("🌧️ It’s starting to rain now. Stay safe!");
      isRaining = true;
      isRainExpected = false;
      for (const element of user) {
        if (element?.pushtoken) {
          await sendPushNotification(
            element.pushtoken,
            `🌧️ Weather Alert`,
            "It's starting to rain now. Stay safe!",
            "Weather"
          );
        }
      }
    } else if (!rainingNow && isRaining) {
      console.log("☀️ Rain stopped. Resetting notification flags.");
      isRaining = false;
      isRainExpected = false;
    } else if (!rainingNow && rainExpectedInOneHour && !isRainExpected) {
      console.log("🌧️ Rain expected in 1 hour. Stay safe!");
      isRainExpected = true;
      for (const element of user) {
        if (element?.pushtoken) {
          await sendPushNotification(
            element.pushtoken,
            `🌧️ Weather Alert`,
            "Rain expected in 1 hour. Stay safe!",
            "Weather"
          );
        }
      }
    } else if (!rainExpectedInOneHour && isRainExpected) {
      isRainExpected = false;
    } else {
      console.log("No change in rain status, no notification sent.");
    }
  } catch (error) {
    console.error("Error checking rain forecast:", error.message || error);
  }
};

export const getWeather = async (req, res) => {
  try {
    const weather = await axios.get(
      `http://api.weatherapi.com/v1/forecast.json`,
      {
        params: {
          q: `14.4613,120.9658`,
          key: WEATHER_API_KEY,
          days: 3,
        },
      }
    );

    // CURRENT WEATHER (TEMPERATURE, WIND, CONDITION)
    const {
      temp_c,
      wind_kph,
      condition: { text },
    } = weather.data.current;

    // CURRENT WEATHER (HIGH AND LOW TEMPERATURE)
    const { maxtemp_c, mintemp_c } = weather.data.forecast.forecastday[0].day;

    // CURRENT WEATHER (HOURLY FORECAST)
    const hourlyData = weather.data.forecast.forecastday[0].hour;

    const hourlyWeather = hourlyData.map((hour) => {
      const time = new Date(hour.time_epoch * 1000);

      const formattedTime = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        time: formattedTime,
        temperature: hour.temp_c,
        condition: hour.condition.text,
      };
    });

    // 2 DAYS FORECAST (DATE, HIGH AND LOW TEMPERATURE)

    const {
      maxtemp_c: maxtemp_tomorrow,
      mintemp_c: mintemp_tomorrow,
      condition: { text: condition_tomorrow },
    } = weather.data.forecast.forecastday[1].day;

    const {
      maxtemp_c: maxtemp_dayAfterTomorrow,
      mintemp_c: mintemp_dayAfterTomorrow,
      condition: { text: condition_dayAfterTomorrow },
    } = weather.data.forecast.forecastday[2].day;

    return res.json({
      currenttemp: temp_c,
      currentwind: wind_kph,
      currentcondition: text,
      currenthigh: maxtemp_c,
      currentlow: mintemp_c,
      hourlyForecast: hourlyWeather,
      tomorrow: {
        high: maxtemp_tomorrow,
        low: mintemp_tomorrow,
        condition: condition_tomorrow,
      },
      dayAfterTomorrow: {
        high: maxtemp_dayAfterTomorrow,
        low: mintemp_dayAfterTomorrow,
        condition: condition_dayAfterTomorrow,
      },
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.message || error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
