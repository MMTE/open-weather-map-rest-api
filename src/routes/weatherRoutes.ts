import {Router} from "express";
import {WeatherController} from "../controllers/weatherController";

const router = Router();

const weatherController = new WeatherController();

router.get('/', weatherController.getAllWeather);
router.get('/:id', weatherController.getWeatherById);
router.get('/latest/:cityName', weatherController.getLatestByCity);
router.post('/', weatherController.createWeather);
router.put('/:id', weatherController.updateWeather);
router.delete('/:id', weatherController.deleteWeather);

export default router;
