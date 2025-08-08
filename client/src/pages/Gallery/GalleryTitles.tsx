import Navbar from "@/components/Navbar/Navbar";
import { Card, CardHeader } from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const GalleryTitles = () => {
  const navigate = useNavigate();
  const { data: imagetitles } = useQuery({
    queryKey: ["imagetitles"],
    queryFn: () => _axios.get("/api/gallery/imagetitles"),
  });

  return (
    <>
      <Navbar />

      <main className=' bg-[#0B0C0D]'>
        <div className='py-4 text-lg md:text-2xl font-california text-center text-[#EBB34A]'>
          <h1>Gallery</h1>
        </div>
        <div className='h-[calc(100vh-140px)] overflow-y-scroll '>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-3 md:px-10 py-5 md:py-20'>
            {imagetitles?.data?.data?.length > 0 ? (
              imagetitles?.data?.data?.map((imagetitle: any) => (
                <Card
                  key={imagetitle?.id}
                  onClick={() =>
                    navigate(
                      `/gallery?type=images&imageId=${imagetitle?.id}&imagetitle=${imagetitle?.title}`
                    )
                  }
                  className='cursor-pointer border-none hover:bg-[#EBB34A] transition-all duration-300'>
                  <CardHeader>
                    <div className='font-madefuture'>{imagetitle?.title}</div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <p className='text-[#FFFFFF] font-readux text-center'>
                No image Found
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default GalleryTitles;
