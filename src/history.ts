import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", "data");
const HISTORY_PATH = join(DATA_DIR, "history.json");
const TODAY_PATH = join(DATA_DIR, "today.json");

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

export function getUsedItems(): { words: string[]; idioms: string[] } {
  const data: HistoryData = JSON.parse(readFileSync(HISTORY_PATH, "utf-8"));
  return {
    words: data.words.flatMap((e) => e.items),
    idioms: data.idioms.flatMap((e) => e.items),
  };
}

export function saveWords(date: string, words: string[]): void {
  const data: HistoryData = JSON.parse(readFileSync(HISTORY_PATH, "utf-8"));
  data.words.push({ date, items: words });

  // Keep only last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  data.words = data.words.filter((e) => new Date(e.date) >= cutoff);

  writeFileSync(HISTORY_PATH, JSON.stringify(data, null, 2));

  // Also save to today.json
  const today = loadToday();
  today.date = date;
  today.words = words;
  writeFileSync(TODAY_PATH, JSON.stringify(today, null, 2));
}

export function saveIdioms(date: string, idioms: string[]): void {
  const data: HistoryData = JSON.parse(readFileSync(HISTORY_PATH, "utf-8"));
  data.idioms.push({ date, items: idioms });

  // Keep only last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  data.idioms = data.idioms.filter((e) => new Date(e.date) >= cutoff);

  writeFileSync(HISTORY_PATH, JSON.stringify(data, null, 2));

  // Also save to today.json
  const today = loadToday();
  today.date = date;
  today.idioms = idioms;
  writeFileSync(TODAY_PATH, JSON.stringify(today, null, 2));
}

export function loadToday(): TodayData {
  return JSON.parse(readFileSync(TODAY_PATH, "utf-8"));
}

function loadTodayRaw(): string {
  return readFileSync(TODAY_PATH, "utf-8");
}

export function getTodayContent(): { words: string[]; idioms: string[] } {
  const today = loadToday();
  return { words: today.words, idioms: today.idioms };
}
