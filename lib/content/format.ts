import type { Experience } from "./schema";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(value: string) {
  const [year, month] = value.split("-");
  return `${months[Number(month) - 1]} ${year}`;
}

export function period(job: Pick<Experience, "start" | "end">) {
  return `${formatMonth(job.start)} - ${job.end ? formatMonth(job.end) : "Present"}`;
}

// ISO 639-1 codes for compact language labels; unknown names fall back to their first letters.
const languageCodes: Record<string, string> = {
  spanish: "ES",
  english: "EN",
  french: "FR",
  german: "DE",
  italian: "IT",
  portuguese: "PT",
};

export function languageCode(name: string) {
  return languageCodes[name.toLowerCase()] ?? name.slice(0, 2).toUpperCase();
}

export function city(location: string) {
  return location.split(",")[0].trim();
}
