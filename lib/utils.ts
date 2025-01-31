import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const toSlug = (text: string) => {
  return text.toLowerCase().replace(/ /g, "-");
};

export const toTitleCase = (text: string) => {
  text = text.trim();

  if (text.includes("-")) {
    text = text.replace(/-/g, " ");
  }

  return text
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
