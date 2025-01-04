import router from "./routes/weatherRoutes";
import * as express from 'express';
import * as cors from "cors";
import {errorHandler} from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/api", router);
app.use(errorHandler);

export default app;
