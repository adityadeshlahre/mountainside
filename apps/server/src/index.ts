import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { User, UserSchema } from "@repo/types";
import { prisma } from "@repo/db";

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
