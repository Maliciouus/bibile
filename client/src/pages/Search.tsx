import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/themetoggler";
import { _axios } from "@/lib/axios";
import { useSearchStore, useUtilsStore } from "@/stores/searchStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useIntersection } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Menu, Minus, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import "./search.css";
import biblelogo from "/assets/Homepage/biblelogo.svg";

const RootSearch = () => {
  // const carouselUnique: any[] = [];
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const title = searchParams.get("title") || "";
  // const chapter = searchParams.get("chapter");
  const type = searchParams.get("type") ?? "bible";
  const id: any = searchParams.get("id");
  const name = searchParams.get("name");
  const q = searchParams.get("q") ?? localStorage.getItem("searchPageValue");

  const navigate = useNavigate();

  const [verseSelected, setVerseSelected] = useState<boolean>(false);
  const [messageSelected, setMessageSelected] = useState<boolean>(false);

  const [selectedData, setSelectedData] = useState<any>([]);
  const [selectedMessageData, setSelectedMessageData] = useState<any>([]);
  const [activeVerse, setActiveVerse] = useState<any>(null);
  const [activeVerseIdx, setActiveVerseIdx] = useState<any>(null);

  const [, setActiveMessageIdx] = useState<any>(null);

  const [activeMessageContent, setActiveMessageContent] = useState<any>(null);

  let isSheetOpen = useUtilsStore().isSheetOpen;
  let setIsSheetOpen = useUtilsStore((state) => state.setIsSheetOpen);

  // const [activeScroll, setActiveScroll] = useState<any>(null);
  const [isMobileviewverse, setIsMobileviewverse] = useState<boolean>(false);
  const [mobviewActiveVerse, setMobviewActiveVerse] = useState<any>(null);
  const [isMobileviewmessage, setIsMobileviewmessage] =
    useState<boolean>(false);
  const [mobviewActiveMessage, setMobviewActiveMessage] = useState<any>(null);
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("searchFontsize");
    return savedFontSize ? parseInt(savedFontSize) : 12;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [shouldFocus] = useState(false);

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
    setIsSheetOpen(!isSheetOpen);
  };

  useEffect(() => {
    // localStorage.setItem("searchFontsize", fontSize.toString());
  }, [fontSize]);
  const {
    //@ts-ignore
    data: verse,
    refetch: refetchVerse,
    isLoading: isLoadingVerse,
  } = useQuery({
    queryKey: ["getverses"],
    queryFn: () => _axios.get(`/api/search/getbookverse?q=${q}&title=${title}`),
  });

  const {
    //@ts-ignore
    data: message,
    refetch: messageRefetch,
    isLoading: isLoadingMessage,
  } = useQuery({
    queryKey: ["getmessages"],
    queryFn: () => _axios.get(`/api/search/getmessage?q=${q}&id=${id}`),
  });

  let [bibleChapter, setBibleChapter] = useState<any>(1);

  const { mutate: biblemutate } = useMutation({
    mutationFn: () => {
      return _axios.post(
        `/api/search/getselectedbookverse?title=${title}&chapter=${bibleChapter}`
      );
    },
    onSuccess(data) {
      setSelectedData(data?.data?.selectedData);

      let firstVerse = document.getElementById("side-bible-title");

      if (firstVerse) {
        firstVerse?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      }
    },
  });

  const { mutate: messagemutate } = useMutation({
    mutationFn: (messageId) => {
      return _axios.post(`/api/search/getselectedmessage?id=${messageId}`);
    },
    onSuccess(data) {
      setSelectedMessageData(data?.data?.selectedMessage?.[0]?.message);

      let messageTitle = document.getElementById("side-message-title");

      if (messageTitle) {
        messageTitle?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      }
    },
  });

  useEffect(() => {
    refetchVerse();
    biblemutate();
    setActiveMessageContent(null);
    setMobviewActiveMessage(null);
    setActiveVerse(null);
    setMobviewActiveVerse(null);
    setIsMobileviewmessage(false);
    setIsMaximized(false);
    setIsMaximizedMessage(false);
  }, [title, q, type, bibleChapter]);

  useEffect(() => {
    messageRefetch();
    messagemutate(id);
    setActiveVerse(null);
    setMobviewActiveVerse(null);
    setActiveMessageContent(null);
    setMobviewActiveMessage(null);
    setIsMobileviewmessage(false);
  }, [id, q, type]);

  useEffect(() => {
    const element = document.getElementById(`${activeVerse}`);
    if (element) {
      setTimeout(() => {
        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "start",
        });
      }, 500);
    }
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
    const minFontSize = window.innerWidth >= 768 ? 14 : 9;

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
    navigate(`/layout/search?title=${verse?.title}`);
    setVerseSelected(true);
    setTimeout(() => {
      setActiveVerse(verse?.verse);
      setActiveVerseIdx(verse?.Versecount);
    }, 500);
  }

  async function handleMobileSelectedVerse(verse: any) {
    navigate(`/layout/search?title=${verse?.title}`);
    setIsMobileviewverse(true);
    setIsSheetOpen(false);
    setTimeout(() => {
      setActiveVerse(verse?.verse);
      setActiveVerseIdx(verse?.Versecount);

      let elem = document.getElementById(verse?.verse);

      elem?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 500);
  }

  async function handleSelectedMessage(
    messageId: any,
    content: any,
    message: any
  ) {
    let q = searchParams.get("q");
    navigate(
      `/layout/search?q=${q}&id=${message.id}&type=message&name=${message?.name}`
    );

    setMessageSelected(true);
    setTimeout(() => {
      setActiveMessageIdx(messageId);
      setActiveMessageContent(content);
      let elem = document.getElementById(`msgside-${content}`);

      elem?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 600);
  }

  async function handleMobileSelectedMessage(
    messageId: any,
    content: any,
    message: any
  ) {
    let q = searchParams.get("q");
    navigate(
      `/layout/search?q=${q}&id=${message.id}&type=message&name=${message?.name}`
    );

    setIsMobileviewmessage(true);
    setIsSheetOpen(false);
    let elem = document.getElementById(`msgside-mobile-${content}`);

    if (elem) {
      setTimeout(() => {
        setActiveMessageIdx(messageId);
        setActiveMessageContent(content);

        elem?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 600);
    } else {
      setTimeout(
        () => handleMobileSelectedMessage(messageId, content, message),
        500
      );
    }
  }

  // infinite scroll logics

  // const searchBooksData = useSearchStore((state) => state.currentLoadedBooks);

  const data = useSearchStore().currentContent;
  const searchBooksRef = useRef(useSearchStore.getState().currentLoadedBooks);

  const messageData = useSearchStore().currentMessageContent;
  const messageRef = useRef(useSearchStore.getState().currentLoadedMessages);

  useEffect(() => {
    useSearchStore.subscribe(
      (state) => (searchBooksRef.current = state.currentLoadedBooks)
    );
  }, []);

  useEffect(() => {
    useSearchStore.subscribe(
      (state) => (messageRef.current = state.currentLoadedMessages)
    );
  }, []);

  let currentTab = useUtilsStore().currentTab;

  const [isMaximized, setIsMaximized] = useState(false);
  const [isMaximizedMessage, setIsMaximizedMessage] = useState(false);

  useEffect(() => {
    if (currentTab == "bible" && messageSelected) {
      setMessageSelected(false);
      setIsMaximizedMessage(false);
    } else if (currentTab == "message" && verseSelected) {
      setVerseSelected(false);
      setIsMaximized(false);
    }
  }, [currentTab]);

  useEffect(() => {
    if (isMobileviewverse) {
      setIsMobileviewverse(false);
      setIsMaximized(false);
    }
    if (isMobileviewmessage) {
      setIsMobileviewmessage(false);
      setIsMaximizedMessage(false);
    }
  }, [isSheetOpen]);

  // infinite scroll logics
  const { entry, ref } = useIntersection();

  const sidebarRef: any = useRef(null);

  useEffect(() => {
    if (entry?.isIntersecting) {
      useSearchStore.setState({
        retriggerSearch: !useSearchStore.getState().retriggerSearch,
      });
    }
  }, [entry]);

  if (isLoadingVerse && isLoadingMessage)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );

  return (
    <>
      <main className={`bg-[#0B0C0D] h-screen md:block hidden `}>
        {type === "bible" && (
          <div className={`flex flex-wrap`}>
            <div className={`${verseSelected ? "w-1/2" : "w-full"}`}>
              <div className='h-[100vh] w-full text-white overflow-y-scroll font-nirmala gap-y-2 px-4 '>
                {data &&
                  data.length > 0 &&
                  data.map((_data: any, bookIdx: any) => {
                    const groupedByChapter = _data.reduce(
                      (acc: any, verse: any) => {
                        const chapter = verse.Chapter;
                        if (!acc[chapter]) {
                          acc[chapter] = [];
                        }
                        acc[chapter].push(verse);
                        return acc;
                      },
                      {}
                    );

                    return (
                      <div key={bookIdx} id={`scroll-${bookIdx}`}>
                        {Object.keys(groupedByChapter).map((chapter: any) => {
                          let versesInChapter = groupedByChapter[chapter];
                          let _q = useSearchStore.getState().currentKeyWord;

                          return (
                            <motion.div
                              key={chapter}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 1 }}>
                              <h1 className='text-center py-2'>
                                <span className='text-slate-500'>
                                  ( {versesInChapter[0]?.title} - {chapter})
                                </span>
                              </h1>

                              {/* Render all verses in this chapter */}
                              {versesInChapter.map((verse: any, idx: any) => (
                                <p
                                  key={idx}
                                  onClick={() => {
                                    setBibleChapter(chapter);
                                    handleSelectedVerse(verse);
                                  }}
                                  className='text-white hover:bg-[#3d3d3d] hover:text-white cursor-pointer'>
                                  {verse?.Versecount}. {""}
                                  {highLightSearch(verse?.verse, _q)} &nbsp;
                                  <br />
                                  <br />
                                </p>
                              ))}
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })}

                <span ref={ref} className='block h-[2px]'></span>
              </div>
            </div>
            {verseSelected && (
              <div className={`w-1/2`}>
                <div className='h-[100vh] w-full text-white overflow-y-scroll font-nirmala gap-y-2 px-4 '>
                  <h1 className='text-center py-2'>
                    <span className='text-slate-500' id='side-bible-title'>
                      {title} - {bibleChapter}
                    </span>
                  </h1>
                  {selectedData?.map((item: any, idx: any) => {
                    let _q = useSearchStore.getState().currentKeyWord;

                    return (
                      <p
                        key={idx}
                        id={`${item.verse}`}
                        style={{
                          marginBottom: "10px",
                          color: `${
                            item?.Versecount === activeVerseIdx ? "#E7B051" : ""
                          } `,
                        }}
                        className={`text-white ${
                          item?.verse === activeVerseIdx ? "text-[#E7B051]" : ""
                        } `}>
                        {item?.Versecount}.{""}{" "}
                        {highLightSearch(item?.verse, _q)}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* search message */}
        {type === "message" && (
          <div className='flex flex-wrap'>
            <div className={`${messageSelected ? "w-1/2" : "w-full"}`}>
              <div className='h-[100vh] w-full overflow-y-scroll font-nirmala text-[#FFFFFF] overflow-x-hidden'>
                {messageData &&
                  messageData?.length > 0 &&
                  messageData.map((message: any) => {
                    return (
                      <React.Fragment key={message.id}>
                        {" "}
                        <h1
                          className={`text-center py-2`}
                          id={`scroll-msg-${message.id}`}>
                          <span className='text-slate-500'>{message.name}</span>{" "}
                        </h1>
                        {message?.message?.map((item: any, idx: any) => {
                          if (!q) return null;
                          const highlightedText = item.replace(
                            new RegExp(q, "gi"),
                            `<span class="text-[#E7B051] font-nirmala">${q}</span>`
                          );
                          return (
                            <p
                              onClick={() => {
                                handleSelectedMessage(id, item, message);
                              }}
                              className='text-white hover:bg-[#3d3d3d] cursor-pointer'
                              dangerouslySetInnerHTML={{
                                __html: highlightedText,
                              }}
                              key={idx}
                              style={{ margin: "15px 0" }}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
              </div>
            </div>
            {messageSelected && (
              <div className='w-1/2'>
                <div className='h-[100vh] w-full text-white overflow-y-scroll font-nirmala gap-y-2 px-4 '>
                  <h1 className='text-center py-2' id='side-message-title'>
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
                        id={`msgside-${item}`}
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

      <main className={`block md:hidden`}>
        {/* topbar */}
        <div className='flex gap-2 items-center bg-white dark:bg-black  justify-between py-2  z-[20] sticky top-0'>
          <Menu className='block md:hidden' onClick={handleSearchSelect} />

          <div
            ref={sidebarRef}
            className={`fixed top-0 left-0  h-screen min-w-[300px] max-w-[300px] text-white transition-transform duration-500 ease-in-out bg-black z-[10] ${
              isSheetOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
            <X
              className='absolute top-4 right-0 md:hidden'
              onClick={handleSearchSelect}
            />

            <Sidebar
              //@ts-ignore
              shouldFocus={shouldFocus}
              onSearchSelect={handleSearchSelect}
            />
          </div>

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
              <div
                style={{ fontSize: `${fontSize}px` }}
                className={`${isMobileviewverse ? "h-[42vh]" : "h-[94vh]"} ${
                  isMaximized ? "hidden" : ""
                } pt-2 w-full overflow-y-scroll font-nirmala  overflow-x-hidden px-2`}>
                {data &&
                  data.length > 0 &&
                  data.map((_data: any, bookIdx: any) => {
                    const groupedByChapter = _data.reduce(
                      (acc: any, verse: any) => {
                        // Group verses by chapter
                        const chapter = verse.Chapter;
                        if (!acc[chapter]) {
                          acc[chapter] = [];
                        }
                        acc[chapter].push(verse);
                        return acc;
                      },
                      {}
                    );

                    return (
                      <div key={bookIdx} id={`scroll-mobile-${bookIdx}`}>
                        {Object.keys(groupedByChapter).map((chapter: any) => {
                          let versesInChapter = groupedByChapter[chapter];
                          let _q = useSearchStore.getState().currentKeyWord;

                          return (
                            <motion.div
                              key={chapter}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 1 }}>
                              <h1 className='text-center py-2'>
                                <span className='text-slate-500'>
                                  ( {versesInChapter[0]?.title} - {chapter})
                                </span>
                              </h1>

                              {/* Render all verses in this chapter */}
                              {versesInChapter.map((verse: any, idx: any) => (
                                <p
                                  key={idx}
                                  onClick={() => {
                                    handleMobileSelectedVerse(verse);
                                    setBibleChapter(chapter);
                                  }}
                                  className='dark:text-white text-black hover:bg-[#3d3d3d] cursor-pointer'>
                                  {verse?.Versecount}. {""}
                                  {highLightSearch(verse?.verse, _q)} &nbsp;
                                  <br />
                                  <br />
                                </p>
                              ))}
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })}

                <span ref={ref} className='block h-[2px]'></span>
              </div>

              {isMobileviewverse && (
                <div className='w-full text-dark dark:text-white overflow-y-scroll font-nirmala gap-y-2 pt-4 shadow-md border-t-2 border-black'>
                  <div className='py-1 border border-[#EBB34A] w-[94%] m-auto'>
                    <div className='flex items-center justify-center gap-4'>
                      <div className='font-nirmala text-[#EBB34A] text-xs flex justify-between w-full'>
                        <p className='text-white'></p>
                        <p>
                          {title} - {bibleChapter}
                        </p>
                        <div className='flex items-center gap-2 mx-2'>
                          <Icon
                            icon={"ic:sharp-minus"}
                            fontSize={16}
                            onClick={() => {
                              if (!isMaximized) {
                                setIsMobileviewverse(false);
                                return;
                              }
                              setIsMaximized(false);
                            }}
                          />

                          <Icon
                            icon={"solar:maximize-square-2-line-duotone"}
                            fontSize={20}
                            onClick={() => setIsMaximized(true)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${
                      isMaximized ? "h-[94vh]" : "h-[42vh]"
                    } overflow-y-scroll`}>
                    <div
                      style={{ fontSize: `${fontSize}px` }}
                      className=' w-full pt-2 overflow-y-scroll font-nirmala gap-y-2  px-2'>
                      {selectedData?.map((item: any, idx: any) => {
                        let _q = useSearchStore.getState().currentKeyWord;

                        return (
                          <p
                            key={idx}
                            id={`${item.verse}`}
                            style={{
                              marginBottom: "10px",
                              color: `${
                                item?.Versecount === activeVerseIdx
                                  ? "#E7B051"
                                  : ""
                              } `,
                            }}
                            className={`dark:text-white text-black ${
                              item?.verse === activeVerseIdx
                                ? "text-[#E7B051]"
                                : ""
                            } `}>
                            {item?.Versecount}.{""}{" "}
                            {highLightSearch(item?.verse, _q)}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {type === "message" && (
            <div className='flex flex-col'>
              <div
                style={{ fontSize: `${fontSize}px` }}
                className={`${isMobileviewmessage ? "h-[42vh]" : "h-[94vh]"} ${
                  isMaximizedMessage ? "hidden" : ""
                }  pt-2 w-full overflow-y-scroll font-nirmala  overflow-x-hidden px-2`}>
                {messageData &&
                  messageData?.length > 0 &&
                  messageData.map((message: any) => {
                    return (
                      <React.Fragment key={message.id}>
                        {" "}
                        <h1
                          className={`text-center py-2`}
                          id={`scroll-mobile-msg-${message.id}`}>
                          <span className='text-slate-500'>{message.name}</span>{" "}
                        </h1>
                        {message?.message?.map((item: any, idx: any) => {
                          if (!q) return null;
                          const highlightedText = item.replace(
                            new RegExp(q, "gi"),
                            `<span class="text-[#E7B051] font-nirmala">${q}</span>`
                          );
                          return (
                            <p
                              onClick={() => {
                                handleMobileSelectedMessage(id, item, message);
                              }}
                              className='dark:text-white text-black hover:bg-[#3d3d3d] cursor-pointer'
                              dangerouslySetInnerHTML={{
                                __html: highlightedText,
                              }}
                              key={idx}
                              style={{ margin: "15px 0" }}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
              </div>
              {isMobileviewmessage && (
                <div className='w-full text-dark dark:text-white overflow-y-scroll font-nirmala gap-y-2 pt-4'>
                  <div className='py-1 border border-[#EBB34A] w-[94%] m-auto'>
                    <div className='font-nirmala text-[#EBB34A] text-xs flex  justify-between w-full'>
                      <p className='text-white'></p>
                      <p className='w-[200px] whitespace-nowrap overflow-hidden truncate  text-ellipsis text-center'>
                        {name}
                      </p>
                      <div className='flex items-center gap-2 mx-2'>
                        <Icon
                          icon={"ic:sharp-minus"}
                          fontSize={16}
                          onClick={() => {
                            if (!isMaximizedMessage) {
                              setIsMobileviewmessage(false);
                              return;
                            }
                            setIsMaximizedMessage(false);
                          }}
                        />

                        <Icon
                          icon={"solar:maximize-square-2-line-duotone"}
                          fontSize={20}
                          onClick={() => {
                            setIsMaximizedMessage(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${
                      isMaximizedMessage ? "h-[94vh]" : "h-[42vh]"
                    } overflow-y-scroll`}>
                    <div
                      style={{ fontSize: `${fontSize}px` }}
                      className=' w-full pt-2 overflow-y-scroll font-nirmala gap-y-2 px-2 '>
                      {selectedMessageData?.map((item: any, idx: any) => {
                        if (!q) return null;
                        const highlightedText = item.replace(
                          new RegExp(q, "gi"),
                          `<span class="text-[#E7B051]  font-nirmala">${q}</span>`
                        );
                        return (
                          <p
                            id={`msgside-mobile-${item}`}
                            className={`${
                              item === activeMessageContent
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
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default RootSearch;
