import { _axios } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function MessageQuil() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messageContent, setMessageContent] = useState<string>("");

  const currMessage = searchParams.get("m") || 17;
  const name = searchParams.get("name");
  const editorRef = useRef<any>(null);

  const { mutate: updatemutate, isPending: updatemutatepending } = useMutation({
    mutationFn: () => {
      return _axios.put(`/api/message/updatemessage?messageId=${currMessage}`, {
        message: messageContent,
      });
    },
    onSuccess: (data: any) => {
      if (data?.data?.status === 200) {
        toast.success("File updated successfully");
        refetchMessage();
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to update message content");
    },
  });

  const {
    data: message,
    isLoading: isLoadingMessage,
    isError: isErrorMessage,
    refetch: refetchMessage,
  } = useQuery({
    queryKey: ["messages", currMessage],
    queryFn: () => _axios.get(`/api/message?m=${currMessage}`),
    staleTime: 60000,
    enabled: !!currMessage,
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
      if (message) {
        if (
          message?.data?.data?.length > 0 &&
          message?.data?.data[0]?.message
        ) {
          let _message: any = message?.data?.data[0]?.message || "";
          setMessageContent(_message);
          editorRef?.current?.setContents([]);
          editorRef?.current?.clipboard?.dangerouslyPasteHTML(0, _message);
          editorRef?.current.on(
            "text-change",
            // @ts-ignore
            (delta: any, oldDelta: any, source: any) => {
              if (source === "user") {
                const newContent = editorRef?.current?.root?.innerHTML;
                setMessageContent(newContent);
              }
            }
          );
        }
      }
    }
  }, [message]);

  // if (isLoading || isLoadingMessage) return <CirculaProgress />;
  if (isErrorMessage)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Some thing went wrong</div>
      </div>
    );

  const handleMessageUpdate = () => {
    if (messageContent) {
      updatemutate();
    }
  };

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <div className='flex gap-2 justify-between items-center'>
        <div className='flex justify-center items-center gap-2'>
          <ChevronLeft
            onClick={() => navigate("/layout/messages")}
            className='cursor-pointer'
          />
          <h1 className='text-lg font-semibold md:text-2xl'>
            Messages({name})
          </h1>
        </div>
      </div>
      {/* @ts-ignore */}
      {!isLoadingMessage ? (
        <div>
          <div
            id='editor'
            className='border-solid border-slate-200 border-[2px] p-2 min-w-[70%]  max-h-[calc(80vh-100px)] overflow-y-auto scroll-hide'></div>
          <div className='flex justify-end py-2'>
            <Button
              disabled={updatemutatepending}
              onClick={() => {
                handleMessageUpdate();
              }}>
              {updatemutatepending ? "Updating..." : "Update Message"}
            </Button>
          </div>
        </div>
      ) : // <CirculaProgress />
      null}
    </main>
  );
}
