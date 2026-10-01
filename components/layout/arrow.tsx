"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";

const Arrow: React.FC<{ isHome: boolean }> = ({
    isHome,
}) => {
    const pathname = usePathname();
    const isProjectDetail = pathname.startsWith("/projects/");

    if (isHome) {
        return <div className="w-6" />;
    }

    return (
        <Link
            href={isProjectDetail ? "/projects" : "/"}
            className="text-white/90 hover:text-white transition-colors duration-300"
            aria-label={isProjectDetail ? "Back to projects" : "Back home"}
        >
            <IoIosArrowRoundBack size={24} />
        </Link>
    );
};

export default Arrow;