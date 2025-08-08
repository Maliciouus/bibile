import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import Navbar from "@/components/Navbar/Navbar";
import { Card, CardHeader } from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Codpage = () => {
  const navigate = useNavigate();
  const {
    data: codTitles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cod"],
    queryFn: () => _axios.get("/api/cod/headings"),
  });

  if (isLoading)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );
  if (isError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Error</p>
      </div>
    );

  return (
    <>
      <Navbar />

      <main className=' bg-[#0B0C0D]'>
        <div className='py-4 text-lg md:text-2xl font-nirmala text-center text-[#FFFFFF]'>
          <h1>கேள்விகளும் பதில்களும் COD</h1>
        </div>
        <div className='h-[calc(100vh-150px)] galleryscroll  overflow-y-scroll '>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-3 md:px-10 py-5 md:py-20'>
            {codTitles?.data?.data?.length > 0 ? (
              codTitles?.data?.data?.map((cod: any) => (
                <Card
                  onClick={() =>
                    navigate(
                      `/codpage/${cod?.id}?title=${cod?.title}&subheading=${cod?.hassubheadings}&id=${cod?.id}`
                    )
                  }
                  className='cursor-pointer border-none hover:bg-[#EBB34A] transition-all duration-300'
                  key={cod?.id}>
                  <CardHeader>
                    <div className='font-nirmala'>{cod?.title}</div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <p className='text-[#FFFFFF] font-nirmala text-center'>
                கேள்விகள் இல்லை
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Codpage;
