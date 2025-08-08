// import { AlignJustify, X } from "lucide-react";
// import { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { NavMenu } from "../StaticLinks/NavMenu";
// import biblelogo from "/assets/Homepage/biblelogo.svg";
// import { Icon } from "@iconify/react";

// const Navbar = () => {
//   let [open, setOpen] = useState(false);
//   const { pathname } = useLocation();
//   const navigate = useNavigate();

//   return (
//     <>
//       <div className=' w-full sticky top-0 bg-[#0B0C0D] shadow-2xl z-50'>
//         <div className='md:flex items-center justify-between py-4 md:px-10 px-1'>
//           <div className='flex items-center justify-center   md:justify-between flex-wrap text-wrap gap-3'>
//             <div
//               onClick={() => setOpen(!open)}
//               className={`text-2xl text-[#EBB34A] transition-transform duration-200 absolute right-8 top-6 cursor-pointer md:hidden ${
//                 open
//                   ? "transform rotate-90 scale-110"
//                   : "transform rotate-0 scale-100"
//               }`}>
//               {open ? <X /> : <AlignJustify />}
//             </div>
//             <div
//               onClick={() => (window.location.href = "/")}
//               className='flex cursor-pointer gap-2 items-center'>
//               <img src={biblelogo} className='w-12 md:w-16' alt='' />
//               <div className=' text-[#EBB34A] text-[15px] md:text-lg lg:text-2xl font-bold font-california'>
//                 THE LAST VOICE MINISTRY
//               </div>
//             </div>

//             <div className='md:hidden'>
//               <Icon
//                 onClick={() => {
//                   navigate("/layout/search");
//                 }}
//                 className='text-[#FFFFFF] mt-[0.2rem]  cursor-pointer text-3xl  md:text-4xl'
//                 icon={"mdi:search"}
//               />
//             </div>
//           </div>

//           <ul
//             className={`md:flex md:items-center md:pb-0 pb-2 absolute md:static gap-2 xl:gap-x-4  md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all bg-[#0B0C0D] duration-500 ease-in ${
//               open ? "top-20 " : "top-[-490px]"
//             } list-none uppercase  font-madefuture  `}>
//             <li className=' hidden  md:block'>
//               <Icon
//                 onClick={() => {
//                   navigate("/layout/search");
//                 }}
//                 className='text-[#FFFFFF] mt-[0.2rem]  cursor-pointer text-3xl  md:text-4xl'
//                 icon={"mdi:search"}
//               />
//             </li>
//             {NavMenu.map((link) => (
//               <li key={link.name} className='md:ml-8 text-xl md:my-0 my-3'>
//                 <Link to={link.link}>
//                   <button
//                     onClick={() => {
//                       if (link.link === "/layout/songbooks") {
//                         localStorage.removeItem("tamil");
//                       }
//                     }}
//                     className={`pb-1 hover:text-[#EBB34A]  text-base xl:text-lg ${
//                       pathname === link.link
//                         ? "text-[#EBB34A] border-b-2 border-[#EBB34A] md:border-b-2 md:border-[#EBB34A]"
//                         : "text-[#FFFFFF]"
//                     }`}>
//                     {link.name}
//                   </button>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;
import { AlignJustify, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavMenu } from "../StaticLinks/NavMenu";
import biblelogo from "/assets/Homepage/biblelogo.svg";
import { Icon } from "@iconify/react";

const Navbar = () => {
  let [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className='w-full sticky top-0 bg-[#0B0C0D] shadow-2xl z-50'>
        <div className='md:flex items-center justify-between py-4 md:px-10 px-1'>
          <div className='flex items-center justify-between w-full px-2  md:w-auto'>
            <div
              onClick={() => setOpen(!open)}
              className={`text-2xl text-[#EBB34A] transition-transform duration-200 md:hidden cursor-pointer ${
                open
                  ? "transform rotate-90 scale-110"
                  : "transform rotate-0 scale-100"
              }`}>
              {open ? <X /> : <AlignJustify />}
            </div>

            <div
              onClick={() => (window.location.href = "/")}
              className='flex cursor-pointer gap-2 items-center mx-auto md:mx-0'>
              <img src={biblelogo} className='w-12 md:w-16' alt='Bible Logo' />
              <div className='text-[#EBB34A] text-[15px] md:text-lg lg:text-xl font-bold font-california'>
                THE LAST VOICE MINISTRY
              </div>
            </div>

            <div className='md:hidden'>
              <Icon
                onClick={() => {
                  navigate("/layout/search");
                }}
                className='text-[#FFFFFF] cursor-pointer text-3xl'
                icon={"mdi:search"}
              />
            </div>
          </div>

          <ul
            className={`md:flex md:items-center md:pb-0 pb-2 absolute md:static gap-2 xl:gap-x-4  md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all bg-[#0B0C0D] duration-500 ease-in ${
              open ? "top-20 " : "top-[-490px]"
            } list-none uppercase  font-madefuture`}>
            <li className='hidden md:block'>
              <Icon
                onClick={() => {
                  navigate("/layout/search");
                }}
                className='text-[#FFFFFF] cursor-pointer text-3xl md:text-4xl'
                icon={"mdi:search"}
              />
            </li>

            {NavMenu.map((link) => (
              <li key={link.name} className='md:ml-8 text-xl md:my-0 my-3'>
                <Link to={link.link}>
                  <button
                    onClick={() => {
                      if (link.link === "/layout/songbooks") {
                        localStorage.removeItem("tamil");
                      }
                    }}
                    className={`pb-1 hover:text-[#EBB34A] text-base xl:text-lg ${
                      pathname === link.link
                        ? "text-[#EBB34A] border-b-2 border-[#EBB34A] md:border-b-2 md:border-[#EBB34A]"
                        : "text-[#FFFFFF]"
                    }`}>
                    {link.name}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
