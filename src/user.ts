import { readFileSync } from "fs";
import { join } from "path";

export interface UserProfile {
  name: string;
  explanationLanguage: string;
  translateExamples?: boolean;
  level: string;
  levelDescription: string;
  profile: string;
  interests: string;
  contextHint: string;
  botTokenSecret: string;
  chatIdSecret: string;
  wordsBalance: string;
  idiomsBalance: string;
  greetingMorning: string;
  greetingMidday: string;
  greetingEvening: string;
  greetingClose: string;
  quizIntro: string;
}

export function loadUser(userName?: string): UserProfile {
  const name = userName || process.env.USER_NAME;
  if (!name) {
    throw new Error("USER_NAME env var or userName param required");
  }

  const path = join(import.meta.dirname, "..", "users", `${name}.json`);
  const profile: UserProfile = JSON.parse(readFileSync(path, "utf-8"));
  return profile;
}

export function getUserCredentials(user: UserProfile): {
  botToken: string;
  chatId: string;
} {
  const botToken = process.env[user.botTokenSecret];
  const chatId = process.env[user.chatIdSecret];

  if (!botToken || !chatId) {
    throw new Error(
      `Missing credentials: ${user.botTokenSecret} or ${user.chatIdSecret}`
    );
  }

  return { botToken, chatId };
}
