import { Button } from "@/components/ui/button";

const Nopage = () => {
  return (
    <div className='flex justify-center h-screen bg-[#0B0C0D] items-center'>
      <div>
        <h1 className='text-2xl font-readux text-[#EBB34A] '>
          404: Page Not Found
        </h1>
        <div className='flex justify-center  font-readux mt-5'>
          <Button
            onClick={() => (window.location.href = "/")}
            className='text-[#EBB34A] '>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Nopage;
