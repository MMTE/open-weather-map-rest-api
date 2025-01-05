/**
 * @fileoverview This module defines the WeatherController class, which provides the routes
 * to interact with weather data, including fetching, creating, updating, and deleting operations.
 */
import { Request, Response, NextFunction } from "express";
import { validateOrReject } from "class-validator";
import { WeatherService } from "../services/weatherService";

/**
 * @class WeatherController
 * @classdesc Manages HTTP requests related to weather data using the WeatherService.
 */
export class WeatherController {
  private weatherService = new WeatherService();

  /**
   * Retrieves all weather entries and sends them in the response.
   * @async
   * @method getAllWeather
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  getAllWeather = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weather = await this.weatherService.getAllWeather();
      res.json(weather);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves a weather entry by ID and sends it in the response.
   * @async
   * @method getWeatherById
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  getWeatherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weather = await this.weatherService.getWeatherById(req.params.id);
      res.json(weather);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves the latest weather entry for a specified city and sends it in the response.
   * @async
   * @method getLatestByCity
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  getLatestByCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weather = await this.weatherService.getLatestByCity(
        req.params.cityName
      );
      res.json(weather);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new weather entry for a specified city and country, validates it, and sends a success response.
   * @async
   * @method createWeather
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  createWeather = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cityName, country } = req.body;
      const weather = await this.weatherService.getWeatherByCityName(
        cityName,
        country
      );
      // await validateOrReject(weather);
      res.status(201).json(weather);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates an existing weather entry by ID, validates the update, and sends a success response.
   * @async
   * @method updateWeather
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  updateWeather = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weather = await this.weatherService.updateWeather(
        req.params.id,
        req.body
      );
      await validateOrReject(weather);
      res.json(weather);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes a weather entry by ID and sends a no-content response.
   * @async
   * @method deleteWeather
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  deleteWeather = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.weatherService.deleteWeather(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
