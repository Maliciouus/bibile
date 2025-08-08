import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import imagegroup from "/assets/AboutPage/aboutimages.png";
import abouthero from "/assets/AboutPage/aboutushero.png";
import homeherostar from "/assets/Homepage/homeherostar.svg";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <Navbar />

      <div className='bg-[#0B0C0D] min-h-[80vh] overflow-x-hidden text-white'>
        <div className='  md:pt-20  sm:px-2 md:px-10 xl:px-20'>
          <div className='flex flex-col lg:flex-row gap-4 md:gap-6  xl:gap-20'>
            <div className='flex-shrink-0 '>
              <div className='flex flex-col'>
                <img alt='' className='h-auto max-w-full' src={abouthero} />
                <div className='w-full text-center py-4 text-lg md:text-2xl text-[#E7B051] font-readux font-bold'>
                  <span className='font-medium'>Pastor :</span> N. DAVID
                </div>
              </div>
            </div>
            <div className='sm:mt-5 md:mt-10'>
              <div className=' text-base md:text-2xl text-center md:text-left font-bold font-nirmala text-[#FFFFFF]'>
                “இயேசுகிறிஸ்து நேற்றும் இன்றும் என்றும் மாறாதவராயிருக்கிறார்.
                எபி: 13. 8.”
              </div>
              <p className='pt-5 text-[#FFFFFF] px-3 font-nirmala   text-xs md:text-base leading-loose md:leading-loose tracking-wider'>
                வேதாகம வரலாற்றின்படி, எங்கெல்லாம் ஒரு பெரிய ஆபத்து, அழிவு வர
                இருந்ததோ அங்கெல்லாம், நம் தேவன் ஒரு தீர்க்கத்தரிசியை எழுப்பி தம்
                மக்களை எச்சரித்து காப்பாற்றி பாதுகாத்து வந்துள்ளார். அதுபோல்
                மல்கியா நான்காம் அதிகாரத்திலும் சொல்லப்பட்ட அழிவு நாளுக்கு
                முன்பாக எலியா தீர்க்கதரிசியை அனுப்புவேன் என்று வாக்கு பண்ணின
                தேவன் அவரை நாம் வாழும் நூற்றாண்டில் அனுப்பி உள்ளார். அவர்தான்
                தீர்க்கதரிசி வில்லியம் மரியன் பிரன்ஹாம். (மல்கியா: – 4. வெளி: -
                10:6,7). அவரை நாம் நேரில் காணாவிட்டாலும் அவருடைய குரலை
                கேட்கும்படி கர்த்தர் கிருபை செய்தார். அவர் மூலமாக கர்த்தர் பேசிய
                அனைத்து செய்திகளையும் இந்த வலைதளத்தின் வாயிலாக வாசிக்கவும்,
                கேட்கவும், தேடி ஆராய்ந்து பார்த்து பிரயோஜனப்படவும் உருவாக்கி
                உள்ளோம். இது நம் தமிழ் மொழியில் மட்டும் வெளியிட்டுள்ளோம் இன்னும்
                ஏனைய மொழியிலும் கொண்டுவர நாங்கள் எடுக்கும் ஒவ்வொரு
                முயற்சியையும், பிரயாசத்தையும் கர்த்தர் வாய்க்கப் பண்ணும்படி
                எங்களுக்காக ஜெபித்துக் கொள்ளுங்கள். கர்த்தர் உங்கள் யாவரையும்
                ஆசீர்வதிப்பாராக. ஆமென்.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* images group */}
      <div className=' bg-[#0B0C0D] min-h-[80vh] pt-4 md:pt-10 w-full  '>
        <div className='grid items-center  md:px-20  md:gap-10 lg:grid-cols-2'>
          <p className='font-readux text-center leading-loose '>
            <p
              style={{ lineHeight: "1.5" }}
              className='text-[#FFFFFF] font-normal  text-lg xl:text-3xl md:text-2xl '>
              The Table Tamil
              <br />
              <span className=' font-bold'> Mobile App </span>
              <br />
            </p>

            <p className='pt-6 md:pt-14'>
              <button
                style={{ border: "1px solid #EBB34A" }}
                className='py-2 px-5 text-center font-readux uppercase text-xl font-bold text-[#EBB34A]     bg-transparent rounded-md  '>
                DOWNLOAD APP
              </button>
            </p>
          </p>
          <div className='hero-bg hero'>
            <div className='flex container mx-auto justify-end'>
              <img src={homeherostar} alt='' />
            </div>
            <img src={imagegroup} alt='' className='img-fluid w-full px-6' />
          </div>
        </div>
      </div>

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
};

export default About;
