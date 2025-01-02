import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from "typeorm";
import { IsNotEmpty, IsString, IsNumber, Min, Max } from "class-validator";

@Entity()
export class Weather {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  cityName: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  country: string;

  @Column("float")
  @IsNumber()
  temperature: number;

  @Column()
  @IsString()
  description: string;

  @Column()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @Column("float")
  @IsNumber()
  @Min(0)
  windSpeed: number;

  @Column()
  fetchedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
