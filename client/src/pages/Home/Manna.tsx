import dailymanna from "/assets/Homepage/indryamanna.svg";
import allbooks from "/assets/Homepage/allbooks.webp";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { useEffect } from "react";
const Manna = () => {
  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    let month: any = today.getMonth() + 1;
    const day = today.getDate();

    month = month < 10 ? `0${month}` : month;

    const formattedDay = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${formattedDay}`;
  }

  const date = getCurrentDate();
  useEffect(() => {}, [date]);

  const { data } = useQuery({
    queryKey: ["manna"],
    queryFn: () => {
      return _axios.get(`/api/dailymanna/todayaudio?datestring=${date}`);
    },
  });

  return (
    <div className='bg-[#0B0C0D] min-h-[80vh] pt-4 md:pt-10 w-full'>
      <div className='grid items-center md:px-20 md:gap-10 md:grid-cols-2'>
        <div className='mb-4 md:mb-0'>
          <div className='relative'>
            <div className='flex justify-center items-start'>
              <img src={dailymanna} alt='' className='img-fluid px-8' />
              <p className='text-center font-nirmala text-sm  absolute bottom-10 left-0 right-0 text-white py-2'>
                இன்றைய தினத்தின் மன்னா <br />
                {data?.data?.data?.datestring}
              </p>
            </div>
          </div>
          <div className='flex justify-center mt-4 md:mt-10'>
            <audio
              className=''
              src={data?.data?.data?.audiourl}
              controls></audio>
          </div>
        </div>
        <div className='hero-bg hero'>
          <img src={allbooks} alt='' className='img-fluid w-full px-6' />
        </div>
      </div>
    </div>
  );
};

export default Manna;
