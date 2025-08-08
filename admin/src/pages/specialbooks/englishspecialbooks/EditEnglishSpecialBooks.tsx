import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string(),
});
const EditEnglishSpecialBooks = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  // const [audioId, setAudioId] = useState<any>(null);
  // const [audio, setAudio] = useState<any>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookname, setSelectedBookname] = useState<any>(null);
  const [selectedBookId, setSelectedBookId] = useState<any>(null);
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (data.name === "") {
        return;
      }
      const response = await _axios.put(
        `/api/english-specialbook/updatename?id=${selectedBookId}`,
        {
          name: data.name,
        }
      );
      if (response?.status === 200) {
        refetchBooks();

        toast.success(" Name updated successfully");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }
  useEffect(() => {
    form.setValue("name", selectedBookname || "");
  }, [selectedBookname, form]);

  const {
    data: getallBooks,
    isLoading: isallBookLoading,
    isError: isallBookError,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["getallpbooks", pagination.page, pagination.limit, searchQuery],
    queryFn: () =>
      _axios.get(
        `/api/english-specialbook/getallenglish-specialbooks?page=${pagination.page}&limit=${pagination.limit}&search=${searchQuery}`
      ),
  });

  console.log(getallBooks);

  const handleSearch = (query: any) => {
    if (query) {
      setSearchQuery(query);
      setPagination({
        page: 1,
        limit: 25,
        total: 0,
      });
    } else {
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (getallBooks) {
      setPagination((prev) => ({
        ...prev,
        total: getallBooks?.data?.totalCount?.count,
      }));
    }
  }, [getallBooks]);

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

  // if (isallsongsLoading) return <CirculaProgress />;
  if (isallBookError)
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <div className="text-xl text-red-600">Some thing went wrong</div>
      </div>
    );

  return (
    <>
      <div className="p-5">
        <div className="flex gap-2 justify-between">
          <div className="flex flex-col gap-2 items-start">
            <h1 className="text-lg font-semibold md:text-2xl">
              English Special Books
            </h1>
            <div className="text-xs font-500 text-slate-400">
              Manage your English special books
            </div>
          </div>

          <div>
            <Input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e: any) => {
                handleSearch(e.target.value);
              }}
              className="  rounded-lg  placeholder:font-bold focus-visible:ring-transparent"
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="overflow-x-hidden pt-2 overflow-y-auto max-h-[70vh]">
          <Table className="w-full border">
            <TableHeader className="">
              <TableRow style={{ fontSize: "15px" }} className="">
                <TableHead className=" ">Book Name</TableHead>
                <TableHead className=" ">View Pdf</TableHead>
                <TableHead className="text-center ">Edit Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {isallBookLoading && (
                <TableRow>
                  <TableCell>Loading...</TableCell>
                </TableRow>
              )}
              {getallBooks?.data?.data?.map((book: any) => (
                <TableRow key={book?.id}>
                  <TableCell className="text-ellipsis   w-[500px]">
                    {book?.title}
                  </TableCell>

                  <TableCell className="text-ellipsis   w-[500px]">
                    {book?.type === "pdf" ? (
                      <Button
                        onClick={() => {
                          handlePDFView(book?.pdfurl);
                        }}
                        className="text-center"
                        variant="outline"
                        size="icon"
                      >
                        <Icon className="h-5 w-5" icon={"mdi:eye"} />
                      </Button>
                    ) : (
                      "docx file"
                    )}
                  </TableCell>

                  <TableCell className="text-center ">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setSelectedBookname(book?.title);
                            setSelectedBookId(book?.id);
                          }}
                          className="text-center"
                          variant="outline"
                          size="icon"
                        >
                          <Icon
                            className="h-5 w-5"
                            icon={"icon-park-outline:edit-one"}
                          />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[725px]">
                        <DialogHeader>
                          <DialogTitle>Edit Books Name</DialogTitle>
                          <DialogDescription>
                            Edit the name of the book
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className=""
                              >
                                <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          className="focus:outline-none"
                                          {...field}
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="mt-3 flex justify-end">
                                  <Button type="submit">Submit</Button>
                                </div>
                              </form>
                            </Form>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {getallBooks?.data?.data?.length > 0 && (
          <div className="flex justify-between">
            <Pagination className="mt-6 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
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
                      href="#"
                      onClick={() => handlePageChange(1)}
                    >
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
                          href="#"
                          isActive={pageNumber === pagination.page}
                          onClick={() => handlePageChange(pageNumber)}
                        >
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
                      href="#"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
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

export default EditEnglishSpecialBooks;
