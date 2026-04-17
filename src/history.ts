import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

interface HistoryEntry {
  date: string;
  items: string[];
}

interface HistoryData {
  words: HistoryEntry[];
  idioms: HistoryEntry[];
}

interface TodayData {
  date: string;
  words: string[];
  idioms: string[];
}

function getUserDataDir(userName: string): string {
  const dir = join(import.meta.dirname, "..", "data", userName);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getPaths(userName: string): { history: string; today: string } {
  const dir = getUserDataDir(userName);
  const historyPath = join(dir, "history.json");
  const todayPath = join(dir, "today.json");

  if (!existsSync(historyPath)) {
    writeFileSync(historyPath, JSON.stringify({ words: [], idioms: [] }, null, 2));
  }
  if (!existsSync(todayPath)) {
    writeFileSync(
      todayPath,
      JSON.stringify({ date: "", words: [], idioms: [] }, null, 2)
    );
  }

  return { history: historyPath, today: todayPath };
}

export function getUsedItems(userName: string): { words: string[]; idioms: string[] } {
  const { history } = getPaths(userName);
  const data: HistoryData = JSON.parse(readFileSync(history, "utf-8"));
  return {
    words: data.words.flatMap((e) => e.items),
    idioms: data.idioms.flatMap((e) => e.items),
  };
}

export function saveWords(userName: string, date: string, words: string[]): void {
  const { history, today: todayPath } = getPaths(userName);
  const data: HistoryData = JSON.parse(readFileSync(history, "utf-8"));
  data.words.push({ date, items: words });

  // Keep only last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  data.words = data.words.filter((e) => new Date(e.date) >= cutoff);

  writeFileSync(history, JSON.stringify(data, null, 2));

  // Also save to today.json
  const today = loadToday(userName);
  today.date = date;
  today.words = words;
  writeFileSync(todayPath, JSON.stringify(today, null, 2));
}

export function saveIdioms(userName: string, date: string, idioms: string[]): void {
  const { history, today: todayPath } = getPaths(userName);
  const data: HistoryData = JSON.parse(readFileSync(history, "utf-8"));
  data.idioms.push({ date, items: idioms });

  // Keep only last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  data.idioms = data.idioms.filter((e) => new Date(e.date) >= cutoff);

  writeFileSync(history, JSON.stringify(data, null, 2));

  // Also save to today.json
  const today = loadToday(userName);
  today.date = date;
  today.idioms = idioms;
  writeFileSync(todayPath, JSON.stringify(today, null, 2));
}

export function loadToday(userName: string): TodayData {
  const { today } = getPaths(userName);
  return JSON.parse(readFileSync(today, "utf-8"));
}

export function getTodayContent(userName: string): {
  words: string[];
  idioms: string[];
} {
  const today = loadToday(userName);
  return { words: today.words, idioms: today.idioms };
}
