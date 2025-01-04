import {Repository} from 'typeorm';
import axios from 'axios';
import {WeatherRequestParams, WeatherResponseData} from '../types/weather';
import {redisClient} from '../config/redis';
import {ApiError} from '../utils/api-error';
import {WeatherEntity} from "../entities/Weather.entity";
import {AppDataSource} from "../data-source";
import {RedisClientType} from "@redis/client";

export class WeatherService {
    private readonly weatherRepository: Repository<WeatherEntity>;
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly cache: RedisClientType;
    private readonly CACHE_TTL = 1800;

    constructor() {
        this.weatherRepository = AppDataSource.getRepository(WeatherEntity);
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        // @ts-ignore
        this.cache = redisClient;
    }

    private getCacheKey(lat: number, lon: number, units?: string): string {
        return `weather:${lat}:${lon}:${units || 'metric'}`;
    }

    private generateCacheKey(cityName: string, countryCode: string = '', units: string = 'metric'): string {
        return `weather:${cityName.toLowerCase()}:${countryCode}:${units}`;
    }

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

    async getWeatherByCityName(cityName: string, countryCode?: string, units: string = 'metric', lang: string = 'en'): Promise<WeatherEntity> {
        // const cacheKey = this.generateCacheKey(cityName, countryCode, units);
        // const cached = await this.cache.get(cacheKey);

        // if (cached) {
        //     return JSON.parse(cached);
        // }
        try {
            const weatherRequest = await axios.get(this.baseUrl, {
                params: {
                    q: `${cityName.toLowerCase()}${countryCode.toLowerCase() ? ',' + countryCode.toLowerCase() : ''}`,
                    limit: 1,
                    units: "metric",
                    appid: this.apiKey
                }
            });

            if (weatherRequest.data.length === 0) {
                throw new Error('Could not find location coordinates for the specified city.');
            }

            console.log(weatherRequest)

            const data = weatherRequest.data;
            const weatherEntity = this.mapResponseToEntity(data);
            const saved = await this.weatherRepository.save(weatherEntity);
            // await this.cache.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(saved));
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

    async getWeatherById(id: string): Promise<WeatherEntity> {
        const weather = await this.weatherRepository.findOne({
            where: {id}
        });

        if (!weather) {
            throw new ApiError(404, 'Weather record not found');
        }

        return weather;
    }

    async getAllWeather(): Promise<WeatherEntity[]> {
        return this.weatherRepository.find({
            order: {fetchedAt: 'DESC'}
        });
    }

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
