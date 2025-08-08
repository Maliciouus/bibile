import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const TamilMessageSermon = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [playingAudio, setPlayingAudio] = useState(null);
  const [playingEngtoTamAudio, setEngToTamPlayingAudio] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audio, setAudio] = useState<any>(null);
  const [messagePdf, setMessagePdf] = useState<any>(null);
  const [WrapperPdf, setWrapperPdf] = useState<any>(null);
  const [bookID, setBookID] = useState<any>(null);
  const [sermon, setSermon] = useState<any>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<any>("");
  const audioRefs = useRef<any>({});
  const TamToEngaudioRefs = useRef<any>({});
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["getallsermons", pagination.page, pagination.limit, searchQuery],
    queryFn: () =>
      _axios.get(
        `/api/tamiltable/getall?page=${pagination.page}&limit=${pagination.limit}&search=${searchQuery}`
      ),
  });

  const handleSearch = (query: any) => {
    if (query) {
      setSearchQuery(query);
      setPagination({
        page: 1,
        limit: 8,
        total: 0,
      });
    } else {
      setSearchQuery("");
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
  const toggleEngToTamAudio = (id: any) => {
    if (playingEngtoTamAudio === id) {
      TamToEngaudioRefs.current[id].pause();
      setEngToTamPlayingAudio(null);
    } else {
      if (playingEngtoTamAudio) {
        TamToEngaudioRefs.current[playingEngtoTamAudio].pause();
      }
      TamToEngaudioRefs.current[id].play();
      setEngToTamPlayingAudio(id);
    }
  };
  const { mutate: uploadMutate, isPending } = useMutation({
    mutationFn: () => {
      return _axios.post(
        `/api/tamiltable/upload`,
        {
          id: bookID,
          tamilpdf: messagePdf,
          wrapper: WrapperPdf,
          eng_to_tam_audio: audio,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("File uploaded successfully");
        refetch();
        setAudio(null);
        setMessagePdf(null);
        setWrapperPdf(null);
        setBookID(null);
        setIsModalOpen(false);
      }
    },
    // @ts-ignore
    onError: (error: any) => {
      toast.error("Something went wrong");
    },
  });

  const { mutate: handleDelete } = useMutation<any>({
    mutationFn: (type: any) => {
      return _axios.delete(
        `/api/tamiltable/delete?sermonId=${sermon.id}&type=${type}`
      );
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("File deleted successfully");
        setDeleteType("");
        setIsDeleteModalOpen(false);
        refetch();
        setIsModalOpen(false);
      }
    },
    //@ts-ignore
    onError: (error: any) => {
      toast.error("Something went wrong");
    },
  });

  if (isError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Some thing went wrong</div>
      </div>
    );

  return (
    <>
      <div className='p-5'>
        <div className='flex gap-2 justify-between'>
          <div className='flex flex-col gap-2 items-start'>
            <h1 className='text-lg font-semibold md:text-2xl'>
              Tamil Message Sermons
            </h1>
            <div className='text-xs font-500 text-slate-400'>
              Manage your Tamil Message Sermons
            </div>
          </div>

          <div>
            <Input
              id='search'
              type='text'
              value={searchQuery}
              onChange={(e: any) => {
                handleSearch(e.target.value);
              }}
              className='  rounded-lg  placeholder:font-bold focus-visible:ring-transparent'
              placeholder='Search...'
            />
          </div>
        </div>
        <div className='overflow-x-hidden pt-2 overflow-y-auto max-h-[70vh]'>
          <Table className='w-full max-w-full border'>
            <TableHeader>
              <TableRow
                style={{ fontSize: "15px", textTransform: "uppercase" }}>
                <TableHead className='text-center'>Title</TableHead>
                <TableHead className='text-center bg-white'>
                  Tamil MP3
                </TableHead>
                <TableHead className='text-center'>Eng - Tamil MP3</TableHead>
                <TableHead className='text-center bg-white'>
                  Tamil PDF
                </TableHead>
                <TableHead className='text-center'>Wrapper</TableHead>
                <TableHead className='text-center'>Upload files</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center text-xl '>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.data?.map((sermon: any) => (
                  <TableRow key={sermon?.id}>
                    <TableCell className='text-ellipsis py-2 max-w-[200px] truncate'>
                      {sermon?.name}
                    </TableCell>
                    <TableCell className='text-center'>
                      {sermon?.audiopathurl ? (
                        <>
                          <audio
                            ref={(el: any) =>
                              (audioRefs.current[sermon.id] = el)
                            }
                            src={sermon.audiopathurl}
                            className='hidden'
                          />
                          <Button
                            onClick={() => toggleAudio(sermon.id)}
                            variant='ghost'
                            size='icon'
                            className='mx-auto'>
                            <Icon
                              icon={
                                playingAudio === sermon.id
                                  ? "mdi:pause-circle"
                                  : "cil:audio-spectrum"
                              }
                              className='h-6 w-6'
                            />
                          </Button>
                        </>
                      ) : (
                        <div className='text-red-400 text-center'>No Audio</div>
                      )}
                    </TableCell>

                    <TableCell className='text-center py-2'>
                      {sermon?.eng_to_tam_audiourl ? (
                        <>
                          <audio
                            ref={(el: any) =>
                              (TamToEngaudioRefs.current[sermon.id] = el)
                            }
                            src={sermon.eng_to_tam_audiourl}
                            className='hidden'
                          />
                          <Button
                            onClick={() => toggleEngToTamAudio(sermon.id)}
                            variant='ghost'
                            size='icon'
                            className='mx-auto'>
                            <Icon
                              icon={
                                playingEngtoTamAudio === sermon.id
                                  ? "mdi:pause-circle"
                                  : "cil:audio-spectrum"
                              }
                              className='h-6 w-6'
                            />
                          </Button>
                        </>
                      ) : (
                        <div className='text-red-400 text-center'>No Audio</div>
                      )}
                    </TableCell>
                    <TableCell className='text-center py-2'>
                      <Button
                        onClick={() => {
                          handlePDFView(sermon?.tamilpdfurl);
                        }}
                        disabled={!sermon?.tamilpdfurl}
                        className={`text-center ${
                          sermon?.tamilpdfurl ? "text-red-600" : ""
                        }`}
                        variant='outline'
                        size='icon'>
                        <Icon className='h-5 w-5' icon={"proicons:pdf"} />
                      </Button>
                    </TableCell>
                    <TableCell className='text-center py-2'>
                      <Button
                        onClick={() => {
                          handlePDFView(sermon?.wrapperurl);
                        }}
                        disabled={!sermon?.wrapperurl}
                        className={`text-center ${
                          sermon?.wrapperurl ? "text-red-600" : ""
                        }`}
                        variant='outline'
                        size='icon'>
                        <Icon className='h-5 w-5' icon={"proicons:pdf"} />
                      </Button>
                    </TableCell>
                    <TableCell className='text-center py-0'>
                      <Button
                        onClick={() => {
                          setBookID(sermon?.id);
                          setIsModalOpen(true);
                          setSermon(sermon);
                        }}
                        className='text-center'
                        variant='outline'
                        size='icon'>
                        <Icon
                          className='h-5 w-5'
                          icon={"icon-park-outline:upload-one"}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {data?.data?.data?.length > 0 && (
          <div className='flex justify-between'>
            <Pagination className='mt-6 justify-end'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={() => {
                      if (pagination.page === 1) return;
                      handlePageChange(pagination.page - 1);
                    }}
                    className={`${
                      pagination.page === 1
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer opacity-100"
                    }`}
                  />
                </PaginationItem>
                {pagination.page > 3 && (
                  <PaginationItem>
                    <PaginationLink
                      href='#'
                      onClick={() => handlePageChange(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}
                {pagination.page > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNumber = pagination.page + i - 1;
                  if (pageNumber > 0 && pageNumber <= totalPages) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href='#'
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
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {pagination.page < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink
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
                    className={`${
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
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent className='h-screen sm:max-w-[600px] !w-[600px]'>
          <SheetHeader>
            <SheetTitle>Upload Message Sermon Files</SheetTitle>
          </SheetHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-1  items-center gap-4'>
              <div>
                <Label htmlFor='audio' className='text-right  mb-3'>
                  Eng to Tam Audio
                </Label>
                {!sermon?.eng_to_tam_audiourl || !sermon?.eng_to_tam_audio ? (
                  <Input
                    id='audio'
                    type='file'
                    accept='audio/*'
                    className='cursor-pointer col-span-3 mt-2'
                    onChange={(e: any) => {
                      setAudio(e.target.files[0]);
                    }}
                  />
                ) : (
                  <div className=' '>
                    <div className='mt-2 text-green-500 '>
                      File already exists
                    </div>
                    <div
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setDeleteType("eng_to_tam_audio");
                      }}
                      className='flex items-center justify-between'>
                      {sermon?.eng_to_tam_audio?.split("/").pop()}
                      <div className='text-red-500 cursor-pointer text-xl'>
                        <Icon icon={"ion:trash-outline"} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor='messagePdf' className='text-right'>
                  Message Pdf
                </Label>
                {!sermon?.tamilpdfurl || !sermon?.tamilpdf ? (
                  <Input
                    id='messagePdf'
                    type='file'
                    accept='application/pdf'
                    className='cursor-pointer col-span-3 mt-2'
                    onChange={(e: any) => {
                      setMessagePdf(e.target.files[0]);
                    }}
                  />
                ) : (
                  <div className=' '>
                    <div className='mt-2 text-green-500 '>
                      File already exists
                    </div>
                    <div
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setDeleteType("tamilpdf");
                      }}
                      className='flex items-center justify-between'>
                      {sermon?.tamilpdf?.split("/").pop()}
                      <div className='text-red-500 cursor-pointer text-xl'>
                        <Icon icon={"ion:trash-outline"} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor='Wrapper' className='text-right'>
                  Wrapper Pdf
                </Label>
                {!sermon?.wrapperurl || !sermon?.wrapper ? (
                  <Input
                    id='Wrapper'
                    type='file'
                    accept='application/pdf'
                    className='cursor-pointer col-span-3 mt-2'
                    onChange={(e: any) => {
                      setWrapperPdf(e.target.files[0]);
                    }}
                  />
                ) : (
                  <div className=' '>
                    <div className='mt-2 text-green-500 '>
                      File already exists
                    </div>
                    <div
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setDeleteType("wrapper");
                      }}
                      className='flex items-center justify-between'>
                      {sermon?.wrapper?.split("/").pop()}
                      <div className='text-red-500 cursor-pointer text-xl'>
                        <Icon icon={"ion:trash-outline"} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!sermon?.eng_to_tam_audiourl ||
          !sermon?.tamilpdfurl ||
          !sermon?.wrapperurl ? (
            <Button
              onClick={() => {
                uploadMutate();
              }}
              disabled={isPending || (!audio && !messagePdf && !WrapperPdf)}
              type='submit'
              className={`${
                !audio && !messagePdf && !WrapperPdf
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}>
              {isPending ? (
                <LoaderCircle
                  className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
                />
              ) : (
                <Upload className='h-4 w-4 mr-2' />
              )}
              {isPending ? "Uploading" : "Upload"}
            </Button>
          ) : (
            <div className='text-green-500'>
              All files uploaded successfully
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className='capitalize'>
              {
                <p>
                  <span className='font-extrabold'>{deleteType}</span> &nbsp;
                  will be permanently deleted. This action cannot be undone.
                </p>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteType)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TamilMessageSermon;
