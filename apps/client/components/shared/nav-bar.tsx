import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900">
      <Link href="/">
        <div className="text-lg font-bold">
          AI Companion
        </div>
      </Link>
      <div>
        <UserButton />
      </div>
    </nav>
  );
};

export default NavBar; 