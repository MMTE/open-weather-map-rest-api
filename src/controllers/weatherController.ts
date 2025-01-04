import {Request, Response, NextFunction} from 'express';
import {validateOrReject} from 'class-validator';
import {WeatherService} from "../services/weatherService";

export class WeatherController {
    private weatherService = new WeatherService();

    getAllWeather = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const weather = await this.weatherService.getAllWeather();
            res.json(weather);
        } catch (error) {
            next(error);
        }
    };

    getWeatherById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const weather = await this.weatherService.getWeatherById(req.params.id);
            res.json(weather);
        } catch (error) {
            next(error);
        }
    };

    getLatestByCity = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const weather = await this.weatherService.getLatestByCity(req.params.cityName);
            res.json(weather);
        } catch (error) {
            next(error);
        }
    };

    createWeather = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {cityName, country} = req.body;
            const weather = await this.weatherService.getWeatherByCityName(cityName, country);
            try {
                await validateOrReject(weather);
            } catch (error) {
                console.log(error)
            }
            res.status(201).json(weather);
        } catch (error) {
            next(error);
        }
    };

    updateWeather = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const weather = await this.weatherService.updateWeather(req.params.id, req.body);
            await validateOrReject(weather);
            res.json(weather);
        } catch (error) {
            next(error);
        }
    };

    deleteWeather = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.weatherService.deleteWeather(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
