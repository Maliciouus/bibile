import { _axios } from "@/lib/axios";
import { useSearchStore } from "@/stores/searchStore";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import biblelogo from "/assets/Homepage/biblelogo.svg";
import { CircularProgressIndicator } from "../LoadingIndicator";
import { MainIcons } from "../StaticLinks/MainIcons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BMSideBar() {
  const getType: any = useParams();
  const [search, setSearch] = useState<any>("");
  const navigate = useNavigate();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
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
  const handleInputClick = () => {
    setIsReadOnly(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const {
    data: books,
    isLoading: booksLoading,
    isError: booksError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: () => _axios.get("/api/bible/books"),
  });

  const filteredBooks = books?.data?.data?.filter((book: any) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  const {
    data: messageName,
    isLoading: messageNameLoading,
    isError: messageError,
  } = useQuery({
    queryKey: ["bmpagemessage"],
    queryFn: () => _axios.get(`/api/message/getmessagename`),
  });

  const filteredMessageName = messageName?.data?.messageData?.filter(
    (message: any) =>
      message?.name?.toLowerCase()?.includes(search.toLowerCase())
  );

  if (booksError || messageError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

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

        {/* bible section */}
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
    </>
  );
}
