import bkash from "@/assets/bkash.webp.asset.json";
import nagad from "@/assets/nagad.jpg.asset.json";

export const PAY_METHODS = [
  { id: "bkash" as const, name: "বিকাশ", logo: bkash.url },
  { id: "nagad" as const, name: "নগদ", logo: nagad.url },
];

export const payLogo = (m: "bkash" | "nagad") => (m === "bkash" ? bkash.url : nagad.url);
