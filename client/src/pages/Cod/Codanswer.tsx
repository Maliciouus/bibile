import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Codanswer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  const topicid = searchParams.get("topicid");
  const id = searchParams.get("id");
  const subTopicId = searchParams.get("subTopicId");

  const {
    data: answer,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["answer"],
    queryFn: () =>
      _axios.get(
        `/api/cod/answer?topicid=${topicid}&id=${id}&subTopicId=${subTopicId}`
      ),
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
  const renderParagraphs = (htmlContent: string) => {
    return htmlContent
      .split("<p>")
      .map((paragraph: string, index: number) => (
        <div
          key={index}
          className='my-4'
          dangerouslySetInnerHTML={{ __html: `<p>${paragraph}` }}
        />
      ));
  };
  return (
    <>
      <Navbar />
      <main className=' bg-[#0B0C0D]'>
        <div className=''>
          <div className='px-2 md:px-6 pt-3'>
            <Button
              onClick={() => navigate(-1)}
              className='bg-[#EBB34A] text-[200px] hover:bg-[#EBB34A]/90'
              size='icon'>
              <ArrowLeft className='text-[#0B0C0D]' />
            </Button>
          </div>
          <div className='py-4 text-xs md:text-xl font-nirmala text-center text-[#FFFFFF]'>
            <h1>{title || "கேள்விகளும் பதில்களும் COD"}</h1>
          </div>
        </div>

        <div className='px-5 md:px-10 h-[calc(100vh-200px)] text-white overflow-y-scroll galleryscroll py-5'>
          {answer?.data?.data?.length > 0 ? (
            <div className='text-white font-nirmala text-xs md:text-base'>
              {renderParagraphs(answer?.data?.data?.[0]?.content)}
            </div>
          ) : (
            <p className='text-white text-center font-nirmala text-xs md:text-base'>
              {" "}
              விடைகள் இல்லை
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default Codanswer;
