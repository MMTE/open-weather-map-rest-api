import {AppDataSource} from "../../src/data-source";
import request from "supertest";
import app from "../../src/app";

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
  },
}));

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
  jest.restoreAllMocks();
});

describe('E2E Weather API Tests', () => {
  let weatherId: string;

  it('should fetch and store weather for a city', async () => {
    // @ts-ignore
    const response = await request(app)
      .post('/api/weather')
      .send({ cityName: 'Berlin', country: 'DE' });
    expect(response.status).toBe(201);
    expect(response.body.cityName).toBe('Berlin');
    expect(response.body.country).toBe('DE');
    weatherId = response.body.id;
  });

  it('should retrieve all stored weather records', async () => {
    const response = await request(app).get('/api/weather');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should retrieve a weather record by ID', async () => {
    const response = await request(app).get(`/api/weather/${weatherId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(weatherId);
  });

  it('should update a weather record', async () => {
    const response = await request(app)
      .put(`/api/weather/${weatherId}`)
      .send({ temperature: 30 });
    expect(response.status).toBe(200);
    expect(response.body.temperature).toBe(30);
  });

  it('should delete a weather record', async () => {
    const response = await request(app).delete(`/api/weather/${weatherId}`);
    expect(response.status).toBe(204);

    const checkResponse = await request(app).get(`/api/weather/${weatherId}`);
    expect(checkResponse.status).toBe(404);
  });

  it('should return the latest weather data for a city', async () => {
    await request(app)
      .post('/api/weather')
      .send({ cityName: 'Berlin', country: 'DE' });

    const response = await request(app).get('/api/weather/latest/Berlin');
    expect(response.status).toBe(200);
    expect(response.body.cityName).toBe('Berlin');
  });
});
