import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Codsubtopic = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const {
    data: codsubtopics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["codsubtopics"],
    queryFn: () => _axios.get(`/api/cod/getSubtopics/${id}`),
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
        <div className='px-2 md:px-6 pt-3'>
          <Button
            onClick={() => navigate(-1)}
            className='bg-[#EBB34A] hover:bg-[#EBB34A]/90'
            size='icon'>
            <ArrowLeft className='text-[#0B0C0D]' />
          </Button>
        </div>
        <div className='py-4 text-lg md:text-2xl font-nirmala text-center text-[#FFFFFF]'>
          <h1>COD SUB TOPICS</h1>
        </div>
        <div className='h-[calc(100vh-200px)] overflow-y-scroll galleryscroll '>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-3 md:px-10 py-5 md:py-20'>
            {codsubtopics?.data?.data?.length > 0 ? (
              codsubtopics?.data?.data?.map((cod: any) => (
                <Card
                  onClick={() => {
                    navigate(
                      `/codpage/${cod?.id}/${cod?.topicid}?title=${cod?.subtopicid}&subquestionId=${cod?.id}&id=${cod?.topicid}`
                    );
                  }}
                  className='cursor-pointer border-none hover:bg-[#EBB34A] transition-all duration-300'
                  key={cod?.id}>
                  <CardHeader>
                    <div className='font-nirmala'>{cod?.subtopicid}</div>
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

export default Codsubtopic;
