import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { _axios } from "@/lib/axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
const SongQuil = () => {
  const [searchParams] = useSearchParams();
  const currSong = searchParams.get("id") || 22;
  const songName = searchParams.get("name");
  const editorRef = useRef<any>(null);
  const [messageContent, setMessageContent] = useState<string>("");
  const navigate = useNavigate();
  const {
    data: songs,
    isLoading: isLoadingSongs,
    isError: isErrorSongs,
    refetch: refetchSongs,
  } = useQuery({
    queryKey: ["songs", currSong],
    queryFn: () => {
      return _axios.get(`/api/songbook?id=${currSong}`);
    },
    staleTime: 60000,
    enabled: !!currSong,
  });

  console.log(songs);

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
      if (songs) {
        if (songs?.data?.data?.length > 0 && songs?.data?.data[0]?.lyrics) {
          let _songs: any = songs?.data?.data[0]?.lyrics || "";
          setMessageContent(_songs);
          editorRef?.current?.setContents([]);
          editorRef?.current?.clipboard?.dangerouslyPasteHTML(0, _songs);
          editorRef.current.on(
            "text-change",
            // @ts-ignore
            (delta: any, oldDelta: any, source: any) => {
              if (source === "user") {
                const newContent = editorRef.current.root.innerHTML;
                setMessageContent(newContent);
              }
            }
          );
        }
      } else {
        clearQuillEditor();
      }
    }
  }, [songs]);

  const clearQuillEditor = () => {
    if (editorRef.current) {
      editorRef.current.setContents([]);
    }
  };
  const { mutate: updatemutate, isPending: updatemutatepending } = useMutation({
    mutationFn: () => {
      return _axios.put(`/api/songbook/updatelyrics?id=${currSong}`, {
        lyrics: messageContent,
      });
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        refetchSongs();
        toast.success("Updated message content successfully");
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to update message content");
    },
  });

  const handleSongupdate = () => {
    if (messageContent) {
      updatemutate();
    }
  };

  // if (isLoading || isLoadingSongs) return <CirculaProgress />;
  if (isErrorSongs)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Some thing went wrong</div>
      </div>
    );

  return (
    <>
      <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
        <div className='flex gap-2 justify-between items-center'>
          <div className='flex justify-center items-center gap-2'>
            <ChevronLeft
              onClick={() => navigate("/layout/songbooks")}
              className='cursor-pointer'
            />
            <h1 className='text-lg font-semibold md:text-2xl'>
              song - ({songName})
            </h1>
          </div>
        </div>
        {/* @ts-ignore */}
        {!isLoadingSongs ? (
          <div>
            <div
              id='editor'
              className='border-solid border-slate-200 border-[2px] p-2 min-w-[70%]  max-h-[calc(80vh-100px)] overflow-y-auto scroll-hide'></div>
            <div className='flex justify-end py-2'>
              <Button
                disabled={updatemutatepending}
                onClick={() => {
                  handleSongupdate();
                }}>
                {updatemutatepending ? "Updating..." : "Update Song"}
              </Button>
            </div>
          </div>
        ) : // <CirculaProgress />
        null}
      </main>
    </>
  );
};

export default SongQuil;
