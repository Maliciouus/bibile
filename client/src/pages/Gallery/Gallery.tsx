import Navbar from "@/components/Navbar/Navbar";
import share from "/assets/gallery/share.svg";
import download from "/assets/gallery/download.svg";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useInfiniteQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import { toast } from "sonner";
import { useState } from "react";
import { RWebShare } from "react-web-share";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Gallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const imageId = searchParams.get("imageId");
  const imagetitle = searchParams.get("imagetitle");
  const [openModal, setOpenModal] = useState(false);
  const [viewimage, setViewimage] = useState<any>({
    id: "",
    imagename: "",
    imagepath: "",
    imageurl: "",
  });

  const {
    data: images,
    isLoading: isimagesLoading,
    isError: isimagesError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["gallery"],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/gallery/getimages?titleId=${imageId}&page=${pageParam}&limit=20`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 20 ? nextPage : undefined;
    },
  });

  console.log(images);

  const handleDownload = async () => {
    try {
      const response = await _axios.post(
        `/api/gallery/downloadimage?imageId=${viewimage.id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const awsLink = response.data;
      const link = document.createElement("a");
      link.href = awsLink;
      link.setAttribute("download", `${viewimage.imagename}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast.error("Failed to download image");
    }
  };

  if (isimagesLoading)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );
  if (isimagesError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Error</p>
      </div>
    );

  return (
    <>
      <Navbar />
      <main className='bg-[#0B0C0D]'>
        <div className='flex justify-between'>
          <div className='px-2 md:px-6 pt-3'>
            <Button
              onClick={() => navigate(-1)}
              className='bg-[#EBB34A] hover:bg-[#EBB34A]/90'
              size='icon'>
              <ArrowLeft className='text-[#0B0C0D]' />
            </Button>
          </div>
          <h1 className='text-[#EBB34A] font-california text-lg text-center py-3 md:text-2xl'>
            {imagetitle}
          </h1>
          <div></div>
        </div>

        <div className='h-[calc(100vh-131px)] px-3 container mx-auto py-5 galleryscroll overflow-y-scroll'>
          {images?.pages?.[0]?.data?.length === 0 ? (
            <div className='flex justify-center items-center h-full'>
              <p className='text-white text-xl'>No images found</p>
            </div>
          ) : (
            <div className='grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
              {/* {images?.data?.data?.map((image: any) => (
              ))} */}
              {images?.pages?.flatMap((page) =>
                page?.data?.map((image: any) => (
                  <div key={image?.id} className='flex flex-col h-full'>
                    <div className='relative aspect-square'>
                      <img
                        src={image?.imageurl}
                        onClick={() => {
                          setOpenModal(true);
                          setViewimage(image);
                        }}
                        className='rounded-xl cursor-pointer w-full h-full object-cover border border-[#EBB34A]'
                        alt={image?.imagename}
                      />
                    </div>
                    <div className='mt-3 flex flex-col flex-grow'>
                      <div className='text-center'>
                        <h1 className='text-[#EBB34A] capitalize font-madefuture break-words line-clamp-1'>
                          {image?.title}
                        </h1>
                      </div>
                      <div className='flex-grow overflow-y-auto max-h-24'>
                        <p className='text-white font-readux capitalize text-center break-words'>
                          {image?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <div className='flex py-2 justify-center'>
            <Button
              className='bg-[#EBB34A] hover:bg-[#EBB34A]/90 text-[#0B0C0D]'
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}>
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load More"
                : "No more images"}
            </Button>
          </div>
        </div>

        <Dialog open={openModal} onOpenChange={setOpenModal} modal={false}>
          <DialogContent
            onClick={(e: any) => e.stopPropagation()}
            className=' bg-transparent   border-0 sm:max-w-[425px]'>
            <div className='flex justify-center'>
              <img
                src={viewimage?.imageurl}
                className='rounded-xl h-[100%] w-[100%]'
                alt={viewimage?.imagename}
              />
            </div>

            <div className='flex gap-8 justify-center mt-1 md:mt-5'>
              <div>
                <RWebShare
                  data={{
                    url: `${viewimage?.imageurl}`,
                    title: viewimage.imagename,
                  }}>
                  <img
                    src={share}
                    className='cursor-pointer h-11 w-11'
                    alt='Share'
                  />
                </RWebShare>
              </div>
              <div>
                <img
                  onClick={handleDownload}
                  src={download}
                  className='cursor-pointer h-11 w-11'
                  alt='Download'
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default Gallery;
