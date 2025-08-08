import Footer from "@/components/Footer/Footer";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import download from "/assets/Homepage/download.webp";
import homehero1 from "/assets/Homepage/homehero1.png";
import homeherobook from "/assets/Homepage/homeherobook.webp";
import homeherostar from "/assets/Homepage/homeherostar.svg";
import sp1 from "/assets/Homepage/sp1.png";
import sp2 from "/assets/Homepage/sp2.png";
import sp3 from "/assets/Homepage/sp3.png";
import sp5 from "/assets/Homepage/sp5.png";
import spp1 from "/assets/Homepage/spp1.png";
import spp3 from "/assets/Homepage/spp3.png";
import { useNavigate } from "react-router-dom";
import Manna from "./Manna";

function Homepage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <div className='bg-[#0B0C0D] min-h-screen overflow-x-hidden'>
        <div className='mx-auto container pt-4'>
          <div className='lg:flex  justify-between '>
            <div className='flex flex-col  md:pt-32'>
              <div>
                <div className='text-center  leading-loose text-[#FFFFFF]   font-tamil003'>
                  <div className='flex justify-end'>
                    <img src={homeherostar} alt='' />
                  </div>
                  <p className='text-center  font-tamil003 text-[#FFFFFF] font-medium text-lg md:text-3xl  md:px-20'>
                    ஏழாம் தூதனுடைய &nbsp;
                    <span className='text-[#EBB34A]'>
                      சத்தத்தின் நாட்களிலே அவன்
                    </span>
                  </p>
                  <p className='text-lg md:text-3xl pt-3'>
                    <span className='text-[#EBB34A]'>
                      எக்காளம் ஊதப்போகிறபோது &nbsp;
                    </span>
                    தேவரகசியம் நிறைவேறும்
                  </p>
                </div>
                <div className='flex justify-start'>
                  <img src={homeherostar} alt='' />
                </div>
                <div className='hidden md:block'>
                  <img className='img-fluid' src={homeherobook} alt='' />
                </div>
                <div className='hidden md:block'>
                  <div className='flex   justify-center pt-10  '>
                    <button
                      onClick={() => navigate("/layout/bible")}
                      className='py-2 text-center uppercase text-xl font-bold  bg-[#EBB34A] rounded-md text-[#0B0C0D] border-0 w-1/2'>
                      bible
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex h-full'>
              <img alt='' className='h-full img-fluid ' src={homehero1} />
            </div>
          </div>
        </div>

        <div className='container mx-auto py-5 md:py-16'>
          <div className='flex justify-end px-3'>
            <img src={homeherostar} alt='' />
          </div>
          <p className='text-center text-xl lg:3xl xl:text-4xl leading-normal  md:leading-loose text-[#FFFFFF]   font-tamil003'>
            <p className='text-center  font-tamil003 text-[#FFFFFF] font-medium '>
              ராஜ்யத்தினுடைய இந்தச் சுவிசேஷம் பூலோகமெங்குமுள்ள சகல ஜாதிகளுக்கும்
            </p>
            சாட்சியாகப் பிரசங்கிக்கப்படும், அப்போது முடிவு வரும்.
          </p>
          <div className='flex justify-between items-center px-3 mt-4'>
            <img src={homeherostar} alt='' />
            <div className='text-[#E7B051] text-xl font-tamil003 lg:text-3xl xl:text-4xl'>
              மத்தேயு 24:14
            </div>
          </div>
        </div>
      </div>
      {/* Download Section */}
      <div className=' bg-[#0B0C0D] min-h-[80vh] py-4 md:pt-10 w-full  '>
        <div className='grid items-center md:gap-10 grid-cols-1 md:grid-cols-2'>
          <div className=''>
            <img src={download} alt='' className=' w-full img-fluid' />
          </div>
          <p className='font-tamil003 text-center leading-loose'>
            <p className='text-[#FFFFFF] leading-7 font-readux  text-lg xl:text-3xl md:text-2xl '>
              The Table Tamil
              <br />
              <br />
              <span className=' font-readux font-bold'> Mobile App </span>
              <br />
            </p>

            <p className='pt-6 md:pt-14'>
              <button
                style={{ border: "1px solid #EBB34A" }}
                className='py-2 px-5 text-center font-readux uppercase text-xl font-bold text-[#EBB34A] bg-transparent rounded-md  '>
                DOWNLOAD APP
              </button>
            </p>
          </p>
        </div>
      </div>

      {/* All Books */}
      <Manna />
      {/* varuma vardaha ???? */}

      <main className='min-h-[50vh] bg-[#0B0C0D] py-6 md:py-20'>
        <div className='container mx-auto'>
          <div className='flex items-center px-3 justify-between'>
            <div className='text-lg  md:text-3xl font-readux text-[#FFFFFF]'>
              All Libraries
            </div>
            <div></div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3   md:gap-4'>
            <div onClick={() => navigate("/newbooks")} className=' py-5 px-5'>
              <div className='relative hover:opacity-60 transition-opacity duration-300'>
                <h6 className='text-[#FFFFFF] text-xl font-readux'>
                  New Books
                </h6>
                <img
                  className='w-full'
                  style={{ height: "250px" }}
                  src={sp1}
                  alt=''
                />
                <div className='view-button absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                  <button className=' border-2 text-white border-[#EBB34A] bg-black/50 z-10  font-bold py-2 px-4 rounded'>
                    View All
                  </button>
                </div>
                <h1 className='text-xl text-[#FFFFFF] font-readux mt-4'></h1>
              </div>
              <div className=''>
                <p className='text-sm md:text-xl text-[#FFFFFF]  font-tamil003'>
                  நமது தமிழ் மொழியில் மொழிபெயர்க்கப்படுகின்ற புதிய செய்தி
                  புத்தகங்கள்.
                </p>
              </div>
            </div>
            <div
              onClick={() => navigate("/publishedbooks")}
              className='py-5 px-5'>
              <div className='relative hover:opacity-60 transition-opacity duration-300'>
                <h6 className='text-[#FFFFFF] text-xl font-readux'>
                  Published Books
                </h6>
                <img
                  className='w-full'
                  style={{ height: "250px" }}
                  src={sp2}
                  alt=''
                />
                <div className='view-button absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                  <button className=' border-2 text-white border-[#EBB34A] bg-black/50 z-10  font-bold py-2 px-4 rounded'>
                    View All
                  </button>
                </div>
                {/* <h1 className='text-xl text-[#FFFFFF] font-readux mt-4'>
                  The First Seal
                </h1> */}
              </div>
              <div className=''>
                {/* <p
                  style={{ color: "rgba(255, 255, 255, 0.46)" }}
                  className='text-xs md:text-base  font-readux'>
                  "The First Seal," a gripping thriller unfolds as <br />
                  ancient prophecies and hidden clues converge,
                </p> */}
              </div>
            </div>
            <div
              onClick={() => navigate("/specialbooks")}
              className='py-5 px-5'>
              <div className='relative hover:opacity-60 transition-opacity duration-300'>
                <h6 className='text-[#FFFFFF] text-xl font-readux'>
                  Special Books
                </h6>
                <img
                  className='w-full'
                  style={{ height: "250px" }}
                  src={sp3}
                  alt=''
                />
                <div className='view-button absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                  <button className=' border-2 text-white border-[#EBB34A] bg-black/50 z-10  font-bold py-2 px-4 rounded'>
                    View All
                  </button>
                </div>
                {/* <h1 className='text-xl text-[#FFFFFF] font-readux mt-4'>
                  The First Seal
                </h1> */}
              </div>
              <div className=''>
                {/* <p
                  style={{ color: "rgba(255, 255, 255, 0.46)" }}
                  className='text-xs md:text-base  font-readux'>
                  "The First Seal," a gripping thriller unfolds as <br />
                  ancient prophecies and hidden clues converge,
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* varuma vardaha ???? */}

      {/* varuma vardaha ???? */}

      <main className='min-h-[50vh] bg-[#0B0C0D] py-6 md:py-20'>
        <div className='container mx-auto'>
          <div className='flex items-center px-3 justify-between'>
            <div className='text-lg  md:text-3xl font-readux text-[#FFFFFF]'>
              All Gallery
            </div>
            <div></div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3   md:gap-4'>
            <div
              onClick={() => navigate("/layout/songbooks")}
              className=' py-5 px-5'>
              <div className='relative hover:opacity-60 transition-opacity duration-300'>
                <h6 className='text-[#FFFFFF] text-xl font-readux'>
                  Song Book
                </h6>
                <img
                  className='w-full'
                  style={{ height: "250px" }}
                  src={sp5}
                  alt=''
                />
                <div className='view-button absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                  <button className=' border-2 text-white border-[#EBB34A] bg-black/50 z-10  font-bold py-2 px-4 rounded'>
                    View All
                  </button>
                </div>
                <h1 className='text-xl text-[#FFFFFF] font-readux mt-4'></h1>
              </div>
              {/* <div className=''>
                <p className='text-sm md:text-xl text-[#FFFFFF]  font-tamil003'>
                  நமது தமிழ் மொழியில் மொழிபெயர்க்கப்படுகின்ற புதிய செய்தி
                  புத்தகங்கள்.
                </p>
              </div> */}
            </div>
            <div
              onClick={() => navigate("/tamildownload-table")}
              className='py-5 px-5'>
              <div className='relative hover:opacity-60 transition-opacity duration-300'>
                <h6 className='text-[#FFFFFF] text-xl font-readux'>
                  Message Sermon Tam
                </h6>
                <img
                  className='w-full'
                  style={{ height: "250px" }}
                  src={spp1}
                  alt=''
                />
                <div className='view-button absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                  <button className=' border-2 text-white border-[#EBB34A] bg-black/50 z-10  font-bold py-2 px-4 rounded'>
                    View All
                  </button>
                </div>
                {/* <h1 className='text-xl text-[#FFFFFF] font-readux mt-4'>
                  The First Seal
                </h1> */}
              </div>
              <div className=''>
                {/* <p
                  style={{ color: "rgba(255, 255, 255, 0.46)" }}
                  className='text-xs md:text-base  font-readux'>
                  "The First Seal," a gripping thriller unfolds as <br />
                  ancient prophecies and hidden clues converge,
                </p> */}
              </div>
            </div>
            <div
              onClick={() => navigate("/englishdownload-table")}
              className='py-5 px-5'>
              <div className='relative hover:opacity-60 transition-opacity duration-300'>
                <h6 className='text-[#FFFFFF] text-xl font-readux'>
                  Message Sermon Eng
                </h6>
                <img
                  className='w-full'
                  style={{ height: "250px" }}
                  src={spp3}
                  alt=''
                />
                <div className='view-button absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                  <button className=' border-2 text-white border-[#EBB34A] bg-black/50 z-10  font-bold py-2 px-4 rounded'>
                    View All
                  </button>
                </div>
                {/* <h1 className='text-xl text-[#FFFFFF] font-readux mt-4'>
                  The First Seal
                </h1> */}
              </div>
              {/* <div className=''>
                <p
                  style={{ color: "rgba(255, 255, 255, 0.46)" }}
                  className='text-xs md:text-base  font-readux'>
                  "The First Seal," a gripping thriller unfolds as <br />
                  ancient prophecies and hidden clues converge,
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </main>

      {/* varuma vardaha ???? */}

      {/* Location Section */}
      <div className=' bg-[#0B0C0D] min-h-screen py-6 md:py-20  w-full  '>
        <div className='grid items-center md:px-20 gap-10 grid-cols-1  lg:grid-cols-2'>
          <div className='px-2'>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1944.1192545644676!2d78.98810854969123!3d12.956584193616685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bad6b97a8f0151b%3A0x7da287d9a595d97c!2sK%20V%20Kuppam!5e0!3m2!1sen!2sin!4v1741254808318!5m2!1sen!2sin'
              height='600'
              className='w-full rounded-2xl'
              style={{ border: 0 }}
              frameBorder='0'
              allowFullScreen
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'></iframe>
          </div>
          <div className='px-2'>
            <div
              style={{ border: "1px solid #EBB34A" }}
              className='p-2 md:p-5  rounded-md'>
              <div className='flex py-3 items-center gap-2 md:gap-5'>
                <div>
                  <Button
                    size='icon'
                    type='button'
                    style={{
                      borderRadius: "50%",
                      border: "1px solid #EBB34A",
                    }}>
                    <Phone className='text-[#EBB34A]  ' />
                  </Button>
                </div>
                <div className='text-base md:text-xl lg:text-2xl text-[#FFFFFF] font-readux'>
                  Call us - +91-9940808951
                </div>
              </div>
              <div className='flex py-3 items-center  gap-2 md:gap-5'>
                <div>
                  <Button
                    size='icon'
                    type='button'
                    style={{
                      borderRadius: "50%",
                      border: "1px solid #EBB34A",
                    }}>
                    <Mail className='text-[#EBB34A] ' />
                  </Button>
                </div>
                <div className='text-base md:text-xl text-wrap lg:text-2xl text-[#FFFFFF] font-readux'>
                  Email - thelastvoiceministry@gmail.com
                </div>
              </div>
              <div className='flex py-3 items-center gap-2 md:gap-5'>
                <div>
                  <Button
                    size='icon'
                    type='button'
                    style={{
                      borderRadius: "50%",
                      border: "1px solid #EBB34A",
                    }}>
                    <MapPin className='text-[#EBB34A]  ' />
                  </Button>
                </div>
                <div className='text-base md:text-xl lg:text-2xl leading-relaxed text-[#FFFFFF] font-readux'>
                  Location- 6/1, Andal Nagar, Veppanganeri, K V Kuppam (post)
                  Vellore - 632201.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/addchurch")}
              style={{ border: "1px solid #EBB34A" }}
              className='mt-5 md:mt-14 py-3  font-readux uppercase w-full bg-transparent text-base md:text-xl text-[#E7B051] rounded-md '>
              END TIME CHURCH ADDRESS
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </>
  );
}

export default Homepage;
