import { User, UserSchema } from "@repo/types/";
import axios from "axios";
import { useState } from "react";
import { SERVER_URL } from "../utils/base";

const Form = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = UserSchema.safeParse({ name, email, password });

    if (!result.success) {
      console.error(result.error.errors);
      return;
    }

    const user: User = result.data;

    axios
      .post(`${SERVER_URL}/user`, {
        name: user.name,
        email: user.email,
        password: user.password,
      })
      .then(() => {
        console.log(user);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        className="border-2 border-neutral-900"
        type="text"
        value={name}
        placeholder="name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border-2 border-neutral-900"
        type="email"
        value={email}
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border-2 border-neutral-900"
        type="password"
        value={password}
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
