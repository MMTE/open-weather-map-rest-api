import router from "./routes/weatherRoutes";
import * as express from 'express';
import * as cors from "cors";
import {errorHandler} from './middleware/error.middleware';
import * as Swagger from "./config/swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
Swagger.setupSwagger(app);
app.use("/api", router);
app.use(errorHandler);

export default app;
