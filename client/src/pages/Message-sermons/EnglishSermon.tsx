import Navbar from "@/components/Navbar/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
const EnglishSermon = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  // const [searchQuery, setSearchQuery] = useState("");
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRefs = useRef<any>({});
  const { data, isLoading, isError } = useQuery({
    queryKey: ["getallEngSermon", pagination.page, pagination.limit],
    queryFn: () =>
      _axios.get(
        `/api/englishtable/getall?page=${pagination.page}&limit=${pagination.limit}`
      ),
  });

  // const handleSearch = (query: any) => {
  //   if (query) {
  //     setSearchQuery(query);
  //     setPagination({
  //       page: 1,
  //       limit: 10,
  //       total: 0,
  //     });
  //   } else {
  //     setSearchQuery("");
  //   }
  // };
  const toggleAudio = (id: any) => {
    if (playingAudio === id) {
      audioRefs.current[id].pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        audioRefs.current[playingAudio].pause();
      }
      audioRefs.current[id].play();
      setPlayingAudio(id);
    }
  };

  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data?.data?.totalCount?.total,
      }));
    }
  }, [data]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  const totalPages = useMemo(
    () => Math.ceil(pagination.total / pagination.limit),
    [pagination.total, pagination.limit]
  );

  const handlePDFView = (pdfurl: any) => {
    const googleDocsViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(
      pdfurl
    )}&embedded=true`;
    window.open(googleDocsViewer, "_blank");
  };

  const handleDownload = (url: any) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (isError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-gray-300'>Some thing went wrong</div>
      </div>
    );

  return (
    <main>
      <Navbar />
      <div className='min-h-[91vh] bg-[#0B0C0D]'>
        <div className='container mx-auto'>
          <div className='text-center px-3 font-readux text-xl py-4 font-bold text-[#EBB34A] '>
            <h1>MESSAGE SERMON</h1>
          </div>

          {/* tables */}
          <div className=''>
            <div className=' rounded-md border border-[#EBB34A]'>
              <Table className=' rounded-lg wo'>
                <TableHeader>
                  <TableRow className='hover:bg-[#0B0C0D] '>
                    {/* <TableHead className='text-[#EBB34A]  font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      S.No
                    </TableHead> */}
                    <TableHead className='text-[#EBB34A] text-center text-nowrap font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      Title
                    </TableHead>

                    <TableHead className='text-[#EBB34A] text-center text-nowrap  font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      ENG MP3
                    </TableHead>

                    <TableHead className='text-[#EBB34A] text-center text-nowrap  font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      ENG PDF
                    </TableHead>
                    <TableHead className='text-[#EBB34A] text-center text-nowrap  font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      WRAPPER
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='text-center text-[#FFFFFF]  text-xl '>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data?.data?.map((sermon: any) => (
                      <TableRow key={sermon?.id}>
                        <TableCell
                          title={sermon?.title}
                          className='text-ellipsis text-[#FFFFFF] font-bold  py-2 max-w-[200px] truncate'>
                          {sermon?.title}
                        </TableCell>
                        <TableCell className='text-center'>
                          {sermon?.englishAudiourl ? (
                            <>
                              <audio
                                ref={(el: any) =>
                                  (audioRefs.current[sermon.id] = el)
                                }
                                src={sermon.englishAudiourl}
                                className='hidden'
                              />

                              <div className='flex items-center justify-center gap-5 '>
                                <Icon
                                  onClick={() => toggleAudio(sermon.id)}
                                  icon={
                                    playingAudio === sermon.id
                                      ? "mdi:pause-circle"
                                      : "cil:audio-spectrum"
                                  }
                                  className='h-7 w-7 font-bold  cursor-pointer text-white'
                                />
                                <Icon
                                  onClick={() =>
                                    handleDownload(sermon?.englishAudiourl)
                                  }
                                  icon={"iconoir:download-square-solid"}
                                  className='h-7 w-7 font-bold  cursor-pointer text-[#EBB34A]'
                                />
                              </div>
                            </>
                          ) : (
                            <div className='text-red-400 text-center'>
                              No Audio
                            </div>
                          )}
                        </TableCell>

                        <TableCell className='text-center py-2'>
                          {sermon?.englishPdfurl ? (
                            <div className='flex items-center justify-center gap-5 '>
                              <Icon
                                onClick={() => {
                                  handlePDFView(sermon?.englishPdfurl);
                                }}
                                icon={"mi:document"}
                                className='h-7 w-7 font-bold  cursor-pointer text-white'
                              />
                              <Icon
                                onClick={() => {
                                  handleDownload(sermon?.englishPdfurl);
                                }}
                                icon={"iconoir:download-square-solid"}
                                className='h-7 w-7 font-bold text-[#EBB34A]  cursor-pointer '
                              />
                            </div>
                          ) : (
                            <div className='text-gray-400 text-center'>
                              No PDF
                            </div>
                          )}
                        </TableCell>
                        <TableCell className='text-center py-2'>
                          {sermon?.wrapperurl ? (
                            <div className='flex items-center justify-center gap-5 '>
                              <Icon
                                onClick={() => {
                                  handlePDFView(sermon?.wrapperurl);
                                }}
                                icon={"mi:document"}
                                className='h-7 w-7 font-bold  cursor-pointer text-white'
                              />
                              <Icon
                                onClick={() => {
                                  handleDownload(sermon?.wrapperurl);
                                }}
                                icon={"iconoir:download-square-solid"}
                                className='h-7 w-7 font-bold text-[#EBB34A]  cursor-pointer '
                              />
                            </div>
                          ) : (
                            <div className='text-gray-400 text-center'>
                              No PDF
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* {data?.data?.data?.length > 0 && (
              <div className='flex justify-between'>
                <Pagination className='mt-6 mb-3 justify-end'>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href='#'
                        onClick={() => {
                          if (pagination.page === 1) return;
                          handlePageChange(pagination.page - 1);
                        }}
                        className={` text-white ${
                          pagination.page === 1
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer opacity-100"
                        }`}
                      />
                    </PaginationItem>
                    {pagination.page > 3 && (
                      <PaginationItem className='hidden md:block'>
                        <PaginationLink
                          className='bg-white'
                          href='#'
                          onClick={() => handlePageChange(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    {pagination.page > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis className='text-white' />
                      </PaginationItem>
                    )}
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      const pageNumber = pagination.page + i - 1;
                      if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href='#'
                              className='bg-white'
                              isActive={pageNumber === pagination.page}
                              onClick={() => handlePageChange(pageNumber)}>
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    {pagination.page < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis className='text-white' />
                      </PaginationItem>
                    )}
                    {pagination.page < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink
                          className='bg-white'
                          href='#'
                          onClick={() => handlePageChange(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href='#'
                        onClick={() => {
                          if (pagination.page === totalPages) return;
                          handlePageChange(pagination.page + 1);
                        }}
                        className={` text-white  ${
                          pagination.page === totalPages
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer opacity-100"
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )} */}
            {data?.data?.data?.length > 0 && (
              <div className='flex justify-between'>
                <Pagination className='mt-6 mb-3 justify-end'>
                  <PaginationContent>
                    {/* Previous Button */}
                    <PaginationItem>
                      <PaginationPrevious
                        href='#'
                        onClick={() => {
                          if (pagination.page === 1) return;
                          handlePageChange(pagination.page - 1);
                        }}
                        className={` text-white ${
                          pagination.page === 1
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer opacity-100"
                        }`}
                      />
                    </PaginationItem>

                    {/* First Page Link */}
                    {pagination.page > 2 && (
                      <PaginationItem className='hidden md:block'>
                        <PaginationLink
                          className='bg-white dark:bg-black text-sm md:text-base px-1 py-2 md:px-2 md:py-3'
                          href='#'
                          onClick={() => handlePageChange(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Ellipsis Before */}
                    {pagination.page > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis className='text-white' />
                      </PaginationItem>
                    )}

                    {/* Current Page and Next Page */}
                    {Array.from({ length: 2 }, (_, i) => {
                      const pageNumber = pagination.page + i;
                      if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href='#'
                              className='bg-white dark:bg-black text-sm md:text-base px-1 py-2 md:px-2 md:py-3'
                              isActive={pageNumber === pagination.page}
                              onClick={() => handlePageChange(pageNumber)}>
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    {/* Ellipsis After */}
                    {pagination.page < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis className='text-white' />
                      </PaginationItem>
                    )}

                    {/* Last Page Link */}
                    {pagination.page < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationLink
                          className='bg-white dark:bg-black text-sm md:text-base px-1 py-2 md:px-2 md:py-3'
                          href='#'
                          onClick={() => handlePageChange(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Next Button */}
                    <PaginationItem>
                      <PaginationNext
                        href='#'
                        onClick={() => {
                          if (pagination.page === totalPages) return;
                          handlePageChange(pagination.page + 1);
                        }}
                        className={` text-white  ${
                          pagination.page === totalPages
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer opacity-100"
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default EnglishSermon;
