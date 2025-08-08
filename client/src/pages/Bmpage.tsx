import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import { ThemeToggle } from "@/components/themetoggler";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Menu, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import biblelogo from "../../public/assets/Homepage/biblelogo.svg";
import BMSideBar from "@/components/sidebars/bmsidebar";

const RootBMpage = () => {
  const [searchParams] = useSearchParams();
  const bookName =
    searchParams.get("title") ||
    localStorage.getItem("bookName") ||
    "ஆதியாகமம்";
  // @ts-ignore
  let storebookName = localStorage.setItem("bookName", bookName);
  const chapter: any =
    searchParams.get("chapter") || localStorage.getItem("chapter") || 1;
  // @ts-ignore
  let storechapter = localStorage.setItem("chapter", chapter);
  const messageid: any =
    searchParams.get("messageid") || localStorage.getItem("messageid") || 1;
  // @ts-ignore
  let storemessageid = localStorage.setItem("messageid", messageid);
  const bibleContainerRefWeb = useRef<any>(null);
  const bibleContainerRefMob = useRef<any>(null);
  const messageContainerRefWeb = useRef<any>(null);
  const messageContainerRefMob = useRef<any>(null);

  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("BmfontSize");
    return savedFontSize ? parseInt(savedFontSize) : 14;
  });
  const {
    data: bibleData,
    isLoading: bibleIsLoading,
    refetch: bibleRefetch,
  } = useQuery({
    queryKey: ["bmBibleData"],
    queryFn: () =>
      // _axios.get(`/api/bible/chapter?chapter=${chapter}&book=${bookName}`),
      _axios.get(
        `/api/bible/chapter?chapter=${localStorage.getItem(
          "chapter"
        )}&book=${localStorage.getItem("bookName")}`
      ),
    retry: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  useEffect(() => {
    bibleRefetch();
    bibleContainerRefWeb.current?.scrollTo({ top: 0, behavior: "smooth" });
    bibleContainerRefMob.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapter, bookName]);
  useEffect(() => {
    localStorage.setItem("BmfontSize", fontSize.toString());
  }, [fontSize]);
  const {
    data: messageData,
    refetch: messageRefetch,
    isLoading: messageIsLoading,
  }: any = useQuery({
    queryKey: ["bmMessageData"],
    queryFn: () =>
      _axios.get(
        `/api/message/getselectedmessage?id=${localStorage.getItem(
          "messageid"
        )}`
      ),
    retry: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    messageRefetch();
    messageContainerRefWeb.current?.scrollTo({ top: 0, behavior: "smooth" });
    messageContainerRefMob.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [messageid]);

  const handleZoomIN = () => {
    const maxFontSize = window.innerWidth >= 768 ? 23 : 17;

    setFontSize((prevSize: any) => {
      const newSize = prevSize + 1;
      if (newSize > maxFontSize) {
        toast.warning(`Maximum font size reached `, {
          cancel: true,
          duration: 1000,
        });
        return maxFontSize;
      }
      return newSize;
    });
  };

  const handleZoomOUT = () => {
    const minFontSize = window.innerWidth >= 768 ? 14 : 12;

    setFontSize((prevSize: any) => {
      const newSize = prevSize - 1;
      if (newSize < minFontSize) {
        toast.warning(`Minimum font size reached `, {
          cancel: true,
          duration: 1000,
        });
        return minFontSize;
      }
      return newSize;
    });
  };

  if (bibleIsLoading && messageIsLoading)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );
  return (
    <>
      <main className='hidden md:block'>
        <div className='px-10 h-[10vh] sticky top-0'>
          <div>
            <div className='flex items-center gap-4 mt-2 py-2 bg-[#212121] rounded-md justify-around px-2'>
              <audio className='w-full' controls src=''></audio>
              <div className='flex items-center gap-4 cursor-pointer text-[#E7B051]'>
                <div>
                  <Minus onClick={() => handleZoomOUT()} />
                </div>
                <div>
                  <Plus onClick={() => handleZoomIN()} />
                </div>
                <div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-center px-10 py-3 '>
          <Carousel
            opts={{
              align: "center",
              dragFree: true,
            }}
            className='w-full max-w-sm'>
            <CarouselContent>
              {Array.from({ length: bibleData?.data?.data?.chapter_count }).map(
                (_, index) => (
                  <CarouselItem key={index} className='basis-16'>
                    <Badge
                      key={index}
                      onClick={() => {
                        if (index + 1 == chapter) {
                          return;
                        }

                        navigate(
                          `/layout/bmpage?&title=${bookName}&chapter=${
                            index + 1
                          }`
                        );
                      }}
                      className={`w-10 h-10 rounded-md bg-[#1b1b1b] cursor-pointer group-hover:bg-slate-100 group-hover:text-slate-900 text-white font-bold text-xs flex hover:bg-slate-900 items-center justify-center ${
                        index + 1 == chapter
                          ? "bg-[#E7B051] text-black hover:bg-white border-2 border-slate-900"
                          : ""
                      }`}>
                      {index + 1}
                    </Badge>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <div
          style={{ fontSize: `${fontSize}px` }}
          className='grid  grid-cols-2 gap-5'>
          <div
            ref={bibleContainerRefWeb}
            className='h-[80vh] w-full overflow-x-hidden px-5 overflow-y-scroll'>
            {bibleData?.data?.data?.verses.map((verse: any, idx: any) => (
              <p className='leading-relaxed font-nirmala mb-2' key={idx}>
                {verse.versecount} . {verse.verse}
              </p>
            ))}
          </div>
          <div
            ref={messageContainerRefWeb}
            className='h-[80vh] font-nirmala w-full overflow-x-hidden px-5 overflow-y-scroll'>
            {messageData?.data?.selectedMessage?.[0]?.message?.map(
              (message: any, idx: any) => (
                <p
                  key={idx}
                  dangerouslySetInnerHTML={{ __html: message }}
                  style={{ margin: "15px 0" }}
                />
              )
            )}
          </div>
        </div>
      </main>
      <main className=' block md:hidden px-2'>
        <div className='flex gap-2 items-center justify-between py-2 h-[5vh]'>
          <Sheet>
            <SheetTrigger>
              <Menu className='block md:hidden' />
            </SheetTrigger>
            <SheetContent
              className='px-0 py-0 border-[#1b1b1b] bg-[#1B1B1B]'
              side={"left"}>
              <SheetHeader>
                <BMSideBar />
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <div className='flex items-center gap-1'>
            <img src={biblelogo} className='w-5' alt='' />
            <div className=' text-[#EBB34A] text-[13px] md:text-lg lg:text-2xl font-bold font-california'>
              THE LAST VOICE MINISTRY
            </div>
          </div>
          <div className='flex items-center cursor-pointer gap-1'>
            <div className='border rounded-md p-1'>
              <Minus className='h-4 w-4' onClick={() => handleZoomOUT()} />
            </div>
            <div className='border rounded-md p-1'>
              <Plus className='h-4 w-4' onClick={() => handleZoomIN()} />
            </div>
            <div className='border rounded-md p-1'>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <section className='  grid gap-2 grid-cols-1 overflow-hidden'>
          <div className=''>
            <div className=' px-4 py-2 border '>
              <div className='flex items-center justify-center gap-4'>
                <div className='font-nirmala text-[#EBB34A] text-nowrap text-xs'>
                  {bookName}-{chapter}
                </div>
              </div>
              <div className='flex justify-center pt-2'>
                <Carousel
                  opts={{
                    align: "center",
                    dragFree: true,
                  }}
                  className='w-[200px]'>
                  <CarouselContent>
                    {Array.from({
                      length: bibleData?.data?.data?.chapter_count,
                    }).map((_, index) => (
                      <CarouselItem key={index} className='basis-10'>
                        <Badge
                          key={index}
                          onClick={() => {
                            if (index + 1 == chapter) {
                              return;
                            }

                            navigate(
                              `/layout/bmpage?&title=${bookName}&chapter=${
                                index + 1
                              }`
                            );
                          }}
                          className={`w-6 h-6 rounded-md bg-[#1b1b1b] border-0 cursor-pointer group-hover:bg-slate-100 group-hover:text-slate-900 text-white font-bold text-xs flex hover:bg-slate-900 items-center justify-center ${
                            index + 1 == chapter
                              ? "bg-[#E7B051] text-black hover:bg-white border-2 border-slate-900"
                              : ""
                          }`}>
                          {index + 1}
                        </Badge>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
            <div
              ref={bibleContainerRefMob}
              style={{ fontSize: `${fontSize}px` }}
              className='h-[37vh] pt-2  overflow-y-auto'>
              {bibleData?.data?.data?.verses.map((verse: any, idx: any) => (
                <p className='leading-relaxed font-nirmala mb-2' key={idx}>
                  {verse.versecount} . {verse.verse}
                </p>
              ))}
            </div>
          </div>
          <div className=''>
            <div className='px-4 py-2 border border-[#EBB34A] relative'>
              <div className='font-nirmala text-[#EBB34A] text-xs text-center'>
                {messageData?.data?.selectedMessage?.[0]?.name}
              </div>
              <div className='absolute top-1/2 -translate-y-1/2 left-2 flex items-center'>
                <Icon
                  className='text-[#EBB34A]'
                  icon='icon-park-solid:left-one'
                  onClick={() => {
                    const nextId: any = parseInt(messageid) - 1;
                    if (nextId > 0) {
                      navigate(
                        `/layout/bmpage?type=bmmessage&messageid=${nextId}`
                      );
                    }
                  }}
                />
              </div>
              <div className='absolute top-1/2 -translate-y-1/2 right-2 flex items-center'>
                <Icon
                  className='text-[#EBB34A]'
                  icon='icon-park-solid:right-one'
                  onClick={() => {
                    const nextId: any = parseInt(messageid) + 1;
                    navigate(
                      `/layout/bmpage?type=bmmessage&messageid=${nextId}`
                    );
                  }}
                />
              </div>
            </div>
            <div
              ref={messageContainerRefMob}
              style={{ fontSize: `${fontSize}px` }}
              className='h-[37vh] font font-nirmala overflow-y-auto'>
              {messageData?.data?.selectedMessage?.[0]?.message?.map(
                (message: any, idx: any) => (
                  <p
                    key={idx}
                    dangerouslySetInnerHTML={{ __html: message }}
                    style={{ margin: "15px 0" }}
                  />
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default RootBMpage;
