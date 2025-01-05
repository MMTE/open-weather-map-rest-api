import router from "./routes/weatherRoutes";
import express, {Application} from 'express';
import cors from "cors";
import {errorHandler} from './middleware/error.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.json';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", router);
app.use(errorHandler);

export default app;
