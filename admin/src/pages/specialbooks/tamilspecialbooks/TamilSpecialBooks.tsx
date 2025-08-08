import CirculaProgress from "@/components/loading";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const TamilSpecialBooks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<any>([]);
  const [bookContent, setBookContent] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const currBook = searchParams.get("bookid") || 14;
  let ispdf = searchParams.get("pdf") || "false";
  console.log(ispdf);
  const editorRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  function openFile() {
    fileRef.current?.click();
  }

  const { mutate, isPending } = useMutation<any>({
    onSuccess(data: any) {
      console.log(data);
      setFiles([]);
      if (data?.status === 200) {
        refetchBooks();
        refetchnames();
        toast.success("File uploaded successfully");
        window.location.reload();
      }
    },

    mutationFn: () => {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append(`files`, files[i]);
      }

      return _axios.post("/api/tamil-specialbook/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error);
      setFiles([]);
    },
  });

  const {
    data,
    isLoading,
    refetch: refetchnames,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["tamil-specialbook", searchQuery],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/tamil-specialbook/getall?page=${pageParam}&limit=10&search=${searchQuery}`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 10 ? nextPage : undefined;
    },
  });

  console.log(data, "dataafa");

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

  const {
    data: books,
    isLoading: isLoadingBooks,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["tamil-specialbookss"],
    queryFn: () => {
      return _axios.get(`/api/tamil-specialbook/getall?id=${currBook}`);
    },
    staleTime: 60000,
    enabled: !!currBook,
  });

  console.log(books, "noooooks");

  useEffect(() => {
    if (currBook) {
      refetchBooks();
    }
  }, [currBook]);

  async function handleUpload() {
    mutate();
  }

  useEffect(() => {
    if (ispdf === "true") {
      return handlePDFView();
    }

    if (document && document.getElementById("editor") != null) {
      if (!editorRef.current) {
        editorRef.current = new Quill("#editor", {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline", "strike"],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ script: "sub" }, { script: "super" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ direction: "rtl" }],
              [{ size: ["small", false, "large", "huge"] }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ color: [] }, { background: [] }],
              [{ font: [] }],
              ["clean"],
            ],
          },
        });
      }
      if (books) {
        if (books?.data?.data?.length > 0 && books?.data?.data[0]?.content) {
          let _books: any = books?.data?.data[0]?.content || "";
          setBookContent(_books);
          editorRef?.current?.setContents([]);
          editorRef?.current?.clipboard?.dangerouslyPasteHTML(0, _books);
          editorRef?.current.on(
            "text-change",
            // @ts-ignore
            (delta: any, oldDelta: any, source: any) => {
              if (source === "user") {
                const newContent = editorRef?.current?.root?.innerHTML;
                setBookContent(newContent);
              }
            }
          );
        }
      }
    }
  }, [books]);

  const handlePDFView = () => {
    if (books && books?.data && books?.data?.data[0]?.pdfurl) {
      const pdfUrl = books?.data?.data[0]?.pdfurl;
      const googleDocsViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(
        pdfUrl
      )}&embedded=true`;
      ispdf = "false";
      window.open(googleDocsViewer, "_blank");
    } else {
      toast.error("PDF URL not found.");
    }
  };

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id) => {
      return _axios.delete(`/api/tamil-specialbook/deleteBook?id=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("File deleted successfully");
        refetchBooks();
        refetchnames();
        setBookContent("");
        clearQuillEditor();
      }
    },
  });

  const clearQuillEditor = () => {
    if (editorRef.current) {
      editorRef.current.setContents([]);
    }
  };

  const { mutate: updatemutate, isPending: updatemutatepending } = useMutation({
    mutationFn: () => {
      return _axios.put(`/api/tamil-specialbook/updatecontent?id=${currBook}`, {
        content: bookContent,
      });
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        refetchBooks();
        refetchnames();
        toast.success("Updated Book content successfully");
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to update Book content");
    },
  });

  const handleBookupdate = () => {
    if (bookContent) {
      updatemutate();
    }
  };

  const handleSearch = (query: any) => {
    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery("");
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex gap-2 justify-between items-center">
        <div className="flex flex-col gap-2 items-start">
          <h1 className="text-lg font-semibold md:text-2xl">
            Tamil Special Books({data?.pages?.[0]?.totalCount?.total})
          </h1>
          <p className="text-xs font-500 text-slate-400">All Published Books</p>
        </div>

        <div className="flex gap-2 items-center">
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
          <Sheet>
            <SheetTrigger asChild>
              <Button>Upload</Button>
            </SheetTrigger>
            <SheetContent className="h-screen">
              <SheetHeader>
                <SheetTitle>Upload Message Files (docx,pdf)</SheetTitle>
                <SheetDescription className="flex items-center justify-between">
                  You can upload maximum 10 files
                  <Icon
                    icon={"ci:file-add"}
                    className="ml-2 cursor-pointer"
                    fontSize={24}
                    onClick={openFile}
                  />
                </SheetDescription>
              </SheetHeader>

              <div className="h-[calc(100vh-200px)] overflow-y-auto">
                {files &&
                  files.length > 0 &&
                  Array.from(files).map((file: any) => (
                    <div
                      key={file.name}
                      className="border-dashed p-2 border-slate-200 bg-slate-100 my-4 rounded-md flex justify-between"
                    >
                      <p className="text-slate-400 text-start">{file.name}</p>
                      <Cross1Icon
                        className="cursor-pointer"
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
                  className="w-full"
                  onClick={handleUpload}
                  disabled={isPending}
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
              )}

              <input
                type="file"
                ref={fileRef}
                className="hidden"
                onChange={onFileChange}
                accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* @ts-ignore */}
      {!isLoadingBooks && !isLoading && data?.pages?.length > 0 ? (
        <>
          <div className="flex">
            <div className="h-[calc(100vh-200px)] overflow-y-scroll overflow-x-scroll  min-w-[40%] ">
              <div className="flex flex-col gap-4 p-4">
                {data?.pages?.map((page, pageIndex) => (
                  <div key={pageIndex}>
                    {page?.data?.map((book: any, idx: any) => (
                      <div
                        key={`${pageIndex}-${idx}`}
                        className="flex justify-between  text-wrap  mb-4 items-center"
                      >
                        <div
                          onClick={() => {
                            if (book?.type === "docx") {
                              navigate(
                                `/layout/tamilspecialbooks?bookid=${book?.id}&name=${book?.title}`
                              );
                              console.log(book);
                            } else if (book?.type === "pdf") {
                              console.log(book);
                              navigate(
                                `/layout/tamilspecialbooks?bookid=${book?.id}&name=${book?.title}&pdf=true`
                              );
                              //   handlePDFView();
                            }
                          }}
                          className={`border-dashed w-[100%]  p-2 border-slate-200 bg-slate-100 cursor-pointer hover:bg-slate-200 rounded-md ${
                            currBook == book?.id
                              ? "bg-slate-600 text-white hover:bg-slate-600"
                              : "bg-slate-100"
                          }`}
                        >
                          <h4>{book?.title}</h4>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Icon
                              className="h-7 w-7 cursor-pointer text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              icon="ic:baseline-delete"
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
                                    <span className="font-extrabold">
                                      {book?.booktitle}
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
                                onClick={() => handleDelete(book?.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                ))}
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? "Loading more..."
                    : hasNextPage
                    ? "Load More"
                    : "No more Books"}
                </Button>
              </div>
            </div>

            {!isLoadingBooks ? (
              <div>
                <div
                  id="editor"
                  className="border-solid border-slate-200 border-[2px] p-2 min-w-[70%]  max-h-[calc(70vh-100px)] overflow-y-auto scroll-hide"
                ></div>
                <div className="flex justify-end py-2">
                  <Button
                    disabled={updatemutatepending}
                    onClick={() => {
                      handleBookupdate();
                    }}
                  >
                    {updatemutatepending ? "Updating..." : "Update Book"}
                  </Button>
                </div>
              </div>
            ) : (
              <CirculaProgress />
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-[calc(100vh-200px)] ">
          <p>No books found</p>
        </div>
      )}
    </main>
  );
};

export default TamilSpecialBooks;
