import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/themetoggler";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { _axios } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Menu, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import biblelogo from "/assets/Homepage/biblelogo.svg";

const RootSearch = () => {
  const uniqueChapters: number[] = [];
  const uniqueMobileChapters: number[] = [];
  // const carouselUnique: any[] = [];
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const title = searchParams.get("title");
  // const chapter = searchParams.get("chapter");
  const type = searchParams.get("type");
  const id: any = searchParams.get("id");
  const name = searchParams.get("name");
  const q = searchParams.get("q");

  const [isVerseSelected, setIsVerseSelected] = useState<boolean>(false);
  const [isMessageSelected, setIsMessageSelected] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<any>([]);
  const [selectedMessageData, setSelectedMessageData] = useState<any>([]);
  const [activeVerse, setActiveVerse] = useState<any>(null);
  const [activeMessageContent, setActiveMessageContent] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  // const [activeScroll, setActiveScroll] = useState<any>(null);
  const [isMobileviewverse, setIsMobileviewverse] = useState<boolean>(false);
  const [mobviewActiveVerse, setMobviewActiveVerse] = useState<any>(null);
  const [isMobileviewmessage, setIsMobileviewmessage] =
    useState<boolean>(false);
  const [mobviewActiveMessage, setMobviewActiveMessage] = useState<any>(null);
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("searchFontsize");
    return savedFontSize ? parseInt(savedFontSize) : 14;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [shouldFocus, setShouldFocus] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSheetOpen(true);
    }
  }, [isMobile]);

  const handleSearchSelect = () => {
    setIsSheetOpen(false);
  };

  useEffect(() => {
    localStorage.setItem("searchFontsize", fontSize.toString());
  }, [fontSize]);
  const {
    data: verse,
    refetch: refetchVerse,
    isLoading: isLoadingVerse,
  } = useQuery({
    queryKey: ["getverses"],
    queryFn: () => _axios.get(`/api/search/getbookverse?q=${q}&title=${title}`),
  });

  const {
    data: message,
    refetch: messageRefetch,
    isLoading: isLoadingMessage,
  } = useQuery({
    queryKey: ["getmessages"],
    queryFn: () => _axios.get(`/api/search/getmessage?q=${q}&id=${id}`),
  });

  const { mutate: biblemutate } = useMutation({
    mutationFn: () => {
      return _axios.post(`/api/search/getselectedbookverse?title=${title}`);
    },
    onSuccess(data) {
      setSelectedData(data?.data?.selectedData);
    },
  });

  const { mutate: messagemutate } = useMutation({
    mutationFn: (messageId) => {
      return _axios.post(`/api/search/getselectedmessage?id=${messageId}`);
    },
    onSuccess(data) {
      setSelectedMessageData(data?.data?.selectedMessage?.[0]?.message);
    },
  });

  useEffect(() => {
    refetchVerse();
    biblemutate();
    setActiveMessageContent(null);
    setMobviewActiveMessage(null);
    setActiveVerse(null);
    setMobviewActiveVerse(null);
    setIsMessageSelected(false);
    setIsVerseSelected(false);
    setIsMobileviewverse(false);
    setIsMobileviewmessage(false);
  }, [title, q, type]);

  useEffect(() => {
    messageRefetch();
    messagemutate(id);
    setActiveVerse(null);
    setMobviewActiveVerse(null);
    setActiveMessageContent(null);
    setMobviewActiveMessage(null);
    setIsMessageSelected(false);
    setIsVerseSelected(false);
    setIsMobileviewverse(false);
    setIsMobileviewmessage(false);
  }, [id, q, type]);

  useEffect(() => {
    const element = document.getElementById(`verse-${activeVerse}`);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    });
  }, [activeVerse]);

  useEffect(() => {
    const element = document.getElementById(`verse-${mobviewActiveVerse}`);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    });
  }, [mobviewActiveVerse]);

  useEffect(() => {
    const element = document.getElementById(`message-${activeMessageContent}`);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    });
  }, [activeMessageContent]);

  useEffect(() => {
    const element = document.getElementById(`message-${mobviewActiveMessage}`);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    });
  }, [mobviewActiveMessage]);

  const handleZoomIN = () => {
    const maxFontSize = window.innerWidth >= 768 ? 23 : 12;

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
    const minFontSize = window.innerWidth >= 768 ? 14 : 10;

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

  // useEffect(() => {
  //   const element = document.getElementById(`scroll-${activeScroll}`);
  //   element?.scrollIntoView({
  //     behavior: "smooth",
  //     block: "center",
  //     inline: "start",
  //   });
  // }, [activeScroll]);

  function highLightSearch(text: string, search: any) {
    if (text === undefined && search === undefined) return text;

    const regex = new RegExp(search, "gi");
    const highlightedText = text.replace(
      regex,
      (match) => `<span class="text-[#E7B051]  font-nirmala">${match}</span>`
    );
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  }

  async function handleSelectedVerse(verse: any) {
    setActiveVerse(verse?.verse);
    if (title !== verse?.title) {
      biblemutate();
    }
    setIsVerseSelected(true);
  }
  async function handleMobileSelectedVerse(verse: any) {
    setIsMobileviewverse(true);
    if (title !== verse?.title) {
      biblemutate();
    }
    setMobviewActiveVerse(verse?.verse);
  }
  async function handleSelectedMessage(content: any, messageId: any) {
    if (id !== messageId) {
      messagemutate(messageId);
      setActiveMessageContent(content);
    }
    setIsMessageSelected(true);
  }
  async function handleMobileSelectedMessage(content: any, messageId: any) {
    setIsMobileviewmessage(true);
    if (id !== messageId) {
      messagemutate(messageId);
      setMobviewActiveMessage(content);
    }
  }
  // async function handleScroll(scrollid: any) {
  //   setActiveScroll(scrollid);
  // }
  if (isLoadingVerse && isLoadingMessage)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );

  return (
    <>
      <main className={`bg-[#0B0C0D] h-screen md:block hidden`}>
        {/* search bible */}

        {type === "bible" && (
          <div className={`flex flex-wrap`}>
            <div className={`${isVerseSelected ? "w-1/2" : "w-full"}`}>
              <div className='h-[100vh] w-full text-white overflow-y-scroll font-nirmala gap-y-2 px-4 '>
                {/* <div className='flex z-50 justify-center px-10 pt-1'>
                    <Carousel
                      opts={{
                        align: "center",
                        dragFree: true,
                      }}
                      className='w-full max-w-sm'>
                      <CarouselContent>
                        {verse?.data?.data?.map((verse: any, idx: any) => {
                          if (!carouselUnique.includes(verse.Chapter)) {
                            carouselUnique.push(verse.Chapter);
                            return (
                              <CarouselItem key={idx} className='basis-16'>
                                <Badge
                                  onClick={() => handleScroll(verse?.Chapter)}
                                  className={`w-10 h-10 rounded-md bg-[#1b1b1b] cursor-pointer group-hover:bg-slate-100 group-hover:text-slate-900 text-white font-bold text-xs flex hover:bg-slate-900 items-center justify-center `}>
                                  {verse.Chapter}
                                </Badge>
                              </CarouselItem>
                            );
                          }
                          return null;
                        })}
                      </CarouselContent>
  
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div> */}
                {verse?.data?.data?.map((verse: any, idx: any) => {
                  if (!uniqueChapters.includes(verse?.Chapter)) {
                    uniqueChapters.push(verse?.Chapter);
                    return (
                      <div key={idx}>
                        <h1 className='text-center py-2'>
                          <span
                            id={`scroll-${verse?.Chapter}`}
                            className='text-slate-500'>
                            ( {verse?.title} - அதிகாரம் - {verse?.Chapter})
                          </span>
                        </h1>
                        <p
                          onClick={() => {
                            handleSelectedVerse(verse);
                          }}
                          className='text-white hover:bg-[#3d3d3d] cursor-pointer'>
                          {verse?.Versecount}. {""}
                          {highLightSearch(verse?.verse, q)} &nbsp; <br />
                          <br />
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <p
                        key={idx}
                        onClick={() => {
                          handleSelectedVerse(verse);
                        }}
                        className='text-white hover:bg-[#3d3d3d] cursor-pointer'>
                        {verse?.Versecount}. {""}
                        {highLightSearch(verse?.verse, q)} &nbsp; <br />
                        <br />
                      </p>
                    );
                  }
                })}
              </div>
            </div>
            {isVerseSelected && (
              <div className={`w-1/2`}>
                <div className='h-[100vh] w-full text-white overflow-y-scroll font-nirmala gap-y-2 px-4 '>
                  <h1 className='text-center py-2'>
                    <span className='text-slate-500'>{title}</span>
                  </h1>
                  {selectedData?.map((item: any, idx: any) => (
                    <p
                      key={idx}
                      id={`verse-${item?.verse}`}
                      style={{
                        marginBottom: "10px",
                        color: `${
                          item?.verse === activeVerse ? "#E7B051" : ""
                        } `,
                      }}
                      className={`text-white ${
                        item?.verse === activeVerse ? "text-[#E7B051]" : ""
                      } `}>
                      {item?.Versecount}.{""} {highLightSearch(item?.verse, q)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* search message */}
        {type === "message" && (
          <div className='flex flex-wrap'>
            <div className={`${isMessageSelected ? "w-1/2" : "w-full"}`}>
              <div className='h-[100vh] w-full overflow-y-scroll font-nirmala text-[#FFFFFF] overflow-x-hidden'>
                <h1 className='text-center py-2'>
                  <span className='text-slate-500'>{name}</span>
                </h1>
                {message?.data?.messageData?.[0]?.message?.map(
                  (item: any, idx: any) => {
                    if (!q) return null;
                    const highlightedText = item.replace(
                      new RegExp(q, "gi"),
                      `<span class="text-[#E7B051]  font-nirmala">${q}</span>`
                    );
                    return (
                      <p
                        onClick={() => {
                          handleSelectedMessage(item, id);
                          setActiveMessageContent(item);
                        }}
                        className='text-white hover:bg-[#3d3d3d] cursor-pointer'
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                        key={idx}
                        style={{ margin: "15px 0" }}
                      />
                    );
                  }
                )}
              </div>
            </div>
            {isMessageSelected && (
              <div className='w-1/2'>
                <div className='h-[100vh] w-full text-white overflow-y-scroll font-nirmala gap-y-2 px-4 '>
                  <h1 className='text-center py-2'>
                    <span className='text-slate-500'>{name}</span>
                  </h1>
                  {selectedMessageData?.map((item: any, idx: any) => {
                    if (!q) return null;
                    const highlightedText = item.replace(
                      new RegExp(q, "gi"),
                      `<span class="text-[#E7B051]  font-nirmala">${q}</span>`
                    );
                    return (
                      <p
                        id={`message-${item}`}
                        // onClick={() => {
                        //   console.log(item);
                        //   handleSelectedMessage(item, id);
                        //   setActiveMessageContent(item);
                        // }}
                        className={`${
                          item === activeMessageContent ? "text-[#E7B051]" : ""
                        } `}
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                        style={{ margin: "15px 0" }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile view */}

      <main className={`block md:hidden px-2 `}>
        <div className='flex gap-2 items-center justify-between py-2 h-[5vh]'>
          <Sheet
            open={isMobile ? isSheetOpen : undefined}
            onOpenChange={(open) => {
              setIsSheetOpen(open);
              if (open) {
                setShouldFocus(false);
              }
            }}
            defaultOpen={isMobile}>
            <SheetTrigger>
              <Menu className='block md:hidden' />
            </SheetTrigger>
            <SheetContent
              className='px-0 bg-[#1B1B1B] border-[#1B1B1B] py-0'
              side={"left"}>
              <SheetHeader>
                <Sidebar
                  //@ts-ignore
                  shouldFocus={shouldFocus}
                  onSearchSelect={handleSearchSelect}
                />
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
              <Minus onClick={() => handleZoomOUT()} className='h-4 w-4' />
            </div>
            <div className='border rounded-md p-1'>
              <Plus onClick={() => handleZoomIN()} className='h-4 w-4' />
            </div>
            <div className='border rounded-md p-1'>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <section>
          {type === "bible" && (
            <div className='flex flex-col'>
              <div>
                <div className=' px-4 py-2 border border-[#EBB34A] '>
                  <div className='flex items-center justify-center gap-4'>
                    <div className='font-nirmala text-[#EBB34A] text-xs'>
                      {title}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{ fontSize: `${fontSize}px` }}
                className={`${
                  isMobileviewverse ? "h-[42vh]" : "h-[89vh]"
                }  pt-4 w-full overflow-y-scroll font-nirmala  overflow-x-hidden`}>
                {verse?.data?.data?.map((verse: any, idx: any) => {
                  if (!uniqueMobileChapters.includes(verse?.Chapter)) {
                    uniqueMobileChapters.push(verse?.Chapter);
                    return (
                      <div key={idx}>
                        <h1 className='text-center py-2'>
                          <span
                            id={`scroll-${verse?.Chapter}`}
                            className='text-slate-500'>
                            ({verse?.title} -அதிகாரம் - {verse?.Chapter})
                          </span>
                        </h1>
                        <p
                          onClick={() => {
                            handleMobileSelectedVerse(verse);
                          }}
                          className=' hover:bg-[#3d3d3d]  cursor-pointer'>
                          {verse?.Versecount}. {""}
                          {highLightSearch(verse?.verse, q)} &nbsp; <br />
                          <br />
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <p
                        key={idx}
                        onClick={() => {
                          handleMobileSelectedVerse(verse);
                        }}
                        className=' hover:bg-[#3d3d3d] cursor-pointer'>
                        {verse?.Versecount}. {""}
                        {highLightSearch(verse?.verse, q)} &nbsp; <br />
                        <br />
                      </p>
                    );
                  }
                })}
              </div>
              {isMobileviewverse && (
                <>
                  <div className=' px-4 py-2 border border-[#EBB34A]  '>
                    <div className='flex items-center justify-center gap-4'>
                      <div className='font-nirmala text-[#EBB34A]  text-xs'>
                        {title}
                      </div>
                    </div>
                  </div>
                  <div className={`h-[42vh] overflow-y-scroll`}>
                    <div
                      style={{ fontSize: `${fontSize}px` }}
                      className=' w-full pt-2 overflow-y-scroll font-nirmala gap-y-2  '>
                      {selectedData?.map((item: any, idx: any) => (
                        <p
                          key={idx}
                          id={`verse-${item?.verse}`}
                          style={{
                            marginBottom: "10px",
                            color: `${
                              item?.verse === mobviewActiveVerse
                                ? "#E7B051"
                                : ""
                            } `,
                          }}
                          className={` ${
                            item?.verse === mobviewActiveVerse
                              ? "text-[#E7B051]"
                              : ""
                          } `}>
                          {item?.Versecount}.{""}{" "}
                          {highLightSearch(item?.verse, q)}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {type === "message" && (
            <div className='flex flex-col overflow-hidden'>
              <div>
                <div className=' px-4 py-1 border border-[#EBB34A] '>
                  <div className='flex items-center justify-center'>
                    <div className='font-nirmala text-[#EBB34A]  text-ellipsis text-[8px]'>
                      {name}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{ fontSize: `${fontSize}px` }}
                className={`${
                  isMobileviewmessage ? "h-[42vh]" : "h-[89vh]"
                }  pt-4 w-full overflow-y-scroll font-nirmala  overflow-x-hidden`}>
                {message?.data?.messageData?.[0]?.message?.map(
                  (item: any, idx: any) => {
                    if (!q) return null;
                    const highlightedText = item.replace(
                      new RegExp(q, "gi"),
                      `<span class="text-[#E7B051]  font-nirmala">${q}</span>`
                    );
                    return (
                      <p
                        onClick={() => {
                          handleMobileSelectedMessage(item, id);
                          setMobviewActiveMessage(item);
                        }}
                        className=' hover:bg-[#3d3d3d] cursor-pointer'
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                        key={idx}
                        style={{ margin: "15px 0" }}
                      />
                    );
                  }
                )}
              </div>
              {isMobileviewmessage && (
                <>
                  <div className=' px-4 py-1 border border-[#EBB34A] '>
                    <div className='flex items-center justify-center gap-4'>
                      <div className='font-nirmala text-[#EBB34A]  text-[8px]'>
                        {name}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ fontSize: `${fontSize}px` }}
                    className={`h-[42vh] overflow-y-scroll`}>
                    <div className=' w-full  overflow-y-scroll font-nirmala gap-y-2  '>
                      {selectedMessageData?.map((item: any, idx: any) => {
                        if (!q) return null;
                        const highlightedText = item.replace(
                          new RegExp(q, "gi"),
                          `<span class="text-[#E7B051]  font-nirmala">${q}</span>`
                        );
                        return (
                          <p
                            id={`message-${item}`}
                            className={`${
                              item === mobviewActiveMessage
                                ? "text-[#E7B051]"
                                : ""
                            } `}
                            key={idx}
                            dangerouslySetInnerHTML={{
                              __html: highlightedText,
                            }}
                            style={{ margin: "15px 0" }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default RootSearch;
