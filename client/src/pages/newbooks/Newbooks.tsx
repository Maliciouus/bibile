import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInfiniteQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { useEffect } from "react";

const Newbooks = () => {
  const navigate = useNavigate();

  const {
    data: newbooks,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["newbooksss"],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/newbooks/getall?page=${pageParam}&limit=10`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetchedItems = allPages.flatMap(
        (page) => page?.parsedBooks
      ).length;
      const totalItems = lastPage.totalCount?.count;
      return totalFetchedItems < totalItems ? allPages.length + 1 : undefined;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            New Books
          </h1>
          <div></div>
        </div>

        <div className='h-[calc(100vh-132px)] px-3 container mx-auto py-5 galleryscroll overflow-y-scroll'>
          <div className=' flex flex-col gap-3'>
            {newbooks?.pages?.flatMap((page: any) =>
              page?.parsedBooks?.map((book: any) => (
                <Accordion
                  key={book?.id}
                  className='bg-white border-b-0  mb-2   text-black px-4  md:px-10  rounded-sm'
                  type='single'
                  collapsible>
                  <AccordionItem className='border-b-0 mb-3' value='item-1'>
                    <AccordionTrigger className=' text-base md:text-xl font-nirmala font-bold  '>
                      {book?.title}
                    </AccordionTrigger>
                    <AccordionContent className=' text-sm md:text-base font-nirmala'>
                      {book?.subtitles?.map((bookName: any, index: number) => (
                        <div
                          key={index}
                          className='text-[#EBB34A] font-bold mb-1  text-lg font semi bold'>
                          {bookName?.subtitle}
                          {bookName?.books?.map((book: any, index: number) => (
                            <div key={index} className='ml-5 mt-2'>
                              <div
                                key={index}
                                className='text-black font-normal'>
                                {index + 1}.{book?.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
      </main>{" "}
    </>
  );
};

export default Newbooks;
