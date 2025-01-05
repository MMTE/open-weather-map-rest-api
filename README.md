# Open Weather Map REST API

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Configuration](#configuration)
7. [Contributing](#contributing)
8. [License](#license)
9. [Contact](#contact)

## Project Overview

The Open Weather Map REST API is a service designed to provide comprehensive weather data through a simple RESTful interface. This API enables developers to integrate real-time and accurate weather information into their applications, making it ideal for weather-driven solutions.

## Features

- Access current weather data for any location worldwide.
- Easily integrated with minimal setup.
- Provides detailed weather attributes including temperature, wind, humidity, cloudiness, and more.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/mmte/open-weather-map-rest-api.git
   cd open-weather-map-rest-api
   ```

2. **Install Dependencies:**
   Ensure Node.js and npm are installed. Then run:

   ```bash
   npm install
   ```

3. **Build the Project:**

   ```bash
   npm run build
   ```

4. **Start the Server:**

   ```bash
   npm start
   ```

   - Or for development setup, run:

     ```bash
     npm run dev
     ```

## Usage

After installation, the API server runs on `http://localhost:3000` by default. This port can be changed in the configuration file.

Test the API using tools like Postman or cURL.

The API documentation is accessible via Swagger UI at the `/api-docs` endpoint, providing an interactive interface for exploring and testing the available endpoints.

## Running with Docker

To run the API using Docker Compose, you first need to ensure Docker and Docker Compose are installed on your system.

1. **Build and Run Container:**

   There is a `docker-compose.yml` file in the root directory of the project

   You can build Dockerfile or docker compose will build that automatically.

2. **Start and Stop the Service:**

   To start the service in the background (detached mode), run:

   ```bash
   docker-compose up -d
   ```

## API Endpoints

### Base URL

http://localhost:3000/api

### Endpoints

- **Retrieve All Weather Records**

  - **URL:** `/weather`
  - **Method:** `GET`
  - **Description:** Retrieves a list of all stored weather records.

- **Create a New Weather Record**

  - **URL:** `/weather`
  - **Method:** `POST`
  - **Description:** Creates a new weather record for a specified city and country.
  - **Request Body Example:**

    ```json
    {
      "cityName": "London",
      "country": "UK"
    }
    ```

- **Retrieve a Specific Weather Record by ID**

  - **URL:** `/weather/{id}`
  - **Method:** `GET`
  - **Description:** Retrieves a specific weather record by its ID.

- **Update a Specific Weather Record by ID**

  - **URL:** `/weather/{id}`
  - **Method:** `PUT`
  - **Description:** Updates an existing weather record by its ID.
  - **Request Body Example:**

    ```json
    {
      "cityName": "London",
      "country": "UK",
      "lon": -0.1257,
      "lat": 51.5085,
      "temperature": 15.6,
      "feelsLike": 13.5,
      "pressure": 1012,
      "humidity": 81,
      "windSpeed": 4.1,
      "windDeg": 250,
      "description": "Light rain",
      "visibility": 10000,
      "cloudiness": 90,
      "units": "metric"
    }
    ```

- **Delete a Specific Weather Record by ID**

  - **URL:** `/weather/{id}`
  - **Method:** `DELETE`
  - **Description:** Deletes a specific weather record by its ID.

- **Retrieve Latest Weather Record for a City**
  - **URL:** `/weather/latest/{cityName}`
  - **Method:** `GET`
  - **Description:** Retrieves the latest weather record for the specified city.

## Configuration

Create a `.env` file in the root directory with the following content:

```plaintext
API_KEY=your_api_key_here
PORT=3000
```

Replace `your_api_key_here` with your actual API key obtained from the weather data provider.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-foo`).
3. Commit your changes (`git commit -m 'Add foo feature'`).
4. Push to the branch (`git push origin feature-foo`).
5. Open a Pull Request.

Ensure your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For questions or feedback, feel free to reach out:

- Mahdi [work.taleghani@gmail.com](mailto:work.taleghani@gmail.com)
- GitHub: [github.com/mmte](https://github.com/mmte)
