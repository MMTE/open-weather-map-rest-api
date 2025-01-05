import { Request, Response } from 'express';
import { WeatherController } from '../../../src/controllers/weatherController';
import { WeatherService } from '../../../src/services/weatherService';
import { validateOrReject } from 'class-validator';

jest.mock('../../../src/services/weatherService'); // Mock the entire module

describe('WeatherController', () => {
    let controller: WeatherController;
    let mockWeatherService: jest.Mocked<WeatherService>;
    beforeEach(() => {
        mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
        controller = new WeatherController();

        // Inject mock service into controller
        (controller as any).weatherService = mockWeatherService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

test('getAllWeather - Should return all weather records', async () => {
    const mockWeatherData = [{ id: 1, cityName: 'London' }];
    mockWeatherService.getAllWeather.mockResolvedValueOnce(mockWeatherData);

    const req = {} as Request;
        const res = { json: jest.fn() } as unknown as Response;
    const next = jest.fn();

    await controller.getAllWeather(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockWeatherData);
    expect(next).not.toHaveBeenCalled();
});

test('getAllWeather - Should handle errors', async () => {
    const error = new Error('Something went wrong');
    mockWeatherService.getAllWeather.mockRejectedValueOnce(error);

    const req = {} as Request;
        const res = { json: jest.fn() } as unknown as Response;
    const next = jest.fn();

    await controller.getAllWeather(req, res, next);

    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
});

test('getWeatherById - Should return weather by ID', async () => {
    const mockWeather = { id: 1, cityName: 'London' };
    mockWeatherService.getWeatherById.mockResolvedValueOnce(mockWeather);

        const req = { params: { id: '1' } } as Request;
        const res = { json: jest.fn() } as unknown as Response;
    const next = jest.fn();

    await controller.getWeatherById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockWeather);
    expect(next).not.toHaveBeenCalled();
});

test('getWeatherById - Should handle errors', async () => {
    const error = new Error('Weather not found');
    mockWeatherService.getWeatherById.mockRejectedValueOnce(error);

        const req = { params: { id: '1' } } as Request;
        const res = { json: jest.fn() } as unknown as Response;
    const next = jest.fn();

    await controller.getWeatherById(req, res, next);

    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
});

test('createWeather - Should create and validate weather', async () => {
    const mockWeatherData = { id: 1, cityName: 'London' };
    const reqBody = { cityName: 'London', country: 'UK' };
    mockWeatherService.getWeatherByCityName.mockResolvedValueOnce(mockWeatherData);
        jest.spyOn(validateOrReject, 'validateOrReject').mockResolvedValue(undefined);

        const req = { body: reqBody } as Request;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as Response;
    const next = jest.fn();

    await controller.createWeather(req, res, next);

    expect(mockWeatherService.getWeatherByCityName).toHaveBeenCalledWith(reqBody.cityName, reqBody.country);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockWeatherData);
    expect(next).not.toHaveBeenCalled();
});

test('createWeather - Should handle errors', async () => {
    const error = new Error('Validation failed');
        const reqBody = { cityName: 'London' }; // Missing country
    mockWeatherService.getWeatherByCityName.mockResolvedValueOnce({});
        jest.spyOn(validateOrReject, 'validateOrReject').mockRejectedValueOnce(error);
        const req = { body: reqBody } as Request;
        const res = { json: jest.fn(), status: jest.fn() } as Response;
    const next = jest.fn();

    await controller.createWeather(req, res, next);

        expect(mockWeatherService.getWeatherByCityName).toHaveBeenCalledWith(reqBody.cityName, undefined);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(error);
    });
});
