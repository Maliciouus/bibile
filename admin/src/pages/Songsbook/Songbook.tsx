import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Cross1Icon } from "@radix-ui/react-icons";
import { _axios } from "@/lib/axios";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CirculaProgress from "@/components/loading";
import { Input } from "@/components/ui/input";
const Songbook = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any>([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { mutate: handleUpload, isPending } = useMutation<any>({
    mutationFn: () => {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append(`files`, files[i]);
      }

      return _axios.post("/api/songbook/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess(data: any) {
      setFiles([]);
      if (data?.status === 200) {
        toast.success("File uploaded successfully");
      }
      refetchnames();
      setTimeout(() => {
        window.location.reload();
      }, 400);
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.error);
      setFiles([]);
    },
  });

  const {
    data,
    isLoading,
    isError,
    refetch: refetchnames,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["songnames", searchQuery],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/songbook?page=${pageParam}&limit=300&search=${searchQuery}`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 300 ? nextPage : undefined;
    },
  });

  function openFile() {
    fileRef.current?.click();
  }
  function onFileChange(e: any) {
    const selectedFiles = e.target.files;
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > 10) {
      toast.error("You can only select up to 10 files");
      return;
    }

    if (files.length > 0) {
      setFiles((prev: any) => [...prev, ...e.target.files]);
    } else {
      setFiles(e.target.files);
    }
  }

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id) => {
      return _axios.delete(`/api/songbook/deletesong?id=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("File deleted successfully");
        refetchnames();
      }
    },
  });

  const handleSearch = (query: any) => {
    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery("");
    }
  };

  if (isLoading) return <CirculaProgress />;
  if (isError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Some thing went wrong</div>
      </div>
    );

  return (
    <>
      <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
        <div className='flex gap-2 justify-between items-center'>
          <div className='flex flex-col gap-2 items-start'>
            <h1 className='text-lg font-semibold md:text-2xl'>
              Songbook({data?.pages?.[0]?.totalCount?.total})
            </h1>
            <p className='text-xs font-500 text-slate-400'>
              Manage your songbook here!
            </p>
          </div>

          <div className='flex gap-2 items-center'>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button>Upload</Button>
              </SheetTrigger>
              <SheetContent className='h-screen'>
                <SheetHeader>
                  <SheetTitle>Upload Message Files (docx)</SheetTitle>
                  <SheetDescription className='flex items-center justify-between'>
                    You can upload maximum 10 files
                    <Icon
                      icon={"ci:file-add"}
                      className='ml-2 cursor-pointer'
                      fontSize={24}
                      onClick={openFile}
                    />
                  </SheetDescription>
                </SheetHeader>

                <div className='h-[calc(100vh-200px)] overflow-y-auto'>
                  {files &&
                    files.length > 0 &&
                    Array.from(files).map((file: any) => (
                      <div
                        key={file.name}
                        className='border-dashed p-2 border-slate-200 bg-slate-100 my-4 rounded-md flex justify-between'>
                        <p className='text-slate-400 text-start'>{file.name}</p>
                        <Cross1Icon
                          className='cursor-pointer'
                          onClick={() => {
                            setFiles(
                              Array.from(files).filter(
                                (f: any) => f.name !== file.name
                              )
                            );
                          }}
                        />
                      </div>
                    ))}
                </div>
                {files.length > 0 && (
                  <Button
                    className='w-full'
                    //@ts-ignore
                    onClick={handleUpload}
                    disabled={isPending}>
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
                )}

                <input
                  type='file'
                  ref={fileRef}
                  className='hidden'
                  onChange={onFileChange}
                  accept='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  multiple
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* @ts-ignore */}
        {data?.pages?.length > 0 ? (
          <>
            <div className='flex'>
              <div className='h-[calc(100vh-200px)] overflow-y-scroll w-full '>
                <div className='flex flex-col gap-4 p-4'>
                  {data?.pages?.map((page, pageIndex) => (
                    <div key={pageIndex}>
                      {page?.data?.map((song: any, idx: any) => (
                        <div
                          key={`${pageIndex}-${idx}`}
                          className='flex justify-between mb-4 items-center'>
                          <div
                            onClick={() => {
                              navigate(
                                `/songquil?id=${song?.id}&name=${song?.name}`
                              );
                            }}
                            className={`border-dashed w-[100%] p-2 border-slate-200 bg-slate-100 cursor-pointer hover:bg-slate-600 hover:text-white rounded-md `}>
                            <h4>{song?.name}</h4>
                          </div>
                          <div className='flex items-center gap-2 justify-end'>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Icon
                                  className='h-7 w-7 cursor-pointer text-red-500'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  icon='ic:baseline-delete'
                                />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {
                                      <p>
                                        <span className='font-extrabold'>
                                          {song?.name}
                                        </span>{" "}
                                        will be permanently deleted. This action
                                        cannot be undone.
                                      </p>
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(song?.id)}>
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}>
                    {isFetchingNextPage
                      ? "Loading more..."
                      : hasNextPage
                      ? "Load More"
                      : "No more Songs"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='flex justify-center items-center h-[calc(100vh-200px)] '>
            <p>Songs</p>
          </div>
        )}
      </main>
    </>
  );
};

export default Songbook;
