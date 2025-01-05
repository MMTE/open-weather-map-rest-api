import {Repository, FindOneOptions, FindManyOptions} from 'typeorm';
import axios from 'axios';
import {WeatherService} from "../../../src/services/weatherService";
import {WeatherEntity} from "../../../src/entities/Weather.entity";
import {AppDataSource} from "../../../src/data-source";
import {redisClient} from "../../../src/config/redis";

jest.mock('axios');

jest.mock('../../../src/config/redis', () => ({
    redisClient: {
        get: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
    },
}));

jest.mock('../../../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe('WeatherService', () => {
    let weatherService: WeatherService;
    let mockRepository: jest.Mocked<Repository<WeatherEntity>>;
    let mockRedis: any;

    const mockWeatherData = {
        name: 'London',
        coord: {lat: 51.51, lon: -0.13},
        sys: {country: 'GB'},
        main: {
            temp: 15.2,
            feels_like: 14.8,
            pressure: 1012,
            humidity: 76,
        },
        wind: {
            speed: 4.1,
            deg: 250,
            gust: 8.2,
        },
        weather: [{description: 'scattered clouds'}],
        visibility: 10000,
        clouds: {all: 40},
        rain: {'1h': 0},
        snow: {'1h': 0},
        dt: 1641038400,
    };

    const currentDate = new Date('2025-01-05T01:11:25.130Z');
    const fetchedDate = new Date('2022-01-01T12:00:00.000Z');

    const mockWeatherEntity: WeatherEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cityName: 'London',
        country: 'GB',
        lat: 51.51,
        lon: -0.13,
        temperature: 15.2,
        feelsLike: 14.8,
        pressure: 1012,
        humidity: 76,
        windSpeed: 4.1,
        windDeg: 250,
        windGust: 8.2,
        description: 'scattered clouds',
        visibility: 10000,
        cloudiness: 40,
        rainVolume: 0,
        snowVolume: 0,
        units: 'metric',
        fetchedAt: fetchedDate,
        createdAt: currentDate,
        updatedAt: currentDate,
        tempMin: null,
        tempMax: null,
    };

    // Helper function to convert string dates to Date objects
    const stringToDateEntity = (entity: any): WeatherEntity => ({
        ...entity,
        createdAt: new Date(entity.createdAt),
        updatedAt: new Date(entity.updatedAt),
        fetchedAt: new Date(entity.fetchedAt),
    });

    beforeEach(() => {
        mockRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<Repository<WeatherEntity>>;

        mockRedis = {
            get: jest.fn(),
            setEx: jest.fn(),
            del: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        (redisClient as any) = mockRedis;
        weatherService = new WeatherService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getWeatherByCoordinates', () => {
        const coords = {lat: 51.51, lon: -0.13};

        it('should return cached weather data if available', async () => {
            const cachedData = {
                ...mockWeatherEntity,
                createdAt: currentDate.toISOString(),
                updatedAt: currentDate.toISOString(),
                fetchedAt: fetchedDate.toISOString(),
            };
            mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

            const result = await weatherService.getWeatherByCoordinates(coords);

            expect(result).toEqual(stringToDateEntity(cachedData));
            expect(mockRedis.get).toHaveBeenCalledWith('weather:51.51:-0.13:metric');
            expect(axios.get).not.toHaveBeenCalled();
        });

        it('should fetch and store weather data if not cached', async () => {
            mockRedis.get.mockResolvedValue(null);
            (axios.get as jest.Mock).mockResolvedValue({data: mockWeatherData});
            mockRepository.save.mockResolvedValue(mockWeatherEntity);

            const result = await weatherService.getWeatherByCoordinates(coords);

            expect(result).toEqual(mockWeatherEntity);
            expect(axios.get).toHaveBeenCalled();
            expect(mockRepository.save).toHaveBeenCalled();
            expect(mockRedis.setEx).toHaveBeenCalled();
        });

        it('should handle API errors correctly', async () => {
            mockRedis.get.mockResolvedValue(null);
            const axiosError = {
                isAxiosError: true,
                response: {status: 404, data: {message: 'City not found'}}
            };
            (axios.get as jest.Mock).mockRejectedValue(axiosError);

            await expect(weatherService.getWeatherByCoordinates(coords))
                .rejects
                .toThrow('City not found');
        });
    });

    describe('getLatestByCity', () => {
        it('should return cached latest city weather if available', async () => {
            const cachedData = {
                ...mockWeatherEntity,
                createdAt: currentDate.toISOString(),
                updatedAt: currentDate.toISOString(),
                fetchedAt: fetchedDate.toISOString(),
            };
            mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

            const result = await weatherService.getLatestByCity('London');

            expect(result).toEqual(stringToDateEntity(cachedData));
            expect(mockRedis.get).toHaveBeenCalledWith('latest:london');
            expect(mockRepository.findOne).not.toHaveBeenCalled();
        });

        it('should fetch from database if not cached', async () => {
            mockRedis.get.mockResolvedValue(null);
            mockRepository.findOne.mockResolvedValue(mockWeatherEntity);

            const result = await weatherService.getLatestByCity('London');

            expect(result).toEqual(mockWeatherEntity);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: {cityName: 'London'},
                order: {fetchedAt: 'DESC'}
            });
            expect(mockRedis.setEx).toHaveBeenCalled();
        });

        it('should throw error if city not found', async () => {
            mockRedis.get.mockResolvedValue(null);
            mockRepository.findOne.mockResolvedValue(null);

            await expect(weatherService.getLatestByCity('NonexistentCity'))
                .rejects
                .toThrow('No weather data found for this city');
        });
    });

    describe('CRUD Operations', () => {
        describe('getAllWeather', () => {
            it('should return all weather records', async () => {
                mockRepository.find.mockResolvedValue([mockWeatherEntity]);

                const result = await weatherService.getAllWeather();

                expect(result).toEqual([mockWeatherEntity]);
                expect(mockRepository.find).toHaveBeenCalledWith({
                    order: {fetchedAt: 'DESC'}
                });
            });
        });

        describe('getWeatherById', () => {
            it('should return weather record by id', async () => {
                mockRepository.findOne.mockResolvedValue(mockWeatherEntity);

                const result = await weatherService.getWeatherById('123');

                expect(result).toEqual(mockWeatherEntity);
                expect(mockRepository.findOne).toHaveBeenCalledWith({
                    where: {id: '123'}
                });
            });

            it('should throw error if record not found', async () => {
                mockRepository.findOne.mockResolvedValue(null);

                await expect(weatherService.getWeatherById('123'))
                    .rejects
                    .toThrow('Weather record not found');
            });
        });

        describe('updateWeather', () => {
            it('should update weather record', async () => {
                const updateData = {temperature: 20.5};
                const updatedEntity = {
                    ...mockWeatherEntity,
                    ...updateData
                };

                mockRepository.findOne.mockResolvedValue(mockWeatherEntity);
                mockRepository.save.mockResolvedValue(updatedEntity);

                const result = await weatherService.updateWeather('123', updateData);

                expect(result.temperature).toBe(20.5);
                expect(mockRedis.del).toHaveBeenCalled();
            });
        });

        describe('deleteWeather', () => {
            it('should delete weather record and clear cache', async () => {
                mockRepository.findOne.mockResolvedValue(mockWeatherEntity);

                await weatherService.deleteWeather('123');

                expect(mockRepository.remove).toHaveBeenCalledWith(mockWeatherEntity);
                expect(mockRedis.del).toHaveBeenCalled();
            });
        });
    });
});
