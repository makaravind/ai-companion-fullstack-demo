import { UserButton } from "@clerk/nextjs";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900">
      <div className="text-lg font-bold">
        AI Companion
      </div>
      <div>
        <UserButton />
      </div>
    </nav>
  );
};

export default NavBar; 