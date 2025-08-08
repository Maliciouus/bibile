import React, { useRef, useEffect } from "react";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import { ArrowLeft } from "lucide-react";

const NewGallery: React.FC = () => {
  const lightGalleryRef = useRef<any>(null);
  const [searchParams] = useSearchParams();
  const imageId = searchParams.get("imageId");
  const imagetitle = searchParams.get("imagetitle");
  const navigate = useNavigate();
  const onInit = () => {
    console.log("lightGallery has been initialized");
  };

  const {
    data: images,
    isLoading: isimagesLoading,
    isError: isimagesError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["gallery", imageId],
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

  useEffect(() => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.refresh();
    }
  }, [images]);

  return (
    <>
      <Navbar />

      <div className='bg-[#0B0C0D] p-2  h-[90vh] overflow-y-auto  md:p-10'>
        <div className='flex justify-between py-4'>
          <div className=''>
            <Button
              onClick={() => navigate("/gallery")}
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
        {isimagesLoading && (
          <div className='flex h-[75vh] items-center justify-center'>
            <CircularProgressIndicator />
          </div>
        )}
        {isimagesError && (
          <div className='flex h-[75vh] items-center justify-center'>
            <p className='text-red-500 text-xl'>Error</p>
          </div>
        )}

        {images && (
          <div className='gallery-container overflow-y-auto'>
            <LightGallery
              // ref={lightGalleryRef}
              onInit={onInit}
              speed={500}
              plugins={[lgThumbnail, lgZoom]}
              selector='.gallery-item'>
              <div className='grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {images.pages.flatMap((page) =>
                  page.data.map((image: any) => (
                    <a
                      key={image.id}
                      className='gallery-item'
                      data-src={image.imageurl}
                      data-sub-html={`<h4>${image.title || ""}</h4><p>${
                        image.description || ""
                      }</p>`}>
                      <img
                        alt={image.title || "Gallery Image"}
                        src={image.imageurl}
                        className='w-full h-full object-cover'
                      />
                    </a>
                  ))
                )}
              </div>
            </LightGallery>
          </div>
        )}

        {hasNextPage && !isimagesLoading && (
          <div className='flex justify-center my-4'>
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
        )}
      </div>
    </>
  );
};

export default NewGallery;
