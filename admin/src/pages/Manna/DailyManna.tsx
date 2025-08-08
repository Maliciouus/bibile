import CirculaProgress from "@/components/loading";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DailyManna = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: (formData: any) => {
      return _axios.post("/api/dailymanna/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("Audio uploaded successfully");
        refetch();
        setInputs([
          {
            date: "",
            audio: null,
          },
        ]);
        setInputs([]);
      }
    },
    onError: (error: any) => {
      console.log(error);
      toast.error("Something went wrong");
    },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [inputs, setInputs] = useState([
    {
      date: "",
      audio: null,
    },
  ]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dailymanna", pagination.page, pagination.limit],
    queryFn: () => {
      return _axios.get(
        `/api/dailymanna/getaudios?page=${pagination.page}&limit=${pagination.limit}`
      );
    },
  });
  const { mutate: deleteMutate } = useMutation({
    mutationFn: (id: any) => {
      return _axios.delete(`/api/dailymanna/deleteaudio?id=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("Audio deleted successfully");
        refetch();
      }
    },
    onError: (error: any) => {
      console.log(error);
      toast.error("Something went wrong");
    },
  });

  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data?.data?.totalCount,
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
  const addFields = () => {
    if (inputs.length >= 7) {
      toast.error("Maximum 7 fields");
      return;
    }
    setInputs([...inputs, { date: "", audio: null }]);
  };

  const deleteFields = (id: any) => {
    const newInputs = inputs.filter((_, i) => i !== id);
    setInputs(newInputs);
  };

  const handleChange = (index: any, e: any) => {
    const { name, value, files } = e.target;
    const newInputs: any = [...inputs];
    newInputs[index][name] = name === "audio" ? files[0] : value;
    setInputs(newInputs);
  };

  const handleSubmit = () => {
    const formData = new FormData();

    inputs.forEach((input) => {
      const { date, audio } = input;
      //@ts-ignore
      formData.append(date, audio);
    });
    mutate(formData);
  };

  if (isLoading) return <CirculaProgress />;
  if (isError)
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <div className="text-xl text-red-600">Some thing went wrong</div>
      </div>
    );
  return (
    <>
      <main className="p-5 h-full">
        <div className="flex gap-2 justify-between">
          <div className="flex flex-col gap-2 items-start">
            <h1 className="text-lg font-semibold md:text-2xl">இன்றைய மன்னா</h1>
            <div className="text-xs font-500 text-slate-400">
              Manage your daily audio Quotes
            </div>
          </div>

          <div className="flex items-center gap-x-10">
            {/* <div>
              <Input
                id='search'
                type='text'
                // value={searchQuery}
                // onChange={(e: any) => {
                //   handleSearch(e.target.value);
                // }}
                className='  rounded-lg  placeholder:font-bold focus-visible:ring-transparent'
                placeholder='Search...'
              />
            </div> */}
            <div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Upload</Button>
                </SheetTrigger>
                <SheetContent className="h-screen p-4">
                  <SheetHeader>
                    <SheetTitle>Upload Audio File</SheetTitle>

                    <SheetDescription className="">
                      <div className="p-2 flex justify-end">
                        <Button
                          onClick={() => {
                            addFields();
                          }}
                        >
                          Add More
                        </Button>
                      </div>
                      <div className="h-[calc(100vh-200px)] overflow-x-hidden overflow-y-auto">
                        <div className="">
                          <form>
                            {inputs.map((_input, index) => (
                              <div
                                key={index}
                                className="flex mb-3 flex-col border-[3px] border-gray-400 p-2 gap-2"
                              >
                                <Input
                                  name="date"
                                  type="date"
                                  onChange={(e) => handleChange(index, e)}
                                  className="w-full text-[17px] cursor-pointer focus-visible:ring-transparent"
                                />
                                <Input
                                  className="w-full  cursor-pointer focus-visible:ring-transparent"
                                  name="audio"
                                  onChange={(e) => handleChange(index, e)}
                                  type="file"
                                />
                                <div className="flex justify-end">
                                  <Icon
                                    onClick={() => {
                                      deleteFields(index);
                                    }}
                                    className="h-5 w-5 text-red-400  cursor-pointer"
                                    icon={"icon-park-outline:delete-one"}
                                  />
                                </div>
                              </div>
                            ))}
                          </form>
                        </div>
                      </div>
                      <Button
                        disabled={isPending}
                        onClick={() => handleSubmit()}
                        className="w-full"
                      >
                        {isPending ? (
                          <LoaderCircle
                            className={`mr-2 h-4 w-4 ${
                              isPending ? "animate-spin" : ""
                            }`}
                          />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {isPending ? "Uploading" : "Upload"}
                      </Button>
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        <div className="overflow-x-hidden pt-2 overflow-y-auto max-h-[70vh]">
          <Table className="w-full border">
            <TableHeader>
              <TableRow>
                <TableHead className="">Date</TableHead>
                <TableHead className="text-center">Audio</TableHead>
                <TableHead className="text-center">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.data?.map((data: any) => (
                <TableRow key={data?.id}>
                  <TableCell className="font-medium">
                    {data?.datestring}
                  </TableCell>
                  <TableCell className="text-center w-[300px] ">
                    <audio
                      src={data?.audiourl || ""}
                      controls
                      controlsList="nodownload"
                      className="w-full"
                    ></audio>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      onClick={() => {
                        deleteMutate(data?.id);
                      }}
                      className="text-center"
                      variant="outline"
                      size="icon"
                    >
                      <Icon
                        className="h-5 w-5"
                        icon={"icon-park-outline:delete-one"}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data?.data?.data?.length > 0 && (
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
      </main>
    </>
  );
};

export default DailyManna;
