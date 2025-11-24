import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "airdrop_users.json");

type User = {
  wallet: string;
  email: string;
  telegram: string;
  chat_id?: string;
};

export function loadUsers(): User[] {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

export function saveUser(user: User) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.wallet === user.wallet);
  if (idx >= 0) users[idx] = { ...users[idx], ...user };
  else users.push(user);
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

export function getUser(wallet: string): User | undefined {
  return loadUsers().find((u) => u.wallet === wallet);
}
