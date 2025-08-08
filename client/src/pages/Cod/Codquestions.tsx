import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import Navbar from "@/components/Navbar/Navbar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { _axios } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Codsubtopic from "./Codsubtopic";
import { useState } from "react";
const Codquestions = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  const subheading = searchParams.get("subheading");
  const QuestionId = params.id;
  const navigate = useNavigate();
  const [search, setSearch] = useState<any>("");

  if (subheading === "1") {
    return <Codsubtopic />;
  }

  const {
    data,
    isLoading,
    // refetch: refetchnames,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery<any>({
    queryKey: ["codQuestions", search],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/cod/questions/${QuestionId}?page=${pageParam}&limit=20&search=${search}`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 20 ? nextPage : undefined;
    },
  });

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
        <div className='flex justify-center  md:justify-end w-full px-5 py-2'>
          <div className='flex items-center border border-[#EBB34A] rounded-full px-5 p-2'>
            <Search className='text-[#EBB34A]' />
            <input
              onChange={(e) => setSearch(e.target.value)}
              type='text'
              value={search}
              placeholder='Search...'
              className='border-none  bg-transparent font-readux placeholder:text-[#EBB34A] text-[#EBB34A] w-full focus:outline-none ml-2'
            />
          </div>
        </div>

        <div className='px-5 md:px-10 h-[calc(100vh-180px)] galleryscroll  overflow-y-scroll py-5'>
          {isLoading && (
            <div className='flex justify-center py-10'>
              <CircularProgressIndicator />
            </div>
          )}
          {!isLoading && data?.pages?.[0]?.data?.length === 0 && (
            <div className='text-center text-[#EBB34A] py-10'>
              No Data Found
            </div>
          )}
          {data?.pages?.map((page) =>
            page?.data?.map((question: any) => (
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
          )}
          {hasNextPage && (
            <div className='flex py-2 justify-center'>
              <Button
                className='bg-[#EBB34A] hover:bg-[#EBB34A]/90 text-[#0B0C0D]'
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}>
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                  ? "Load More"
                  : "No more books"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Codquestions;
