import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { User, UserSchema } from "@repo/types";
import { prisma } from "@repo/db";
import { updload } from "./multer/multer.middleware";
import { uploadOnCloudinary } from "./utils/cloudinary";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

app.get(
  "/",
  async (req: express.Request, res: express.Response): Promise<void> => {
    res.status(200).send({ message: "Hello World!" });
    return;
  }
);

app.post(
  "/user",
  async (req: express.Request, res: express.Response): Promise<void> => {
    const parsed = UserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }

    const { name, email, password } = parsed.data;

    try {
      const newUser = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: password,
        },
      });

      res.status(201).json({ user: newUser });
      return;
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the user." });
      return;
    }
  }
);

app.get("/users", async (req: express.Request, res: express.Response) => {
  try {
    const users: User[] = await prisma.user.findMany();

    res.status(201).json({ users });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Fething user error" });
    return;
  }
});

app.post(
  "/api/savevideo",
  updload.single("file"),
  async (req: express.Request, res: express.Response) => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No file received" });
        return;
      }

      res.status(200).json({
        message: "Video saved successfully",
        filename: file.filename,
        path: file.path,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error saving video" });
    }
  }
);

app.post(
  "/api/upload",
  async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      const { sessionId } = req.body;
      console.log("sessionId", sessionId);

      if (!sessionId) {
        return res.status(400).json({ error: "Missing sessionId" });
      }

      const videoDir = path.join(__dirname, "./videos/");
      const files = fs.readdirSync(videoDir);

      const sessionChunks = files.filter((file) =>
        file.includes(`chunk-${sessionId}`)
      );

      if (sessionChunks.length === 0) {
        return res
          .status(404)
          .json({ error: "No chunks found for this session" });
      }

      const results = [];

      const uploadPromises = sessionChunks.map(async (filename) => {
        const fullPath = path.join(videoDir, filename);
        if (!fs.existsSync(fullPath)) {
          console.warn(`File does not exist: ${fullPath}`);
          return null;
        }
        const uploadResult = await uploadOnCloudinary(fullPath, sessionId);
        return { filename, uploadResult };
      });

      const uploadResults = await Promise.all(uploadPromises);
      results.push(...uploadResults.filter((result) => result !== null));

      res.status(200).json({
        message: "File uploaded successfully",
        cloudinary: results,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error uploading file" });
    }
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// race condition fix needed but working for now
