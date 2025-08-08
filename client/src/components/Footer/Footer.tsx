import { Link } from "react-router-dom";
import appstore from "/assets/Homepage/appstore.svg";
import biblelogo from "/assets/Homepage/biblelogo.svg";
import playstore from "/assets/Homepage/playstore.svg";

const Footer = () => {
  return (
    <footer className='py-6 md:py-14 px-5 md:px-20 bg-[#0B0C0D] text-[#FFFFFF]'>
      <div className='grid grid-cols-1 gap-1 md:gap-8 px-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch justify-evenly'>
        <div>
          <div className='flex items-center md:gap-3'>
            <img src={biblelogo} alt='' />
            <div className='text-[#EBB34A] text-lg font-bold font-california md:text-2xl'>
              THE LAST VOICE MINISTRY
            </div>
          </div>
        </div>
        <div>
          <div className='text-[#EBB34A] text-lg font-readux py-2 md:text-xl'>
            Page
          </div>
          <ul className='list-none p-0 font-readux flex flex-col gap-y-3 md:gap-y-7'>
            <Link
              to={"/layout/bible"}
              className='hover:text-[#EBB34A] pt-2 md:pt-4 cursor-pointer text-base md:text-lg'>
              Bible
            </Link>
            <Link
              to={"/layout/message"}
              className='hover:text-[#EBB34A] cursor-pointer text-base md:text-lg'>
              Message
            </Link>
            <Link
              to={"/aboutus"}
              className='hover:text-[#EBB34A] cursor-pointer text-base md:text-lg'>
              About us
            </Link>
            <Link
              to={"/addchurch"}
              className='hover:text-[#EBB34A] cursor-pointer text-base md:text-lg'>
              End Time Church Address
            </Link>
          </ul>
        </div>
        <div>
          <div>
            <div className='text-[#EBB34A] text-lg font-readux py-2 md:text-xl'>
              Follow us
            </div>
            <ul className='list-none p-0 font-readux flex flex-col gap-y-3 md:gap-y-7'>
              <Link
                target='_blank'
                to={"https://youtube.com/@dkdavid80?si=LOlEAo16gxHx8y-l"}
                className='hover:text-[#EBB34A] pt-2 md:pt-4 cursor-pointer text-base md:text-lg'>
                Youtube
              </Link>
              <li className='hover:text-[#EBB34A] cursor-pointer text-base md:text-lg'>
                Facebook
              </li>
              <li className='hover:text-[#EBB34A] cursor-pointer text-base md:text-lg'>
                Instagram
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div>
            <div className='text-[#EBB34A] text-lg font-readux py-2 md:text-xl'>
              Download
            </div>
            <ul className='list-none font-readux p-0 flex flex-col gap-y-3 md:gap-y-7'>
              <li className='pt-2 md:pt-4'>
                <img
                  className='opacity-65 hover:opacity-100 cursor-pointer max-w-full'
                  src={playstore}
                  alt=''
                />
              </li>
              <li>
                <img
                  className='opacity-65 hover:opacity-100 cursor-pointer max-w-full'
                  src={appstore}
                  alt=''
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        style={{ color: "rgba(255, 255, 255, 0.33)" }}
        className='flex justify-center md:justify-end font-readux py-3 px-5'>
        @TheLastVoiceMinsitry Inc.2024
      </div>
    </footer>
  );
};

export default Footer;
