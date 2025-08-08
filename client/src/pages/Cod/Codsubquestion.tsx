import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import Navbar from "@/components/Navbar/Navbar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Codsubquestion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  let title = searchParams.get("title");
  let subquestionId = searchParams.get("subquestionId");
  let id = searchParams.get("id");

  const {
    data: codsubQuestions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["codsubQuestions"],
    queryFn: () =>
      _axios.get(`/api/cod/getSubtopicQuestions/${subquestionId}/${id}`),
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
        <div className=''>
          <div className='px-2 md:px-6 pt-3'>
            <Button
              onClick={() => navigate(-1)}
              className='bg-[#EBB34A] hover:bg-[#EBB34A]/90'
              size='icon'>
              <ArrowLeft className='text-[#0B0C0D]' />
            </Button>
          </div>
          <div className='py-4 text-base md:text-xl font-nirmala text-center text-[#FFFFFF]'>
            <h1>{title || "கேள்விகளும் பதில்களும் COD"}</h1>
          </div>
        </div>
        <div className='px-5 md:px-10 h-[calc(100vh-200px)] galleryscroll overflow-y-scroll py-5'>
          {codsubQuestions?.data?.data?.length > 0 ? (
            codsubQuestions?.data?.data?.map((question: any) => (
              <Alert
                key={question?.id}
                onClick={() => {
                  navigate(
                    `/codpage/answer?title=${question?.title}&topicid=${question?.topicid}&id=${question?.id}&subTopicId=${question?.subTopicId}`
                  );
                }}
                className='cursor-pointer text-xs md:text-base mb-3 border-none hover:bg-[#EBB34A] transition-all duration-300'>
                <div className='font-nirmala'>{question?.title}</div>
              </Alert>
            ))
          ) : (
            <p className='text-[#FFFFFF] font-nirmala text-center'>
              கேள்விகள் இல்லை
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default Codsubquestion;
