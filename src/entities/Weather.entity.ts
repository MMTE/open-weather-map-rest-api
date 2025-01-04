import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import {IsString, IsNumber} from "class-validator";

@Entity("weather")
export class WeatherEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "text"})
    cityName: string | null;

    @Column({type: "text"})
    @IsString()
    country: string | null;

    @Column("decimal", {precision: 7, scale: 3})
    lon: number | null;

    @Column("decimal", {precision: 7, scale: 3})
    lat: number | null;

    @Column("decimal", {precision: 5, scale: 2})
    temperature: number | null;

    @Column("decimal", {precision: 5, scale: 2})
    feelsLike: number | null;

    @Column("decimal", {precision: 5, scale: 2, nullable: true})
    tempMin: number | null;

    @Column("decimal", {precision: 5, scale: 2, nullable: true})
    tempMax: number | null;

    @Column("decimal", {precision: 6, scale: 2})
    pressure: number | null;

    @Column("decimal", {precision: 5, scale: 2})
    humidity: number | null;

    @Column("decimal", {precision: 5, scale: 2})
    windSpeed: number | null;

    @Column("decimal", {precision: 5, scale: 2})
    windDeg: number | null;

    @Column("decimal", {precision: 5, scale: 2, nullable: true})
    windGust: number | null;

    @Column({type: "text", nullable: true})
    @IsString()
    description: string | null;

    @Column("decimal", {precision: 7, scale: 2})
    visibility: number | null;

    @Column("decimal", {precision: 5, scale: 2})
    cloudiness: number | null;

    @Column("decimal", {precision: 6, scale: 2, default: 0})
    rainVolume: number | null;

    @Column("decimal", {precision: 6, scale: 2, default: 0})
    snowVolume: number | null;

    @Column({type: "text", default: "metric"})
    units: string;

    @Column({type: "timestamp"})
    fetchedAt: Date;

    @CreateDateColumn({type: "timestamp"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedAt: Date;
}
