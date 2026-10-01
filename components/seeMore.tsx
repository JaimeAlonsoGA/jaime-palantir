import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import { cn } from "@/lib/utils";

export const SeeMore = ({
  href,
  label,
  gradient = "from-yellow-500 to-red-500",
}: {
  href: string;
  label: string;
  gradient?: string;
}) => {
  const button =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors bg-zinc-900 group-hover:bg-zinc-800 text-zinc-50 shadow h-9 rounded-md px-3 text-sm";
  return (
    <div className={cn("group bg-gradient-to-r p-0.5 rounded-md hover:bg-gradient-to-l transition-colors duration-300", gradient)}>
      <Link href={href} className={button}>
        {label}
        <IoIosArrowRoundForward className="h-4 w-4" />
      </Link>
    </div>
  );
};
