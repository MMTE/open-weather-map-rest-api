/**
 * @fileoverview This module provides the WeatherService class which manages weather data interactions
 * using a weather API, a relational database, and a Redis cache. It supports operations like fetching,
 * caching, updating, deleting, and retrieving weather information.
 */
import {Repository} from 'typeorm';
import axios from 'axios';
import {WeatherRequestParams, WeatherResponseData} from '../types/weather';
import {redisClient} from '../config/redis';
import {ApiError} from '../utils/api-error';
import {WeatherEntity} from "../entities/Weather.entity";
import {AppDataSource} from "../data-source";
import {RedisClientType} from "@redis/client";

/**
 * @class WeatherService
 * @classdesc Provides methods for managing weather data, including fetching from OpenWeather API,
 * saving to database, and caching.
 */
export class WeatherService {
    private readonly weatherRepository: Repository<WeatherEntity>;
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly cache: RedisClientType;
    private readonly CACHE_TTL = 1800; // 30 minutes

    constructor() {
        this.weatherRepository = AppDataSource.getRepository(WeatherEntity);
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        // @ts-ignore
        this.cache = redisClient;
    }

    /**
     * Generates a cache key based on latitude, longitude, and units.
     * @param {number} lat - Latitude of the location.
     * @param {number} lon - Longitude of the location.
     * @param {string} [units='metric'] - Units for temperature measurement.
     * @returns {string} - Cache key.
     */
    private getCacheKey(lat: number, lon: number, units?: string): string {
        return `weather:${lat}:${lon}:${units || 'metric'}`;
    }

    /**
     * Generates a cache key based on city name, country code, and units.
     * @param {string} cityName - Name of the city.
     * @param {string} [countryCode=''] - Country code.
     * @param {string} [units='metric'] - Units for temperature measurement.
     * @returns {string} - Cache key.
     */
    private generateCacheKey(cityName: string, countryCode: string = '', units: string = 'metric'): string {
        return `weather:${cityName.toLowerCase()}:${countryCode}:${units}`;
    }

    /**
     * Maps API weather response data to a WeatherEntity instance.
     * @param {WeatherResponseData} response - The weather data retrieved from the API.
     * @returns {WeatherEntity} - The weather entity to be saved.
     */
    private mapResponseToEntity(response: WeatherResponseData): WeatherEntity {
        const weather = new WeatherEntity();
        weather.cityName = response.name;
        weather.lat = response.coord.lat;
        weather.lon = response.coord.lon;
        weather.country = response.sys.country;
        weather.temperature = response.main.temp;
        weather.feelsLike = response.main.feels_like;
        weather.pressure = response.main.pressure;
        weather.humidity = response.main.humidity;
        weather.windSpeed = response.wind.speed;
        weather.windDeg = response.wind.deg;
        weather.windGust = response.wind.gust || null;
        weather.description = response.weather[0]?.description;
        weather.visibility = response.visibility;
        weather.cloudiness = response.clouds.all;
        weather.rainVolume = response.rain?.['1h'] || 0;
        weather.snowVolume = response.snow?.['1h'] || 0;
        weather.fetchedAt = new Date(response.dt * 1000);
        return weather;
    }

