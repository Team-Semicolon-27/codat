import {prisma} from "@/lib/db"
import hashPassword from "./create"
export default async function handle(req, res) {
  if (req.method === "POST") {
    await loginUserHandler(req, res);
  } else {
    return res.status(405);
  }
}
async function loginUserHandler(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "invalid inputs" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
      },
    });
    if (user && user.password === hashPassword(password)) {
      return res.status(200).json(exclude(user, ["password"]));
    } else {
      return res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    throw new Error(e);
  }
}
function exclude(user, keys) {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}