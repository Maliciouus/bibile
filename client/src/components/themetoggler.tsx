import { useTheme } from "@/components/Themeprovider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          {isDarkTheme ? (
            <Moon className='icon h-4 w-4 md:h-6 md:w-6' />
          ) : (
            <Sun className='icon h-4 w-4 md:h-6 md:w-6' />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
