import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { _axios } from "@/lib/axios";
import { agaravaisai } from "@/lib/அகரவரிசை";
import { useSearchStore, useUtilsStore } from "@/stores/searchStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CircularProgressIndicator } from "./LoadingIndicator";
import { MainIcons } from "./StaticLinks/MainIcons";
import { Button } from "./ui/button";
import biblelogo from "/assets/Homepage/biblelogo.svg";

export default function Sidebar({
  onBibleSelect = () => {},
  onMessageSelect = () => {},
  //@ts-ignore
  onSearchSelect = () => {},
  onSongBookSelect = () => {},
}: any) {
  const getType: any = useParams();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState<any>("");
  const [tamil, setTamil] = useState<any>(localStorage.getItem("tamil") || "");
  const navigate = useNavigate();
  const { type } = useParams();
  const [open, setOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("lastActiveTab") || "bible";
  });

  let updateTab = useUtilsStore((state) => state.updateCurrentTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateTab(value);

    localStorage.setItem("lastActiveTab", value);
  };
  const handleInputClick = () => {
    setIsReadOnly(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (type === "search") {
      const storedSearch = localStorage.getItem("searchPageValue");
      if (storedSearch) {
        setSearch(storedSearch);
        useSearchStore.setState({
          currentKeyWord: storedSearch,
        });
      }
    } else {
      setSearch("");
    }
  }, [type]);

  useEffect(() => {
    if (type === "search") {
      localStorage.setItem("searchPageValue", search);
    }
  }, [search, type]);

  const {
    data: books,
    isLoading: booksLoading,
    isError: booksError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: () => _axios.get("/api/bible/books"),
  });

  const {
    data: message,
    isLoading: messageLoading,
    isError: messageError,
  } = useQuery({
    queryKey: ["message"],
    queryFn: () => _axios.get("/api/message"),
  });

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

  const { data: messageName, isLoading: messageNameLoading } = useQuery({
    queryKey: ["bmpagemessage"],
    queryFn: () => _axios.get(`/api/message/getmessagename`),
  });

  const {
    data: searchData,
    isLoading: searchDataLoading,
    isError: searchDataError,
  } = useQuery({
    queryKey: ["searchData", search],
    queryFn: () =>
      search
        ? _axios.get(`/api/search?q=${search}&page=1&limit=10`)
        : Promise.resolve(null),
    enabled: !!search,
  });

  const filteredBooks = books?.data?.data?.filter((book: any) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMessages = message?.data?.data?.filter((message: any) =>
    message?.messageName?.toLowerCase()?.includes(search.toLowerCase())
  );

  // const filteredSongbooks = songbooks?.pages?.[0]?.data?.filter(
  //   (songbook: any) =>
  //     songbook?.name?.toLowerCase()?.includes(search.toLowerCase())
  // );

  const filteredMessageName = messageName?.data?.messageData?.filter(
    (message: any) =>
      message?.name?.toLowerCase()?.includes(search.toLowerCase())
  );

  if (booksError || messageError || searchDataError || songbooksError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  const [selectedItem, setSelectedItem] = useState<any>(
    localStorage.getItem("bmbookName") || "ஆதியாகமம்"
  );
  const [messageId, setMessageId] = useState<any>(
    localStorage.getItem("messageid") || 1
  );
  useEffect(() => {
    localStorage.setItem("bmbookName", selectedItem);
    localStorage.setItem("messageid", messageId);
  }, [selectedItem]);

  const [selectedBible, setSelectedBible] = useState<any>(
    localStorage.getItem("MainBiblename") || "ஆதியாகமம்"
  );
  useEffect(() => {
    localStorage.setItem("MainBiblename", selectedBible);
  }, [selectedBible]);

  const [selectedMessage, setSelectedMessage] = useState<any>(
    localStorage.getItem("MainMessageId") || 1
  );

  useEffect(() => {
    localStorage.setItem("MainMessageId", selectedMessage);
  }, [selectedMessage]);

  const [selectedSongbook, setSelectedSongbook] = useState<any>(
    localStorage.getItem("songBookId") || 22
  );

  useEffect(() => {
    localStorage.setItem("songBookId", selectedSongbook);
  });

  const [searchResults, setSearchResults] = useState<any>({
    bibleData: {
      total: 0,
      data: [],
      page: 1,
      limit: 1,
    },
    messageData: {
      total: 0,
      data: [],
      page: 1,
      limit: 1,
    },
  });

  const [bibleInfLoading, setBibleInfLoading] = useState(true);
  const [messageInfLoading, setMessageInfLoading] = useState(true);

  // let isSheetOpen = useUtilsStore().isSheetOpen;
  let setIsSheetOpen = useUtilsStore((state) => state.setIsSheetOpen);

  useEffect(() => {
    const initialVisibleBibleData =
      searchData?.data?.bibleData?.slice(0, 1) || [];

    const initialVisibleMessageData =
      searchData?.data?.messageData?.slice(0, 1) || [];

    setSearchResults({
      bibleData: {
        total: searchData?.data?.pagination?.bibleTotal.count || 0,
        data: searchData?.data?.bibleData || [],
        page: 2,
        limit: 1,
        visibleData: initialVisibleBibleData,
      },
      messageData: {
        total: searchData?.data?.pagination?.messageTotal?.grand_total || 0,
        data: searchData?.data?.messageData || [],
        page: 2,
        limit: 1,
        visibleData: initialVisibleMessageData,
      },
    });
  }, [searchData]);

  const { ref: bibleSearchRef, entry: bibleEntry } = useIntersection({});
  const { ref: messageSearchRef, entry: messageEntry } = useIntersection({});

  let updateState = useSearchStore((state) => state.setCurrentContent);
  let updateStateMessage = useSearchStore(
    (state) => state.setCurrentMessageContent
  );

  const fetchedTitlesSet = useRef(new Set());
  const fetchedTitlesSetMessage = useRef(new Set());

  const loadContent = async () => {
    if (
      (!searchResults && !searchResults.bibleData) ||
      !searchResults.bibleData.visibleData
    )
      return;

    const lastFive = searchResults.bibleData.visibleData.slice(-1);

    const newTitles = lastFive
      .map((e: any) => e.title)
      .filter((title: string) => !fetchedTitlesSet.current.has(title));

    if (newTitles.length === 0) return;

    const titleString = newTitles.join(",");

    try {
      let res = await _axios.get(
        `/api/search/getbookversemultiple?q=${search}&title=${titleString}`
      );

      newTitles.forEach((title: any) => fetchedTitlesSet.current.add(title));

      let prev = useSearchStore.getState().currentContent;

      updateState(prev.concat(res.data.data));
    } catch (error) {
      console.error("Error fetching Bible content:", error);
    }
  };

  const loadContentMessage = async () => {
    if (
      (!searchResults && !searchResults.messageData) ||
      !searchResults.messageData.visibleData
    )
      return;

    const lastFive = searchResults.messageData.visibleData.slice(-1);

    const newTitles = lastFive
      .map((e: any) => e.id)
      .filter((title: string) => !fetchedTitlesSetMessage.current.has(title));

    if (newTitles.length === 0) return;

    const titleString = newTitles.join(",");

    try {
      let res = await _axios.get(
        `/api/search/getmessagemultiple?q=${search}&id=${titleString}`
      );

      newTitles.forEach((title: any) =>
        fetchedTitlesSetMessage.current.add(title)
      );

      let prev = useSearchStore.getState().currentMessageContent;

      updateStateMessage(prev.concat(res.data.messageData));
    } catch (error) {
      console.error("Error fetching Bible content:", error);
    }
  };

  function loadMoreBibleData() {
    const { page, limit, total, visibleData, data } = searchResults.bibleData;

    if (visibleData && visibleData.length >= total) return;

    const totalItemsDisplayed = page * limit;

    if (totalItemsDisplayed < total) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      setBibleInfLoading(true);

      const newVisibleData = data.slice(startIndex, endIndex);

      setTimeout(() => {
        setSearchResults((prevResults: any) => ({
          ...prevResults,
          bibleData: {
            ...prevResults.bibleData,
            page: prevResults.bibleData.page + 1,
            visibleData: [
              ...prevResults.bibleData.visibleData,
              ...newVisibleData,
            ],
          },
        }));

        loadContent();

        setBibleInfLoading(false);
      }, 500);
    }
  }

  function loadMoreMessageData() {
    const { page, limit, total, visibleData, data } = searchResults.messageData;

    if (visibleData && visibleData.length >= total) return;

    const totalItemsDisplayed = page * limit;

    if (totalItemsDisplayed < total) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      setMessageInfLoading(true);

      const newVisibleData = data.slice(startIndex, endIndex);

      setTimeout(() => {
        setSearchResults((prevResults: any) => ({
          ...prevResults,
          messageData: {
            ...prevResults.messageData,
            page: prevResults.messageData.page + 1,
            visibleData: [
              ...prevResults.messageData.visibleData,
              ...newVisibleData,
            ],
          },
        }));

        loadContentMessage();

        setMessageInfLoading(false);
      }, 500);
    }
  }

  useEffect(() => {
    loadContent();
  }, [searchResults.bibleData.page]);

  useEffect(() => {
    loadContentMessage();
  }, [searchResults.messageData.page]);

  function autoScroll(classname: any) {
    let element = document.getElementById(`scroll-${classname}`);

    let isMobileWidth = window.innerWidth <= 768;

    if (isMobileWidth) {
      element = document.getElementById(`scroll-mobile-${classname}`);
    }

    if (element) {
      setTimeout(() => {
        setIsSheetOpen(false);
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      }, 500);
    } else {
      setTimeout(() => autoScroll(classname), 500);
    }
  }

  function autoScrollMessage(classname: any) {
    let time = 1000;

    let element = document.getElementById(`scroll-msg-${classname}`);
    let isMobileWidth = window.innerWidth <= 768;

    if (isMobileWidth)
      element = document.getElementById(`scroll-mobile-msg-${classname}`);

    if (element) {
      setTimeout(() => {
        setIsSheetOpen(false);

        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      }, time);
    } else {
      setTimeout(() => autoScrollMessage(classname), 500); // Adjust retry interval if needed
    }
  }

  useEffect(() => {
    if (bibleEntry?.isIntersecting) loadMoreBibleData();
  }, [bibleEntry]);

  useEffect(() => {
    if (messageEntry?.isIntersecting) loadMoreMessageData();
  }, [messageEntry]);

  useEffect(() => {
    useSearchStore.setState({
      currentLoadedBooks: searchResults.bibleData.visibleData,
    });
  }, [searchResults.bibleData]);

  useEffect(() => {
    useSearchStore.setState({
      currentLoadedMessages: searchResults.messageData.visibleData,
    });
  }, [searchResults.messageData]);

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
        <div>
          <div className='flex flex-nowrap justify-evenly items-center py-2 px-2'>
            {MainIcons?.map((icon: any, idx: any) => (
              <div
                onClick={() => {
                  navigate(icon.route);
                  // setSearch("");
                  setTamil("");
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
          {/* search bar */}
          {getType?.type === "songbooks" ? (
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
          ) : (
            <div className='px-4'>
              <div className='flex items-center border border-[#EBB34A] rounded-md px-5 p-2'>
                <Search className='text-[#EBB34A]' />

                <input
                  ref={inputRef}
                  onChange={(e) => {
                    setSearch(e.target.value);

                    useSearchStore.setState({
                      currentKeyWord: e.target.value,
                    });
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
            </div>
          )}
        </div>

        {/* bible section */}
        {getType.type == "bible" &&
          (booksLoading ? (
            <div className='flex h-[70vh] items-center justify-center'>
              <CircularProgressIndicator />
            </div>
          ) : (
            // <div className=' h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] [&::-webkit-scrollbar]:hidden  overflow-y-scroll'>
            <div className='h-[70vh]  md:h-[80vh] [&::-webkit-scrollbar]:hidden  overflow-y-scroll'>
              <div className='px-4 py-3'>
                {filteredBooks &&
                  filteredBooks.length > 0 &&
                  filteredBooks.map((book: any, idx: any) => (
                    <p
                      onClick={() => {
                        navigate(
                          `/layout/bible?type=books&book=${
                            book?.title
                          }&chapter=${1}`
                        );
                        setSelectedBible(book?.title);
                        onBibleSelect();
                      }}
                      key={idx}
                      style={{ borderRadius: "5px" }}
                      className={`border-[1px] p-2 border-[#EBB34A] text-[#FFFFFF]   text-xs md:text-sm truncate cursor-pointer font-nirmala ${
                        book?.title == selectedBible
                          ? "bg-[#EBB34A] text-[#1B1B1B]"
                          : ""
                      }`}>
                      {book?.title}
                    </p>
                  ))}
              </div>
            </div>
          ))}

        {/* message section */}

        {getType.type == "message" &&
          (messageLoading ? (
            <div className='flex h-[70vh] items-center justify-center'>
              <CircularProgressIndicator />
            </div>
          ) : (
            <>
              <div className='text-[#FFFFFF] py-2 font-readux text-sm md:text-lg text-left px-5 '>
                <div>
                  Total Messages : &nbsp;
                  <span className='text-[#EBB34A]'>
                    {(filteredMessages && filteredMessages.length) || 0}
                  </span>
                </div>
              </div>
              {/* <div className='h-[calc(100vh-180px)] md:h-[calc(100vh-240px)] [&::-webkit-scrollbar]: md:max-w-xs lg:max-w-sm:  overflow-y-scroll'> */}
              <div className='h-[60vh] md:h-[calc(100vh-240px)] [&::-webkit-scrollbar]: md:max-w-xs lg:max-w-sm  overflow-y-scroll'>
                <div className='px-1 py-3'>
                  {filteredMessages &&
                    filteredMessages.length > 0 &&
                    filteredMessages.map((message: any) => (
                      <p
                        onClick={() => {
                          navigate(
                            `/layout/message?m=${message?.messageId}&audiourl=${
                              message?.audiourl || ""
                            }`
                          );
                          setSelectedMessage(message?.messageId);
                          onMessageSelect();
                        }}
                        key={message?.messageId}
                        style={{ borderRadius: "5px", textAlign: "start" }}
                        className={`border-[1px] p-2 border-[#EBB34A] truncate  text-xs md:text-sm text-[#FFFFFF] cursor-pointer font-nirmala ${
                          selectedMessage == message?.messageId
                            ? "bg-[#EBB34A] text-[#1B1B1B]"
                            : ""
                        }`}>
                        {message?.messageName}
                      </p>
                    ))}
                </div>
              </div>
            </>
          ))}

        {/* song books section  */}
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
                  {/* {filteredSongbooks &&
                    filteredSongbooks.length > 0 &&
                    filteredSongbooks.map((songbook: any) => (
                      <p
                        onClick={() => {
                          navigate(`/layout/songbooks?songId=${songbook?.id}`);
                          setSelectedSongbook(songbook?.id);
                          onSongBookSelect();
                        }}
                        key={songbook?.id}
                        style={{ borderRadius: "5px" }}
                        className={`border-[1px] p-2 border-[#EBB34A] text-xs md:text-base text-[#FFFFFF] cursor-pointer font-nirmala ${
                          selectedSongbook == songbook?.id
                            ? "bg-[#EBB34A] text-[#1B1B1B]"
                            : ""
                        }
                        `}>
                        {songbook?.name}
                      </p>
                    ))} */}
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

        {/* search section */}
        {getType.type == "search" &&
          (searchDataLoading ? (
            <div className='flex h-[70vh] items-center justify-center'>
              <CircularProgressIndicator />
            </div>
          ) : (
            <div className='px-1 mt-2'>
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className=''>
                <TabsList className='grid bg-transparent gap-3  grid-cols-2'>
                  <TabsTrigger
                    className='bg-[#2B2B2B] border-2 border-[#EBB34A] py-1 text-sm md:text-lg font-readux text-[#FFFFFF]'
                    value='bible'>
                    Bible
                  </TabsTrigger>
                  <TabsTrigger
                    className='bg-[#2B2B2B] border-2 border-[#EBB34A] text-sm md:text-lg font-readux py-1 text-[#FFFFFF]'
                    value='message'>
                    Message
                  </TabsTrigger>
                </TabsList>
                <div className='pt-1 md:pt-2'>
                  <TabsContent
                    className='md:max-w-xs lg:max-w-sm'
                    value='bible'>
                    <div className='h-[70vh] md:h-[70vh] px overflow-y-scroll'>
                      <div className='text-[#FFFFFF] py-2 font-readux text-sm md:text-lg text-left px-2 '>
                        <div className='flex justify-between items-center'>
                          <div>
                            {" "}
                            Total : &nbsp;
                            <span className='text-[#EBB34A]'>
                              {searchData?.data?.pagination?.bibleTotal.count ||
                                0}
                            </span>
                          </div>
                          <div>
                            Total : &nbsp;
                            <span className='text-[#EBB34A]'>
                              {searchData?.data?.pagination?.messageTotal
                                ?.grand_total || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {searchResults.bibleData.visibleData?.length > 0 ? (
                        searchResults.bibleData.visibleData.map(
                          (bibleSearch: any, idx: any) => (
                            <React.Fragment key={idx}>
                              <motion.div
                                initial={{ opacity: 0, y: 0.5 }}
                                animate={{ opacity: 1, y: 1 }}
                                transition={{ duration: 1 }}
                                onClick={() => {
                                  navigate(
                                    `/layout/search?title=${bibleSearch?.title}`
                                  );
                                  autoScroll(idx);
                                }}
                                key={idx}
                                style={{ borderRadius: "5px" }}
                                className={`bible-search border-[1px] flex items-center p-2 justify-between truncate    text-xs md:text-sm border-[#EBB34A] text-[#FFFFFF] cursor-pointer font-nirmala ${
                                  bibleSearch?.title ==
                                  searchParams.get("title")
                                    ? "bg-[#EBB34A] text-[#1B1B1B]"
                                    : ""
                                }`}>
                                <p>{bibleSearch?.title}</p>

                                <Button
                                  size='icon'
                                  className='rounded-full bg-[#FFFFFF] hover:bg-[#EBB34A] text-black cursor-default text-center font-readux'>
                                  {bibleSearch?.word_count}
                                </Button>
                              </motion.div>

                              {idx ===
                                searchResults.bibleData.visibleData.length -
                                  1 && (
                                <p
                                  className='h-[20px]'
                                  ref={bibleSearchRef}></p>
                              )}
                            </React.Fragment>
                          )
                        )
                      ) : (
                        <p className='text-[#FFFFFF] pt-10 font-readux text-base md:text-xl text-center'>
                          {searchResults.bibleData.total === 0 && search
                            ? "No Results Found"
                            : ""}
                        </p>
                      )}

                      {bibleInfLoading && search && (
                        <div className='flex justify-center items-center pt-4'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#EBB34A]' />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent
                    className='md:max-w-xs lg:max-w-sm'
                    value='message'>
                    <div className='h-[70vh] overflow-y-scroll'>
                      <div className='text-[#FFFFFF] py-2 font-readux text-sm md:text-lg text-end px-5 '>
                        <div className='flex justify-between items-center'>
                          <div>
                            {" "}
                            Total : &nbsp;
                            <span className='text-[#EBB34A]'>
                              {searchData?.data?.pagination?.bibleTotal.count ||
                                0}
                            </span>
                          </div>
                          <div>
                            Total : &nbsp;
                            <span className='text-[#EBB34A]'>
                              {searchData?.data?.pagination?.messageTotal
                                ?.grand_total || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {searchResults.messageData.visibleData?.length > 0 ? (
                        searchResults.messageData.visibleData?.map(
                          (messageSearch: any, idx: any) => {
                            return (
                              <React.Fragment key={idx}>
                                <motion.div
                                  initial={{ opacity: 0, y: 0.5 }}
                                  animate={{ opacity: 1, y: 1 }}
                                  transition={{ duration: 1 }}
                                  onClick={() => {
                                    navigate(
                                      `/layout/search?q=${search}&id=${messageSearch?.id}&type=message&name=${messageSearch?.name}`
                                    );
                                    autoScrollMessage(`${messageSearch.id}`);
                                  }}
                                  key={idx}
                                  style={{ borderRadius: "5px" }}
                                  className={`border-[1px] p-2 border-[#EBB34A] text-xs md:text-sm truncate  text-[#FFFFFF] cursor-pointer font-nirmala ${
                                    messageSearch?.name ==
                                    searchParams.get("name")
                                      ? "bg-[#EBB34A] text-[#1B1B1B]"
                                      : ""
                                  }`}>
                                  {messageSearch?.name} <br />
                                  <p className='flex justify-end'>
                                    <Button
                                      size='icon'
                                      className='rounded-full bg-[#FFFFFF] hover:bg-[#EBB34A]  text-black cursor-default  text-center font-readux '>
                                      {messageSearch?.word_count}
                                    </Button>
                                  </p>
                                </motion.div>

                                {idx ===
                                  searchResults.messageData.visibleData.length -
                                    1 && (
                                  <p
                                    className='h-[20px]'
                                    ref={messageSearchRef}></p>
                                )}
                              </React.Fragment>
                            );
                          }
                        )
                      ) : (
                        <p className='text-[#FFFFFF]  pt-10 font-readux text-base md:text-xl text-center '>
                          {searchData?.data?.pagination?.messageTotal
                            ?.grand_total == 0 && search
                            ? "No Results Found"
                            : ""}
                        </p>
                      )}

                      {messageInfLoading && searchDataLoading && search && (
                        <div className='flex justify-center items-center pt-4'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#EBB34A]' />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          ))}

        {/* Bm Page section */}
        {getType.type == "bmpage" && (
          <div className='px-1 mt-2'>
            <Tabs defaultValue='bible' className=''>
              <TabsList className='grid bg-transparent gap-3  grid-cols-2'>
                <TabsTrigger
                  className='bg-[#2B2B2B] border-2 border-[#EBB34A] py-1 text-sm md:text-lg font-readux text-[#FFFFFF]'
                  value='bible'>
                  Bible
                </TabsTrigger>
                <TabsTrigger
                  className='bg-[#2B2B2B] border-2 border-[#EBB34A] text-sm md:text-lg font-readux py-1 text-[#FFFFFF]'
                  value='message'>
                  Message
                </TabsTrigger>
              </TabsList>
              <div className='pt-2'>
                <TabsContent value='bible'>
                  <div className='h-[65vh] md:h-[70vh] overflow-y-scroll'>
                    {booksLoading ? (
                      <div className='flex h-[70vh] px-2 items-center justify-center'>
                        <CircularProgressIndicator />
                      </div>
                    ) : (
                      filteredBooks &&
                      filteredBooks.length > 0 &&
                      filteredBooks?.map((bible: any, idx: any) => (
                        <div
                          onClick={() => {
                            navigate(
                              `/layout/bmpage?type=bmbible&title=${
                                bible.title
                              }&chapter=${1}`
                            );
                            setSelectedItem(bible.title);
                          }}
                          key={idx}
                          style={{ borderRadius: "5px" }}
                          className={`border-[1px] flex items-center p-2 justify-between  text-sm md:text-base border-[#EBB34A] text-[#FFFFFF] cursor-pointer font-nirmala ${
                            bible.title === selectedItem
                              ? "bg-[#EBB34A] text-[#1B1B1B]"
                              : ""
                          } `}>
                          <p>{bible.title}</p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
                <TabsContent className='w-full' value='message'>
                  <div className=' h-[65vh] md:h-[70vh] overflow-y-scroll'>
                    {messageNameLoading ? (
                      <div className='flex h-[70vh] items-center justify-center'>
                        <CircularProgressIndicator />
                      </div>
                    ) : (
                      filteredMessageName &&
                      filteredMessageName.length > 0 &&
                      filteredMessageName?.map((message: any) => (
                        <div
                          onClick={() => {
                            navigate(
                              `/layout/bmpage?type=bmmessage&messageid=${message?.id}`
                            );
                            setMessageId(message?.id);
                          }}
                          key={message?.id}
                          style={{ borderRadius: "5px" }}
                          className={`border-[1px] p-2 border-[#EBB34A] text-[#FFFFFF] text-xs md:text-base cursor-pointer font-nirmala ${
                            message?.id == messageId
                              ? "bg-[#EBB34A] text-[#1B1B1B]"
                              : ""
                          } `}>
                          {message?.name} <br />
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
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
