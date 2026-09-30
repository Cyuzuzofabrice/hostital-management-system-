import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "link";
};

const styles = {
  primary: "rounded bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b5f58]",
  secondary: "rounded border border-[#c9d1ce] bg-white px-4 py-2 text-sm hover:bg-[#eef1ef]",
  link: "text-sm text-[#0f766e] underline underline-offset-2",
};

export default function Button({ variant = "primary", className = "", ...rest }: Props) {
  return <button className={`${styles[variant]} ${className}`} {...rest} />;
}