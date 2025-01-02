import { Request, Response } from "express";

export const getWeather = (req: Request, res: Response) => {
  res.send("GET Weather");
};

export const getWeatherById = (req: Request, res: Response) => {
  res.send("GET Weather by ID");
};

export const createWeather = (req: Request, res: Response) => {
  res.send("POST Weather");
}

export const updateWeather = (req: Request, res: Response) => {
  res.send("PUT Weather");
}

export const deleteWeather = (req: Request, res: Response) => {
  res.send("DELETE Weather");
}   

