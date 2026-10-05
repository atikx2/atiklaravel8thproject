
export const PAY_METHODS = [
  { id: "bkash" as const, name: "বিকাশ", logo: "/images/bkash.webp" },
  { id: "nagad" as const, name: "নগদ", logo: "/images/nagad.jpg" },
];

export const payLogo = (m: "bkash" | "nagad") => (m === "bkash" ? "/images/bkash.webp" : "/images/nagad.jpg");
