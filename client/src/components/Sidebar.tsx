import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { _axios } from "@/lib/axios";
import { useSearchStore, useUtilsStore } from "@/stores/searchStore";
import { useIntersection } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CircularProgressIndicator } from "./LoadingIndicator";
import { MainIcons } from "./StaticLinks/MainIcons";
import { Button } from "./ui/button";
import biblelogo from "/assets/Homepage/biblelogo.svg";
import { Icon } from "@iconify/react";
export default function Sidebar() {
  const getType: any = useParams();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState<any>("");
  const navigate = useNavigate();
  const { type } = useParams();
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
    data: searchData,
    isLoading: searchDataLoading,
    isError: searchDataError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["searchData"],
    queryFn: () =>
      search
        ? _axios.get(`/api/search?q=${search}&page=1&limit=10`)
        : Promise.resolve(null),
    // enabled: !!search,
  });

  if (searchDataError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  let [bibleLimit, messageLimit] = [10, 5];

  const [searchResults, setSearchResults] = useState<any>({
    bibleData: {
      total: 0,
      data: [],
      page: 1,
      limit: bibleLimit,
    },
    messageData: {
      total: 0,
      data: [],
      page: 1,
      limit: messageLimit,
    },
  });

  //@ts-ignore
  const [bibleInfLoading, setBibleInfLoading] = useState(true);
  //@ts-ignore
  const [messageInfLoading, setMessageInfLoading] = useState(true);

  // let isSheetOpen = useUtilsStore().isSheetOpen;
  let setIsSheetOpen = useUtilsStore((state) => state.setIsSheetOpen);

  useEffect(() => {
    const initialVisibleBibleData =
      searchData?.data?.bibleData?.slice(0, bibleLimit) || [];

    const initialVisibleMessageData =
      searchData?.data?.messageData?.slice(0, messageLimit) || [];

    setSearchResults({
      bibleData: {
        total: searchData?.data?.pagination?.bibleTotal.count || 0,
        data: searchData?.data?.bibleData || [],
        page: 2,
        limit: bibleLimit,
        visibleData: initialVisibleBibleData,
      },
      messageData: {
        total: searchData?.data?.pagination?.messageTotal?.grand_total || 0,
        data: searchData?.data?.messageData || [],
        page: 2,
        limit: messageLimit,
        visibleData: initialVisibleMessageData,
      },
    });
  }, [searchData]);

  const { ref: bibleSearchRef, entry: bibleEntry } = useIntersection();
  const { ref: messageSearchRef, entry: messageEntry } = useIntersection({});

  let updateState = useSearchStore((state) => state.setCurrentContent);
  let updateStateMessage = useSearchStore(
    (state) => state.setCurrentMessageContent
  );

  const fetchedTitlesSetMessage = useRef(new Set());

  const fetchedTitlesSet = useRef(new Set());

  const loadContent = async () => {
    const lastFive = searchResults.bibleData.visibleData.slice(-bibleLimit);

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

      const { page, limit, total, visibleData, data } = searchResults.bibleData;

      if (visibleData && visibleData.length >= total) return;

      const totalItemsDisplayed = page * limit;

      if (totalItemsDisplayed < total) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        setBibleInfLoading(true);

        const newVisibleData = data.slice(startIndex, endIndex);

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

        setBibleInfLoading(false);
      }
    } catch (error) {
      console.error("Error fetching Bible content:", error);
    }
  };

  const loadContentMessage = async () => {
    const lastFive = searchResults.messageData.visibleData.slice(-messageLimit);

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

      const { page, limit, total, visibleData, data } =
        searchResults.messageData;

      if (visibleData && visibleData.length >= total) return;

      const totalItemsDisplayed = page * limit;

      if (totalItemsDisplayed < total) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        setMessageInfLoading(true);

        const newVisibleData = data.slice(startIndex, endIndex);

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

        setMessageInfLoading(false);
      }
    } catch (error) {
      console.error("Error fetching Bible content:", error);
    }
  };

  useEffect(() => {
    if (bibleEntry?.isIntersecting) {
      loadContent();
    }
  }, [bibleEntry]);

  useEffect(() => {
    if (messageEntry?.isIntersecting) {
      loadContentMessage();
    }
  }, [messageEntry]);

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
      setTimeout(() => autoScrollMessage(classname), 500);
    }
  }

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

          <div className='px-3'>
            <div className='flex gap-x-1 justify-between'>
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
              <div>
                <Button
                  disabled={isRefetching}
                  onClick={() => {
                    if (!search) {
                      return;
                    } else if (search.length <= 2) {
                      return;
                    }
                    refetch();
                  }}
                  className='bg-trasnsparent border border-[#EBB34A]'>
                  <Icon className='h-6 w-6 text-[#EBB34A]' icon='uil:search' />
                </Button>
              </div>
            </div>
          </div>
        </div>

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
                                  className='h-[20px] bg-transparent'
                                  ref={bibleSearchRef}></p>
                              )}
                            </React.Fragment>
                          )
                        )
                      ) : (
                        <p className='text-[#FFFFFF] pt-10 font-readux text-base md:text-xl text-center'>
                          {searchResults?.bibleData?.total === 0 && search
                            ? "No Results Found"
                            : ""}
                        </p>
                      )}

                      {/* {bibleInfLoading && search && (
                        <div className="flex justify-center items-center pt-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EBB34A]" />
                        </div>
                      )} */}
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

                      {/* {messageInfLoading && searchDataLoading && search && (
                        <div className="flex justify-center items-center pt-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EBB34A]" />
                        </div>
                      )} */}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          ))}
      </main>
    </>
  );
}
