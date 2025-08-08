import CirculaProgress from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { _axios } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, LoaderCircle, Upload } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const BibleUploadAudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookName = searchParams.get("book");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audio, setAudio] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
  });
  const {
    data: audiolist,
    isError: audiolistError,
    isLoading: audiolistLoading,
    refetch: audioRefetch,
  } = useQuery({
    queryKey: ["bibleaudios", pagination.page, pagination.limit],
    queryFn: () => {
      return _axios.get(
        `/api/bible/getaudioslist?bookName=${bookName}&page=${pagination.page}&limit=${pagination.limit}`
      );
    },
  });

  const { mutate: uploadMutate, isPending } = useMutation({
    mutationFn: () => {
      return _axios.post(
        `/api/bible/uploadaudio?bookName=${bookName}&chapter=${chapter}`,
        {
          audio: audio,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (data: any) => {
      if (data?.status === 201) {
        toast.success("Audio uploaded successfully");
        audioRefetch();
        setAudio(null);
        setIsModalOpen(false);
        setChapter(null);
      }
    },
    // @ts-ignore
    onError: (error: any) => {
      toast.error("Something went wrong");
      setAudio(null);
      setIsModalOpen(false);
      setChapter(null);
    },
  });
  const { mutate: deleteMutate } = useMutation({
    mutationFn: (chapter: any) => {
      return _axios.delete(
        `/api/bible/deleteaudio?bookName=${bookName}&chapter=${chapter}`
      );
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("File deleted successfully");
        audioRefetch();
      }
    },
    //@ts-ignore
    onError: (error: any) => {
      toast.error("Something went wrong");
      setChapter(null);
    },
  });

  useEffect(() => {
    if (audiolist) {
      setPagination((prev) => ({
        ...prev,
        total: audiolist?.data?.totalCount?.count,
      }));
    }
  }, [audiolist]);

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

  if (audiolistLoading) return <CirculaProgress />;
  if (audiolistError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Some thing went wrong</div>
      </div>
    );

  return (
    <>
      <div className='p-5'>
        <div className='flex gap-2 justify-between'>
          <div className='flex justify-center items-center gap-2'>
            <ChevronLeft
              onClick={() => navigate("/layout/_bible-audio")}
              className='cursor-pointer'
            />
            <h1 className='text-lg font-semibold md:text-2xl'>
              Bible Audio - ({bookName})
            </h1>
          </div>
        </div>
        <div className='text-xs font-500 mt-2 ml-2  text-slate-400'>
          Manage your bible audios here!
        </div>
        <div className='overflow-x-hidden pt-2 overflow-y-auto max-h-[70vh]'>
          <Table className='w-full border'>
            <TableHeader className=''>
              <TableRow style={{ fontSize: "15px" }} className=''>
                <TableHead className=' '>Title</TableHead>
                <TableHead className='text-center '>Chapters</TableHead>
                <TableHead className='text-center '>Audio</TableHead>
                <TableHead className='text-center  bg-white'>
                  Upload Audio
                </TableHead>
                <TableHead className='text-center '>Delete Audio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=''>
              {audiolist?.data?.data?.map((bibleAudio: any) => (
                <TableRow key={bibleAudio?.id}>
                  <TableCell className='text-ellipsis  py-0 '>
                    {bibleAudio?.title}
                  </TableCell>
                  <TableCell className='text-center  py-0 '>
                    அதிகாரம்- {bibleAudio?.chapter}
                  </TableCell>
                  <TableCell className='text-center w-[300px] '>
                    {bibleAudio?.audioname === null ? (
                      <div className='text-red-400'>No Audio</div>
                    ) : (
                      <audio
                        className='w-full'
                        controls
                        controlsList='nodownload'
                        src={bibleAudio?.audiourl || null}></audio>
                    )}
                  </TableCell>
                  <TableCell className='text-center py-0'>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setChapter(bibleAudio?.chapter);
                          }}
                          className='text-center'
                          variant='outline'
                          size='icon'>
                          <Icon
                            className='h-5 w-5'
                            icon={"icon-park-outline:upload-one"}
                          />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className=''>
                        <DialogHeader>
                          <DialogTitle>Upload Audio</DialogTitle>
                          <DialogDescription>
                            Upload your audio file
                          </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='audio' className='text-right'>
                              Audio
                            </Label>
                            <Input
                              id='audio'
                              type='file'
                              // accept="audio/*"
                              className='cursor-pointer col-span-3'
                              onChange={(e: any) => {
                                setAudio(e.target.files[0]);
                              }}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              if (audio) {
                                uploadMutate();
                              }
                            }}
                            disabled={isPending}
                            type='submit'>
                            {isPending ? (
                              <LoaderCircle
                                className={`mr-2 h-4 w-4 ${
                                  isPending ? "animate-spin" : ""
                                }`}
                              />
                            ) : (
                              <Upload className='h-4 w-4 mr-2' />
                            )}
                            {isPending ? "Uploading" : "Upload"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className='text-center py-0'>
                    <Button
                      onClick={() => {
                        deleteMutate(bibleAudio?.chapter);
                      }}
                      disabled={
                        bibleAudio?.audiopath === null &&
                        bibleAudio?.audioname === null
                      }
                      className='text-center'
                      variant='outline'
                      size='icon'>
                      <Icon
                        className='h-5 w-5'
                        icon={"icon-park-outline:delete-one"}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {audiolist?.data?.data?.length > 0 && (
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
    </>
  );
};

export default BibleUploadAudio;