    /**
     * Fetches weather data by geographical coordinates and returns a WeatherEntity.
     * @param {WeatherRequestParams} params - Query parameters including latitude, longitude, units, and language.
     * @returns {Promise<WeatherEntity>} - The weather entity.
     * @throws {ApiError} - Thrown if the request to the API fails.
     */
    async getWeatherByCoordinates(params: WeatherRequestParams): Promise<WeatherEntity> {
        const cacheKey = this.getCacheKey(params.lat, params.lon, params.units);
        const cached = await this.cache.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        try {
            const response = await axios.get<WeatherResponseData>(this.baseUrl, {
                params: {
                    lat: params.lat,
                    lon: params.lon,
                    appid: this.apiKey,
                    units: params.units || 'metric',
                    lang: params.lang || 'en'
                }
            });

            const weatherEntity = this.mapResponseToEntity(response.data);
            const saved = await this.weatherRepository.save(weatherEntity);

            await this.cache.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(saved));
            return saved;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new ApiError(
                    error.response?.status || 500,
                    error.response?.data?.message || 'Failed to fetch weather data'
                );
            }
            throw error;
        }
    }

    /**
     * Fetches weather data by city name and optional country code.
     * @param {string} cityName - Name of the city.
     * @param {string} [countryCode] - Country code.
     * @param {string} [units='metric'] - Units for temperature measurement.
     * @param {string} [lang='en'] - Language for the response.
     * @returns {Promise<WeatherEntity>} - The weather entity.
     * @throws {ApiError} - Thrown if the request to the API fails or location not found.
     */
    async getWeatherByCityName(cityName: string, countryCode?: string, units: string = 'metric', lang: string = 'en'): Promise<WeatherEntity> {
        const cacheKey = this.generateCacheKey(cityName, countryCode, units);
        const cached = await this.cache.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        try {
            const weatherRequest = await axios.get(this.baseUrl, {
                params: {
                    q: `${cityName.toLowerCase()}${countryCode.toLowerCase() ? ',' + countryCode.toLowerCase() : ''}`,
                    limit: 1,
                    units: "metric",
                    appid: this.apiKey,
                    lang: lang
                }
            });

            if (weatherRequest.data.length === 0) {
                throw new Error('Could not find location coordinates for the specified city.');
            }

            const data = weatherRequest.data;
            const weatherEntity = this.mapResponseToEntity(data);
            const saved = await this.weatherRepository.save(weatherEntity);
            await this.cache.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(saved));
            return saved;

        } catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                throw new ApiError(
                    error.response?.status || 500,
                    error.response?.data?.message || 'Failed to fetch weather data for city'
                );
            }
            throw error;
        }
    }

    /**
     * Retrieves the most recent weather data entry for a given city.
     * @param {string} cityName - Name of the city.
     * @returns {Promise<WeatherEntity>} - The latest weather entity.
     * @throws {ApiError} - Thrown if no data is found for the city.
     */
    async getLatestByCity(cityName: string): Promise<WeatherEntity> {
        const cacheKey = `latest:${cityName.toLowerCase()}`;
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const weather = await this.weatherRepository.findOne({
            where: {cityName},
            order: {fetchedAt: 'DESC'}
        });

        if (!weather) {
            throw new ApiError(404, 'No weather data found for this city');
        }

        await this.cache.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(weather));
        return weather;
    }

    /**
     * Retrieves a weather entity by its ID.
     * @param {string} id - The ID of the weather entity.
     * @returns {Promise<WeatherEntity>} - The weather entity.
     * @throws {ApiError} - Thrown if the record is not found.
     */
    async getWeatherById(id: string): Promise<WeatherEntity> {
        const weather = await this.weatherRepository.findOne({
            where: {id}
        });

        if (!weather) {
            throw new ApiError(404, 'Weather record not found');
        }

        return weather;
    }

    /**
     * Retrieves all weather records, sorted by the most recent.
     * @returns {Promise<WeatherEntity[]>} - Array of weather entities.
     */
    async getAllWeather(): Promise<WeatherEntity[]> {
        
        try {
            // Fetch all records, ordered by the fetchedAt column
            const weatherRecords = await this.weatherRepository.find();
            return weatherRecords;
        } catch (error) {
            console.error('Failed to fetch all weather records:', error.message, error.stack);
            throw new ApiError(500, 'Failed to retrieve weather data');
        }
    }


    /**
     * Deletes a weather entity by ID and clears related cache entries.
     * @param {string} id - The ID of the weather entity.
     * @returns {Promise<void>}
     */
    async deleteWeather(id: string): Promise<void> {
        const weather = await this.getWeatherById(id);
        await this.weatherRepository.remove(weather);

        const cacheKey = `weather:${weather.cityName.toLowerCase()}:${weather.units}`;
        const latestCacheKey = `latest:${weather.cityName.toLowerCase()}`;
        await Promise.all([
            this.cache.del(cacheKey),
            this.cache.del(latestCacheKey)
        ]);
    }

    /**
     * Updates an existing weather entity's data.
     * @param {string} id - The ID of the weather entity.
     * @param {Partial<WeatherEntity>} updateData - Partial update data.
     * @returns {Promise<WeatherEntity>} - The updated weather entity.
     */
    async updateWeather(id: string, updateData: Partial<WeatherEntity>): Promise<WeatherEntity> {
        const weather = await this.getWeatherById(id);
        Object.assign(weather, updateData);

        const updated = await this.weatherRepository.save(weather);

        const cacheKey = this.generateCacheKey(weather.cityName, weather.country, weather.units);
        const latestCacheKey = `latest:${weather.cityName.toLowerCase()}`;
        await Promise.all([
            this.cache.del(cacheKey),
            this.cache.del(latestCacheKey)
        ]);

        return updated;
    }
}
