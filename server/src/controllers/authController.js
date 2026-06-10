import { createId, db, findUserByEmail, persistDb, publicUser } from "../config/database.js";
import { createUserModel } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPasswordSync, verifyPassword } from "../utils/hashPassword.js";
import { HttpError, sendCreated } from "../utils/http.js";

function issueSession(user) {
  return {
    token: generateToken({ sub: user.id, role: user.role }),
    user: publicUser(user)
  };
}

export function register(req, res) {
  const { name, email, password } = req.body;
  if (findUserByEmail(email)) throw new HttpError(409, "Email is already registered");

  const user = createUserModel({
    id: createId("user"),
    name,
    email,
    passwordHash: hashPasswordSync(password),
    role: "creator"
  });
  db.users.push(user);
  persistDb();

  return sendCreated(res, issueSession(user));
}

export function login(req, res) {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new HttpError(401, "Invalid email or password");
  }

  return res.json(issueSession(user));
}

export function me(req, res) {
  return res.json(req.user);
}
