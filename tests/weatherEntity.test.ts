import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import {WeatherEntity} from "../src/entities/Weather.entity";
describe("WeatherEntity Validation", () => {
    it("should pass validation with valid data", async () => {
        const validData = {
            cityName: "London",
            lat: 51.5085,
            lon: -0.1257,
            country: "GB",
            temperature: 0.75,
            feelsLike: -4.58,
            pressure: 1002,
            humidity: 93,
            windSpeed: 6.17,
            windDeg: 100,
            windGust: null,
            description: "light rain",
            visibility: 10000,
            cloudiness: 100,
            rainVolume: "0.84", // String input for testing transformation
            snowVolume: "0.00", // String input for testing transformation
            fetchedAt: new Date(),
            tempMin: null,
            tempMax: null,
            units: "metric",
        };

        // Transform plain object to class instance
        const weatherInstance = plainToInstance(WeatherEntity, validData);

        // Validate the instance
        const errors = await validate(weatherInstance);

        // Expect no validation errors
        expect(errors.length).toBe(0);
    });

    it("should fail validation with invalid data", async () => {
        const invalidData = {
            cityName: "London",
            lat: "invalid", // Invalid latitude
            lon: -0.1257,
            country: "GB",
            temperature: "invalid", // Invalid temperature
            feelsLike: -4.58,
            pressure: 1002,
            humidity: "high", // Invalid humidity
            windSpeed: "fast", // Invalid windSpeed
            windDeg: 100,
            description: "light rain",
            visibility: 10000,
            cloudiness: 100,
            rainVolume: "rainy", // Invalid rainVolume
            snowVolume: "snowy", // Invalid snowVolume
            fetchedAt: new Date(),
            units: "metric",
        };

        const weatherInstance = plainToInstance(WeatherEntity, invalidData);

        const errors = await validate(weatherInstance);

        // Expect validation errors for invalid fields
        expect(errors.length).toBeGreaterThan(0);
        const errorFields = errors.map((err) => err.property);
        expect(errorFields).toEqual(
            expect.arrayContaining(["lat", "temperature", "humidity", "windSpeed", "rainVolume", "snowVolume"])
        );
    });
});
