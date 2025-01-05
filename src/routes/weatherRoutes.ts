import {Router} from "express";
import {WeatherController} from "../controllers/weatherController";

const router = Router();
const weatherController = new WeatherController();

router.get('/weather', weatherController.getAllWeather);
router.get('/weather:id', weatherController.getWeatherById);
router.get('/weather/latest/:cityName', weatherController.getLatestByCity);
router.post('/weather', weatherController.createWeather);
router.put('/weather:id', weatherController.updateWeather);
router.delete('/weather:id', weatherController.deleteWeather);

export default router;
