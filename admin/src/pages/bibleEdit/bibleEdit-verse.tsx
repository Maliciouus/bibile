import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useMemo, useState } from "react";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BibleEditVerse = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
  });
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const book = searchParams.get("book");
  const chapterCount: any = searchParams.get("chapterCount");
  const navigate = useNavigate();
  const [modelOpen, setIsModelOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState({
    Chapter: "",
    Versecount: "",
    title: "",
    verse: "",
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "geteditBible",
      book,
      pagination.page,
      pagination.limit,
      selectedChapter,
    ],
    queryFn: () =>
      _axios.get(
        `/api/bible/geteditlist?page=${pagination.page}&limit=${
          pagination.limit
        }&bookName=${book}&chapter=${selectedChapter ? selectedChapter : ""}`
      ),
  });

  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data?.data?.totalCount?.count,
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

  const updateVerse = async () => {
    try {
      const res = await _axios.put(`/api/bible/editverse`, {
        Chapter: selectedBook.Chapter,
        title: selectedBook.title,
        Versecount: selectedBook.Versecount,
        verse: selectedBook.verse,
      });

      if (res?.status === 200) {
        refetch();
        toast.success(" Verse updated successfully");
        setIsModelOpen(false);
        setSelectedBook({
          Chapter: "",
          title: "",
          Versecount: "",
          verse: "",
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

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
            <div className='flex justify-center items-center gap-2'>
              <ChevronLeft
                onClick={() => navigate("/layout/_bible-edit")}
                className='cursor-pointer'
              />
              <h1 className='text-lg font-semibold md:text-2xl'>
                Bible Edit Verse - ({book})
              </h1>
            </div>
            <div className='text-xs font-500 text-slate-400'>
              Manage your bible verese here
            </div>
          </div>

          <div className='flex gap-2 items-center'>
            <Button
              onClick={() => {
                setSelectedChapter(null);
                refetch();
              }}>
              Clear Filter
            </Button>
            <Select onValueChange={(value) => setSelectedChapter(value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select a Chapter' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Chapters</SelectLabel>
                  {Array.from(
                    { length: Number(chapterCount) },
                    (_: any, i: any) => (
                      <SelectItem key={i} value={i + 1}>
                        {i + 1}
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='overflow-x-hidden pt-2 overflow-y-auto max-h-[70vh]'>
          <Table className='w-full border'>
            <TableHeader className=''>
              <TableRow style={{ fontSize: "15px" }} className=''>
                <TableHead className=' '>Chapter</TableHead>
                <TableHead className=' '>Verse Count</TableHead>
                <TableHead className=' '>Content</TableHead>
                <TableHead className='text-center '>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=''>
              {isLoading && (
                <TableRow>
                  <TableCell>Loading...</TableCell>
                </TableRow>
              )}
              {data?.data?.data?.map((verse: any, index: any) => (
                <TableRow key={index}>
                  <TableCell className='text-ellipsis  '>
                    {verse?.Chapter}
                  </TableCell>
                  <TableCell className='text-ellipsis  '>
                    {verse?.Versecount}
                  </TableCell>
                  <TableCell className='text-ellipsis  '>
                    {verse?.verse}
                  </TableCell>
                  <TableCell className='text-center w-[300px] '>
                    <Button
                      onClick={() => {
                        setSelectedBook(verse);
                        setIsModelOpen(true);
                      }}
                      className='text-center'
                      variant='outline'
                      size='icon'>
                      <Icon
                        className='h-5 w-5'
                        icon={"icon-park-outline:edit-one"}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
      <Dialog open={modelOpen} onOpenChange={setIsModelOpen}>
        <DialogContent className='sm:max-w-[725px]'>
          <DialogHeader>
            <DialogTitle>Edit Books Name</DialogTitle>
            <DialogDescription>Edit the name of the book</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div>
              <Textarea
                className='focus:outline-none'
                value={selectedBook?.verse}
                onChange={(e) =>
                  setSelectedBook((prev) => ({
                    ...prev,
                    verse: e.target.value,
                  }))
                }
              />
              <div className='mt-3 flex justify-end'>
                <Button onClick={() => updateVerse()} type='submit'>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BibleEditVerse;
