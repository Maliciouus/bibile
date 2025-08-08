import { _axios } from "@/lib/axios";
import { useSearchStore } from "@/stores/searchStore";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import biblelogo from "/assets/Homepage/biblelogo.svg";
import { CircularProgressIndicator } from "../LoadingIndicator";
import { MainIcons } from "../StaticLinks/MainIcons";

export default function MessageSideBar({ onMessageSelect = () => {} }: any) {
  const getType: any = useParams();
  const [search, setSearch] = useState<any>("");
  const navigate = useNavigate();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputClick = () => {
    setIsReadOnly(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const {
    data: message,
    isLoading: messageLoading,
    isError: messageError,
  } = useQuery({
    queryKey: ["message"],
    queryFn: () => _axios.get("/api/message"),
  });

  const filteredMessages = message?.data?.data?.filter((message: any) =>
    message?.messageName?.toLowerCase()?.includes(search.toLowerCase())
  );

  if (messageError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  const [selectedMessage, setSelectedMessage] = useState<any>(
    localStorage.getItem("MainMessageId") || 1
  );
  useEffect(() => {
    localStorage.setItem("MainMessageId", selectedMessage);
  }, [selectedMessage]);

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
      </main>
    </>
  );
}
