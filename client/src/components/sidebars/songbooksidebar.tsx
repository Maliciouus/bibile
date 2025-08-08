import { _axios } from "@/lib/axios";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import biblelogo from "/assets/Homepage/biblelogo.svg";
import { CircularProgressIndicator } from "../LoadingIndicator";
import { MainIcons } from "../StaticLinks/MainIcons";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { agaravaisai } from "@/lib/அகரவரிசை";
export default function SongBookSideBar({ onSongBookSelect = () => {} }: any) {
  const getType: any = useParams();
  const [search, setSearch] = useState<any>("");
  const navigate = useNavigate();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tamil, setTamil] = useState<any>(localStorage.getItem("tamil") || "");
  const [open, setOpen] = useState(false);
  const handleInputClick = () => {
    setIsReadOnly(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const {
    data: songbooks,
    isLoading: songbooksLoading,
    isError: songbooksError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["songbooks", search, tamil],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/songbook?page=${pageParam}&limit=500&search=${search}&tamilLetter=${tamil}`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 500 ? nextPage : undefined;
    },
  });

  if (songbooksError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  const [selectedSongbook, setSelectedSongbook] = useState<any>(
    localStorage.getItem("songBookId") || 22
  );

  useEffect(() => {
    localStorage.setItem("songBookId", selectedSongbook);
  });

  return (
    <>
      <main className='bg-[#1B1B1B] pb-2'>
        <div
          onClick={() => (window.location.href = "/")}
          className='flex cursor-pointer p-2 gap-2 items-center'>
          <img src={biblelogo} className='w-12' alt='' />
          <div className=' text-[#EBB34A] text-base  md:text-lg font-bold font-california'>
            THE LAST VOICE MINISTRY
          </div>
        </div>
        <div className='flex flex-nowrap justify-evenly items-center py-2 px-2'>
          {MainIcons?.map((icon: any, idx: any) => (
            <div
              onClick={() => {
                navigate(icon.route);
                // setSearch("");
                // useSearchStore.setState({
                //   currentKeyWord: "",
                // });
              }}
              key={idx}
              className={`border-[1px] cursor-pointer  hover:bg-white border-[#EBB34A] p-1 lg:p-2 rounded-sm ${
                icon.type === getType.type ? "bg-white" : ""
              }`}>
              <img
                className='h-8 w-8'
                style={{ objectPosition: "center", objectFit: "contain" }}
                src={`/assets/Biblepage/${icon.icon}`}
                alt=''
              />
            </div>
          ))}
        </div>

        <div className='px-3'>
          <div className='flex gap-x-1 justify-between'>
            <div className='flex items-center border border-[#EBB34A] rounded-md px-5 p-2'>
              <Search className='text-[#EBB34A]' />

              <input
                ref={inputRef}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                type='text'
                value={search}
                autoComplete='off'
                name='search'
                id='search'
                placeholder='Search...'
                className='border-none bg-transparent font-readux placeholder:text-[#EBB34A] text-[#EBB34A] w-full focus:outline-none ml-2'
                autoFocus={false}
                readOnly={isReadOnly}
                onClick={handleInputClick}
              />
            </div>
            <div>
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                className='bg-trasnsparent border border-[#EBB34A]'>
                <Icon
                  className='h-6 w-6 text-[#EBB34A]'
                  icon='mage:filter-fill'
                />
              </Button>
            </div>
          </div>
        </div>

        {/* bible section */}
        {getType.type == "songbooks" &&
          (songbooksLoading ? (
            <div className='flex h-[70vh] items-center justify-center'>
              <CircularProgressIndicator />
            </div>
          ) : (
            <>
              <div className='text-[#FFFFFF] py-2 font-readux text-sm md:text-lg text-left px-5 '>
                <div>
                  Total Songbooks : &nbsp;
                  <span className='text-[#EBB34A]'>
                    {/* {(filteredSongbooks && filteredSongbooks.length) || 0} */}
                    {songbooks?.pages?.[0]?.totalCount?.total || 0}
                  </span>
                </div>
              </div>
              {/* <div className='h-[calc(100vh-180px)] md:h-[calc(100vh-240px)] [&::-webkit-scrollbar]:  overflow-y-scroll'> */}
              <div className='h-[66vh] md:h-[calc(100vh-240px)] [&::-webkit-scrollbar]: md:max-w-xs lg:max-w-sm  overflow-y-scroll'>
                <div className='px-1 py-3'>
                  {songbooks?.pages?.map((song: any, idx: any) => (
                    <div key={idx}>
                      {song?.data?.map((songbook: any) => (
                        <p
                          onClick={() => {
                            navigate(
                              `/layout/songbooks?songId=${songbook?.id}`
                            );
                            setSelectedSongbook(songbook?.id);
                            onSongBookSelect();
                          }}
                          key={songbook?.id}
                          style={{ borderRadius: "5px", textAlign: "start" }}
                          className={`border-[1px] p-2 border-[#EBB34A] truncate  text-xs md:text-sm text-[#FFFFFF] cursor-pointer font-nirmala ${
                            selectedSongbook == songbook?.id
                              ? "bg-[#EBB34A] text-[#1B1B1B]"
                              : ""
                          }
                                   `}>
                          {songbook?.name}
                        </p>
                      ))}
                    </div>
                  ))}
                  <Button
                    className='bg-[#EBB34A] my-2  text-[#1B1B1B] font-readux text-sm md:text-lg w-full hover:bg-[#EBB34A] hover:text-[#1B1B1B]'
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}>
                    {isFetchingNextPage
                      ? "Loading more..."
                      : hasNextPage
                      ? "Load More"
                      : "No more songs"}
                  </Button>
                </div>
              </div>
            </>
          ))}
      </main>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className='font-readux bg-[#121212] text-white border-0 focus-visible:ring-transparent
                                        w-full max-w-[95vw] h-[400px] overflow-scroll scrollbar-hide  md:max-w-[900px] p-6'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold'>
              Song Filter
            </DialogTitle>
          </DialogHeader>
          <div className='w-full flex justify-end'>
            <Button
              onClick={() => {
                setTamil("");
                localStorage.removeItem("tamil");
                setOpen(false);
              }}
              className='bg-[#EBB34A] text-[#121212] font-bold py-2 px-6 md:px-8 text-lg rounded-md hover:bg-[#E0A838] transition-all duration-200'>
              Clear Filter
            </Button>
          </div>
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4'>
            {agaravaisai?.map((letter: any, idx: any) => (
              <Button
                onClick={() => {
                  setTamil(letter);
                  setOpen(false);
                  localStorage.setItem("tamil", letter);
                }}
                key={idx}
                className='bg-transparent font-nirmala text-lg px-3 py-3 md:px-4 md:py-5 text-white border-[#ECB349] hover:bg-[#ECB349] hover:text-[#121212] transition-colors duration-200'
                variant='outline'>
                {letter}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
