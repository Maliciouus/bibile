import CirculaProgress from "@/components/loading";
import { Button } from "@/components/ui/button";
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
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, LoaderCircle, Upload } from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let topicId = searchParams.get("topic");
  let topic = searchParams.get("topicName");
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [answerContent, setAnswerContent] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any>([]);

  // const currAnswer = 1;
  const editorRef = useRef<any>(null);

  const { mutate: updateMutate, isPending: updateAnswerPending } = useMutation({
    mutationFn: () => {
      return _axios.put(
        `/api/cod/updateanswer?id=${currentQuestionId}&topicId=${topicId}`,
        {
          content: answerContent,
        }
      );
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("Answer updated successfully");
        refetch();
      }
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error("Error updating answer");
    },
  });

  const { mutate, isPending } = useMutation({
    onSuccess() {
      setFiles([]);
      refetch();
      toast.success("File uploaded successfully");
      window.location.reload();
    },

    mutationFn: () => {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append(`files`, files[i]);
      }

      return _axios.post(
        `/api/cod/addquestion/${topicId}?subtopicQuestion=${searchParams.get(
          "subtopicQuestion"
        )}&subtopicId=${searchParams.get("subtopicId")}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      setFiles([]);
      // Handle error
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

  async function handleUpload() {
    mutate();
  }
  const { mutate: handleDelete } = useMutation({
    mutationFn: (book: any) => {
      return _axios.delete(
        `/api/cod/deletequestion?questionId=${book?.id}&topicId=${book?.topicid}`
      );
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("File deleted successfully");
        refetch();
        clearQuillEditor();
        setAnswerContent("");
      }
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error("Error deleting question");
    },
  });
  const clearQuillEditor = () => {
    if (editorRef.current) {
      editorRef.current.setContents([]);
    }
  };
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["books", topicId],
    queryFn: () =>
      searchParams.get("subtopicQuestion")
        ? _axios.get(
            "/api/cod/getSubtopicQuestions/" +
              searchParams.get("subtopicId") +
              "/" +
              searchParams.get("topic")
          )
        : _axios.get("/api/cod/questions-admin/" + topicId),
  });

  useEffect(() => {
    if (document && document.getElementById("editor") != null) {
      if (!editorRef.current) {
        editorRef.current = new Quill("#editor", {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline", "strike"],
              ["blockquote", "code-block"],
              [{ header: 1 }, { header: 2 }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ script: "sub" }, { script: "super" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ direction: "rtl" }],
              [{ size: ["small", false, "large", "huge"] }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ color: [] }, { background: [] }],
              [{ font: [] }],
              [{ align: [] }],
              ["clean"],
            ],
          },
        });
      }
    }

    if (data) {
      const selectedQuestion = data?.data?.data?.find(
        (question: any) => question.id === currentQuestionId
      );

      if (selectedQuestion && selectedQuestion.content) {
        const _answer = selectedQuestion.content;

        if (_answer !== answerContent) {
          setAnswerContent(_answer);
          editorRef.current.root.innerHTML = "";
          editorRef?.current?.clipboard?.dangerouslyPasteHTML(0, _answer);
        }

        editorRef?.current?.on("text-change", () => {
          // @ts-ignore
          setAnswerContent(editorRef.current.root.innerHTML);
        });
      }
    }
  }, [data, currentQuestionId]);
  // @ts-ignore
  function handleSidebarQuestionClick(idx: any, book: any) {
    editorRef?.current?.setText("");
    editorRef?.current?.clipboard?.dangerouslyPasteHTML(0, book.content);
    setCurrentQuestionId(book.id);
  }

  const handleAnswerUpdate = () => {
    if (answerContent) {
      updateMutate();
    }
  };

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <div className='flex gap-2 justify-between'>
        <div className='flex gap-2 items-center justify-center'>
          <div className='flex justify-center items-center gap-2'>
            <ChevronLeft
              onClick={() =>
                searchParams.get("subtopicQuestion")
                  ? navigate(-1)
                  : navigate("/layout/cod")
              }
              className='cursor-pointer'
            />
          </div>

          <div className='flex gap-2'>
            <div className='flex flex-col gap-2 items-start justify-between'>
              <h1 className='text-lg font-semibold md:text-2xl'>
                Cod Questions
              </h1>
              <p className='text-xs font-500 text-slate-400'>{topic ?? ""}</p>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between gap-2'>
          <Sheet>
            <SheetTrigger asChild>
              <Button>Add</Button>
            </SheetTrigger>
            <SheetContent className='h-screen'>
              <SheetHeader>
                <SheetTitle>Upload Cod Files (docx)</SheetTitle>
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
                      className='border-dashed p-2 border-slate-200 bg-red-600 my-4 rounded-md flex justify-between'>
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
                // <Button
                //   disabled={isPending}
                //   className='w-full'
                //   onClick={handleUpload}>
                //   Upload
                // </Button>
                <Button
                  className='w-full'
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

      {data && data?.data?.data?.length > 0 ? (
        <>
          <div className='flex'>
            <div className='h-[calc(100vh-200px)] overflow-y-scroll min-w-[30%]'>
              <div className='flex flex-col gap-4 p-4'>
                {data &&
                  data?.data?.data?.map((book: any, idx: any) => (
                    <div
                      key={idx}
                      className='flex justify-between items-center'>
                      <div
                        onClick={() => {
                          handleSidebarQuestionClick(book?.id, book);
                        }}
                        className={`border-dashed p-2 w-full border-slate-200 bg-slate-100 cursor-pointer hover:bg-slate-200 rounded-md ${
                          currentQuestionId == book?.id
                            ? "bg-slate-600 text-white hover:bg-slate-600"
                            : "bg-slate-100"
                        }`}>
                        <h4>{book?.title}</h4>
                      </div>
                      <div className='flex justify-end'>
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
                                      {book?.title}
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
                                onClick={() => handleDelete(book)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {isLoading ? (
              <CirculaProgress />
            ) : (
              <div>
                <div>
                  <div
                    id='editor'
                    className='border-solid border-slate-200 border-[2px] p-2 min-w-[70%]  max-h-[calc(70vh-100px)] overflow-y-auto scroll-hide'></div>
                </div>
                <div className='flex justify-end py-2'>
                  <Button
                    disabled={updateAnswerPending}
                    onClick={() => {
                      handleAnswerUpdate();
                    }}>
                    {updateAnswerPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : isLoading ? (
        <div className='flex h-[86vh] justify-center items-center'>
          <div className='animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900' />
        </div>
      ) : (
        <div className='flex justify-center items-center h-[calc(100vh-200px)] '>
          <p>No data found</p>
        </div>
      )}
    </main>
  );
}
