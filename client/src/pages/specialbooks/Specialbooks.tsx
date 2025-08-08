import Navbar from "@/components/Navbar/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import TamilSpecialbookList from "../../components/tamilSPbooks/TamilSpecialbookList";
import EnglishSpecialbookList from "@/components/englishSPbooks/EnglishSpecialbookList";
const Specialbooks = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <Navbar />
      <div className=' bg-[#0B0C0D]'>
        <div className='py-5 px-5'>
          <Tabs defaultValue='TamilBooks' className=''>
            <TabsList className='grid bg-transparent px-1  md:px-10  gap-3  grid-cols-2'>
              <TabsTrigger
                className='bg-[#2B2B2B] border-2 border-[#EBB34A] text-lg font-readux py-3 text-[#FFFFFF]'
                value='TamilBooks'>
                Tamil Books
              </TabsTrigger>
              <TabsTrigger
                className='bg-[#2B2B2B] border-2 border-[#EBB34A] py-3 text-lg font-readux text-[#FFFFFF]'
                value='EnglishBooks'>
                English Books
              </TabsTrigger>
            </TabsList>
            <div className='pt-10'>
              <TabsContent
                className='w-full h-[calc(100vh-205px)] px-1  md:px-10 galleryscroll  overflow-y-scroll'
                value='TamilBooks'>
                <TamilSpecialbookList />
              </TabsContent>
              <TabsContent
                className='w-full h-[calc(100vh-205px)] px-1  md:px-10 galleryscroll  overflow-y-scroll'
                value='EnglishBooks'>
                <EnglishSpecialbookList />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default Specialbooks;
