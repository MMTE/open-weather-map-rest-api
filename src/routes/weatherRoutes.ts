import { Router } from "express";
import {
  getWeather,
  getWeatherById,
  createWeather,
  deleteWeather,
  updateWeather,
} from "../controllers/weatherController";

const router = Router();

router.get("/weather", getWeather);
router.get("/weather/:id", getWeatherById);
router.post("/weather", createWeather);
router.put("/weather/:id", updateWeather);
router.delete("/weather/:id", deleteWeather);

export default router;
