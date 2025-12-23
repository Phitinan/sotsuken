import 'dotenv/config'; 
import express from 'express';
import spotRouter from './routes/spotRouter.js';
import userRouter from './routes/userRouter.js';
import subtypeRouter from './routes/subtypeRouter.js';
import photoRouter from './routes/photoRouter.js';
import hanabiRouter from "./routes/hanabiRouter.js";
import userReportRouter from "./routes/userReportRouter.js";
import googleRouter from "./routes/googleRouter.js";
import railwayRouter from "./routes/railwayRouter.js";
import { unknownEndpoint, errorHandler } from './middleware/customMiddleware.js';
import connectDB from './config/db.js';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


connectDB();

app.use("/api", userReportRouter);
app.use("/api/spots", spotRouter);
app.use("/api/spots", photoRouter);
app.use("/api/subtypes", subtypeRouter);
app.use("/api/goog", googleRouter);
app.use("/api/users", userRouter);
app.use("/api/hanabi", hanabiRouter);
app.use("/api", railwayRouter);


app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
