import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Book, CircleUser } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function SubRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logout Successful");
    window.location.href = "/";
  };

  useEffect(() => {
    if (!localStorage.getItem("isLogin")) {
      window.location.href = "/";
    }
  }, []);

  return (
    <>
      <div className='grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
        <div className='hidden border-r bg-muted/40 md:block'>
          <div className='flex h-full max-h-screen flex-col gap-2'>
            <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
              <Link
                to='/dashboard'
                className='flex items-center gap-2 font-semibold'>
                <Book className='h-6 w-6' />
                <span className=''>Admin</span>
              </Link>
              <Button variant='outline' size='icon' className='ml-auto h-8 w-8'>
                <Bell className='h-4 w-4' />
                <span className='sr-only'>Toggle notifications</span>
              </Button>
            </div>
            <div className='flex-1'>
              <Sidebar />
            </div>
          </div>
        </div>
        <div className='flex flex-col'>
          <header className='flex h-14 items-center justify-end gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
            {/* <div className='w-full flex-1'>
              <form>
                <div className='relative'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='search'
                    placeholder='Search in Bible...'
                    className='w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3'
                  />
                </div>
              </form>
            </div> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='secondary'
                  size='icon'
                  className='rounded-full'>
                  <CircleUser className='h-5 w-5' />
                  <span className='sr-only'>Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={() => setOpen(true)}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to logout?
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </header>
          {children}
        </div>
      </div>
    </>
  );
}
