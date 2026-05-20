import React from "react";
import Link from "next/link";
import clsx from "clsx";

const variants = {
  gray:           "bg-gray-700 text-white fill-white",
  "gray-subtle":  "bg-gray-200 text-gray-900 fill-gray-900",
  blue:           "bg-blue-700 text-white fill-white",
  "blue-subtle":  "bg-blue-200 text-blue-900 fill-blue-900",
  purple:         "bg-purple-700 text-white fill-white",
  "purple-subtle":"bg-purple-200 text-purple-900 fill-purple-900",
  amber:          "bg-amber-700 text-black fill-black",
  "amber-subtle": "bg-amber-200 text-amber-900 fill-amber-900",
  red:            "bg-red-700 text-white fill-white",
  "red-subtle":   "bg-red-200 text-red-900 fill-red-900",
  pink:           "bg-pink-700 text-white fill-white",
  "pink-subtle":  "bg-pink-300 text-pink-900 fill-pink-900",
  green:          "bg-green-700 text-white fill-white",
  "green-subtle": "bg-green-200 text-green-900 fill-green-900",
  teal:           "bg-teal-700 text-white fill-white",
  "teal-subtle":  "bg-teal-300 text-teal-900 fill-teal-900",
  inverted:       "bg-gray-950 text-gray-100 fill-gray-100",
  trial:          "bg-gradient-to-br from-trial-start to-trial-end text-white fill-white",
  turbo:          "bg-gradient-to-br from-turbo-start to-turbo-end text-white fill-white",
  pill:           "bg-white text-gray-900 fill-gray-900 border border-gray-300",
};

const sizes = {
  sm: "text-[11px] h-5 px-1.5 tracking-[0.2px] gap-[3px]",
  md: "text-[12px] h-6 px-2.5 tracking-normal gap-1",
  lg: "text-[14px] h-8 px-3 tracking-normal gap-1.5",
};

interface BadgeProps {
  children?: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  capitalize?: boolean;
  icon?: React.ReactNode;
  href?: string;
}

function Content({ icon, size, children }: Pick<BadgeProps, 'icon' | 'size' | 'children'>) {
  return (
    <>
      {icon && <span className={`${size}IconContainer`}>{icon}</span>}
      {children}
    </>
  );
}

export function Badge({
  children,
  variant = "gray",
  size = "md",
  capitalize: cap = true,
  icon,
  href,
}: BadgeProps) {
  const base = clsx(
    "inline-flex justify-center items-center shrink-0 rounded-full font-sans font-medium whitespace-nowrap tabular-nums",
    cap && "capitalize",
    variants[variant],
    sizes[size],
  );

  if (href) {
    return (
      <Link className={clsx("!no-underline", base)} href={href}>
        <Content icon={icon} size={size}>{children}</Content>
      </Link>
    );
  }

  return (
    <div className={base}>
      <Content icon={icon} size={size}>{children}</Content>
    </div>
  );
}
