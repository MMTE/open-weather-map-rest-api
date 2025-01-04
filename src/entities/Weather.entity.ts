import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsString, IsNumber, IsOptional, Min, Max } from "class-validator";
import { Transform } from "class-transformer";

@Entity("weather")
export class WeatherEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  @IsString()
  cityName: string | null;

  @Column({ type: "text" })
  @IsString()
  country: string | null;

  @Column("decimal", { precision: 7, scale: 3 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  lon: number | null;

  @Column("decimal", { precision: 7, scale: 3 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  lat: number | null;

  @Column("decimal", { precision: 5, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  temperature: number | null;

  @Column("decimal", { precision: 5, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  feelsLike: number | null;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null), {
    toClassOnly: true,
  })
  tempMin: number | null;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null), {
    toClassOnly: true,
  })
  tempMax: number | null;

  @Column("decimal", { precision: 6, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  pressure: number | null;

  @Column("decimal", { precision: 5, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  humidity: number | null;

  @Column("decimal", { precision: 5, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  windSpeed: number | null;

  @Column("decimal", { precision: 5, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  windDeg: number | null;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null), {
    toClassOnly: true,
  })
  windGust: number | null;

  @Column({ type: "text", nullable: true })
  @IsString()
  description: string | null;

  @Column("decimal", { precision: 7, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  visibility: number | null;

  @Column("decimal", { precision: 5, scale: 2 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  cloudiness: number | null;

  @Column("decimal", { precision: 6, scale: 2, default: 0 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  rainVolume: number | null;

  @Column("decimal", { precision: 6, scale: 2, default: 0 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  snowVolume: number | null;

  @Column({ type: "text", default: "metric" })
  @IsString()
  units: string;

  @Column({ type: "timestamp" })
  fetchedAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
