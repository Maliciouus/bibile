import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dailymanna from "/assets/Homepage/indryamanna.svg";
import { _axios } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { CircularProgressIndicator } from "@/components/LoadingIndicator";

const PublishBooksList = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    // refetch: refetchnames,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["publishbooknames"],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/publishedbooks/getall?page=${pageParam}&limit=15`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 15 ? nextPage : undefined;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );

  return (
    <>
      <Navbar />
      <main className='bg-[#0B0C0D] '>
        {/* Header Section */}
        <div className='flex justify-between'>
          <div className='px-2 md:px-6 pt-3'>
            <Button
              onClick={() => navigate(-1)}
              className='bg-[#EBB34A] hover:bg-[#EBB34A]/90'
              size='icon'>
              <ArrowLeft className='text-[#0B0C0D]' />
            </Button>
          </div>
          <h1 className='text-[#EBB34A] font-california text-lg text-center py-3 md:text-2xl'>
            Published Books
          </h1>
          <div></div>
        </div>

        <div className='h-[calc(100vh-131px)] px-3 container mx-auto py-5 galleryscroll overflow-y-scroll '>
          <div className=' grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            {data?.pages?.map((page) =>
              page?.data?.map((book: any) => (
                <div
                  onClick={() =>
                    navigate(`/publishedbooks?type=viewbook&BookId=${book?.id}`)
                  }
                  key={book?.id}
                  className='relative cursor-pointer  group'>
                  <div className='flex flex-col justify-center items-center'>
                    <img
                      src={dailymanna}
                      alt='Daily Manna'
                      className='w-full h-auto object-cover'
                    />
                    <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-[#FFFFFF] py-2'>
                      <p className='text-center font-rethink text-xs md:text-lg px-2 break-words line-clamp-2'>
                        {book?.booktitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

export default PublishBooksList;
