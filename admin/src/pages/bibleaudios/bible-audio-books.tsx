import CirculaProgress from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
const BibleAudioBooks = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books"],
    queryFn: () => _axios.get("/api/bible/books"),
  });

  if (isLoading) return <CirculaProgress />;
  if (isError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <div className='flex flex-col gap-2 items-start'>
        <h1 className='text-lg font-semibold md:text-2xl'>Bible Audios</h1>
        <p className='text-xs font-500 text-slate-400'>
          All Chapters and books in the bible with audio
        </p>
      </div>

      <div className=' h-[calc(100vh-200px)] overflow-y-scroll grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
        {data &&
          data.data &&
          data.data.data.length > 0 &&
          data.data.data.map((book: any, idx: any) => (
            <Card
              className='w-full cursor-pointer hover:bg-slate-900 hover:transition-colors hover:duration-[0.8s] hover:text-white group'
              key={idx}
              onClick={() => {
                navigate(
                  `/layout/_bible-audio/?type=bibleaudios&book=${book.title}`
                );
              }}>
              <CardHeader>
                <Badge
                  className='w-10 h-10 rounded-full bg-[#1b1b1b] group-hover:bg-slate-100 group-hover:text-slate-900 text-white font-bold text-xs flex hover:bg-slate-900 items-center justify-center'
                  variant='secondary'>
                  {book.chapter_count}
                </Badge>
                <h3 className='text-lg font-semibold  text-slate-600 group-hover:text-white'>
                  {book.title}
                </h3>
              </CardHeader>
            </Card>
          ))}
      </div>
    </main>
  );
};

export default BibleAudioBooks;
