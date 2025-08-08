import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string(),
});
const SongsAudio = () => {
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
  const [audioId, setAudioId] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedsongname, setSelectedsongname] = useState<any>(null);
  const [selectedsongId, setSelectedsongId] = useState<any>(null);
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (data.name === "") {
        return;
      }
      const response = await _axios.put(
        `/api/songbook/updatename?id=${selectedsongId}`,
        {
          name: data.name,
        }
      );
      if (response?.status === 200) {
        refetchSongs();
        toast.success(" Name updated successfully");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }
  useEffect(() => {
    form.setValue("name", selectedsongname || "");
  }, [selectedsongname, form]);
  const { mutate: uploadMutate, isPending } = useMutation({
    mutationFn: () => {
      return _axios.post(
        `/api/songbook/uploadaudio?id=${audioId}`,
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
      if (data?.status === 200) {
        toast.success("File uploaded successfully");
        refetchSongs();
        setAudio(null);
        setIsModalOpen(false);
        setAudioId(null);
      }
    },
    // @ts-ignore
    onError: (error: any) => {
      toast.error("Something went wrong");
      setAudio(null);
      setIsModalOpen(false);
      setAudioId(null);
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: (id: any) => {
      return _axios.delete(`/api/songbook/deleteaudio?id=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("File deleted successfully");
        refetchSongs();
      }
    },
    //@ts-ignore
    onError: (error: any) => {
      toast.error("Something went wrong");
      setAudioId(null);
    },
  });

  const {
    data: getallsongs,
    isLoading: isallsongsLoading,
    isError: isallsongsError,
    refetch: refetchSongs,
  } = useQuery({
    queryKey: [
      "getallsongbooks",
      pagination.page,
      pagination.limit,
      searchQuery,
    ],
    queryFn: () =>
      _axios.get(
        `/api/songbook/getallsongs?page=${pagination.page}&limit=${pagination.limit}&search=${searchQuery}`
      ),
  });

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
    if (getallsongs) {
      setPagination((prev) => ({
        ...prev,
        total: getallsongs?.data?.totalCount?.count,
      }));
    }
  }, [getallsongs]);

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

  // if (isallsongsLoading) return <CirculaProgress />;
  if (isallsongsError)
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
              Song Books Audio
            </h1>
            <div className="text-xs font-500 text-slate-400">
              Manage your song books audios
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
                <TableHead className=" ">Song Name</TableHead>
                <TableHead className="text-center ">Audio</TableHead>
                <TableHead className="text-center  bg-white">
                  Upload Audio
                </TableHead>
                <TableHead className="text-center ">Delete Audio</TableHead>
                <TableHead className="text-center ">Edit Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {isallsongsLoading && (
                <TableRow>
                  <TableCell>Loading...</TableCell>
                </TableRow>
              )}
              {getallsongs?.data?.data?.map((song: any) => (
                <TableRow key={song?.id}>
                  <TableCell className="text-ellipsis  py-0 w-[500px]">
                    {song?.name}
                  </TableCell>
                  <TableCell className="text-center w-[300px] ">
                    {song?.audioname === null ? (
                      <div className="text-red-400">No Audio</div>
                    ) : (
                      <audio
                        className="w-full"
                        controls
                        controlsList="nodownload"
                        src={song?.audiourl || null}
                      ></audio>
                    )}
                  </TableCell>
                  <TableCell className="text-center py-0">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setAudioId(song?.id);
                          }}
                          className="text-center"
                          variant="outline"
                          size="icon"
                        >
                          <Icon
                            className="h-5 w-5"
                            icon={"icon-park-outline:upload-one"}
                          />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="">
                        <DialogHeader>
                          <DialogTitle>Upload Audio</DialogTitle>
                          <DialogDescription>
                            Upload your audio file
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="audio" className="text-right">
                              Audio
                            </Label>
                            <Input
                              id="audio"
                              type="file"
                              // accept="audio/*"
                              className="cursor-pointer col-span-3"
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
                            type="submit"
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
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-center py-0">
                    <Button
                      onClick={() => {
                        deleteMutate(song?.id);
                      }}
                      disabled={
                        song?.audiopath === null && song?.audioname === null
                      }
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
                  <TableCell className="text-center py-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setSelectedsongname(song?.name);
                            setSelectedsongId(song?.id);
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
                          <DialogTitle>Edit Message Name</DialogTitle>
                          <DialogDescription>
                            Edit the name of the message
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
        {getallsongs?.data?.data?.length > 0 && (
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

export default SongsAudio;
