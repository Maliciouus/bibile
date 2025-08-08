import { Button } from "@/components/ui/button";
import spbook from "/assets/Homepage/spbook.svg";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { CircularProgressIndicator } from "@/components/LoadingIndicator";

const EnglishSpecialbookList = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    // refetch: refetchnames,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["english-specialbook"],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/english-specialbook/getall?page=${pageParam}&limit=10`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 10 ? nextPage : undefined;
    },
  });

  if (isLoading)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );

  return (
    <>
      {data?.pages?.map((page) =>
        page?.data?.map((book: any) => (
          <Card
            onClick={() => {
              navigate(
                `/specialbooks-english-layout?type=${book?.type}&BookId=${book?.id}`
              );
            }}
            className='bg-transparent cursor-pointer  my-4'
            style={{ border: "2px solid #EBB34A" }}>
            <div className='flex gap-4  md:gap-10 p-3 items-center'>
              <div>
                <img src={spbook} alt='' />
              </div>
              <p className='text-base md:text-xl   text-[#FFFFFF]'>
                {book?.title}
              </p>
            </div>
          </Card>
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
    </>
  );
};

export default EnglishSpecialbookList;
