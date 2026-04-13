import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import Debug from "debug";
import apiRouter from "./routes/index.js";
import errorHandler from "./config/errorHandler.js";
import { initSocket } from "./lib/socket.js";
import admin from "firebase-admin";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initFirebaseAdmin = () => {
  if (process.env.FIREBASE_DISABLED === "true") {
    console.warn(
      "Firebase Admin disabled (FIREBASE_DISABLED=true). Google auth endpoints will not work.",
    );
    return;
  }
  if (admin.apps?.length) return;

  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch {
      console.warn(
        "Invalid FIREBASE_SERVICE_ACCOUNT_JSON. Firebase Admin not initialized.",
      );
      return;
    }
  } else {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(__dirname, "..", "serviceAccountKey.json");

    if (fs.existsSync(serviceAccountPath)) {
      try {
        serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, "utf8"),
        );
      } catch {
        console.warn(
          `Could not read Firebase service account from ${serviceAccountPath}. Firebase Admin not initialized.`,
        );
        return;
      }
    } else {
      console.warn(
        `Firebase service account not found at ${serviceAccountPath}. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_DISABLED=true).`,
      );
      return;
    }
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.warn("Failed to initialize Firebase Admin:", err);
  }
};

initFirebaseAdmin();

const debug = Debug("server:server");
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 8080;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL];
console.log(process.env.CLIENT_URL);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        (process.env.CLIENT_URL &&
          origin.startsWith(process.env.CLIENT_URL.replace(/\/$/, "")))
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  }),
);
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

const server = http.createServer(app);
initSocket(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
