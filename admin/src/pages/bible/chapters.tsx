import CirculaProgress from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Chapters() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookName = searchParams.get("book");
  const chapter = searchParams.get("chapter") || 1;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["books"],
    queryFn: () =>
      _axios.get(`/api/bible/chapter?chapter=${chapter}&book=${bookName}`),
  });

  useEffect(() => {
    refetch();
    return () => {};
  }, [chapter]);

  if (isLoading) return <CirculaProgress />;

  if (isError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Error</p>
      </div>
    );

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <div className='flex flex-col gap-2 items-start'>
        <div className='flex justify-center items-center gap-2'>
          <ChevronLeft
            onClick={() => navigate("/layout/bible")}
            className='cursor-pointer'
          />
          <h1 className='text-lg font-semibold md:text-2xl'>
            {bookName} - {chapter}
          </h1>
        </div>
        <p className='text-xs font-500 text-slate-400'>
          All Chapters from {bookName} - {data?.data?.data?.chapter_count}
          chapters
        </p>
      </div>

      <div className='flex'>
        <div className='h-[calc(100vh-200px)] overflow-y-scroll w-[30%]'>
          <div className='flex flex-wrap gap-4'>
            {Array.from({ length: data?.data?.data?.chapter_count }).map(
              (_, index) => (
                <Badge
                  key={index}
                  onClick={() => {
                    if (index + 1 == chapter) {
                      return;
                    }

                    navigate(
                      `/layout/bible?type=books&book=${bookName}&chapter=${
                        index + 1
                      }`
                    );
                  }}
                  className={`w-10 h-10 rounded-md bg-[#1b1b1b] cursor-pointer group-hover:bg-slate-100 group-hover:text-slate-900 text-white font-bold text-xs flex hover:bg-slate-900 items-center justify-center ${
                    index + 1 == chapter
                      ? "bg-white text-black hover:bg-white border-2 border-slate-900"
                      : ""
                  }`}>
                  {index + 1}
                </Badge>
              )
            )}
          </div>
        </div>

        <div className='h-[calc(100vh-200px)] w-[70%]  overflow-scroll'>
          <div className='flex flex-col gap-4 p-4'>
            <>
              {data?.data?.data?.verses &&
                data?.data?.data?.verses.map((verse: any) => (
                  <p key={verse.verse}>
                    {verse.versecount} . {verse.verse}
                  </p>
                ))}
            </>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Chapters;
