import { CircularProgressIndicator } from "@/components/LoadingIndicator";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Download, LoaderCircle, Minus, Plus, Menu } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { ThemeToggle } from "../components/themetoggler";
import SongBookSideBar from "@/components/sidebars/songbooksidebar";

const FormSchema = z.object({
  format: z.enum(["pdf", "txt"], {
    required_error: "You need to select a notification format.",
  }),
});

export default function RootSongBooks() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const songBookContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("songBookFontSize");
    return savedFontSize ? parseInt(savedFontSize) : 14;
  });
  const songId =
    searchParams.get("songId") || localStorage.getItem("songBookId") || 22;
  // @ts-ignore
  let storedSongId = localStorage.getItem("songBookId", songId);
  const handleSongBookSelect = () => {
    setIsSheetOpen(false);
  };
  const {
    data: songLyrics,
    isLoading: isSongLyricsLoading,
    refetch,
  } = useQuery({
    queryKey: ["songLyrics"],
    queryFn: () => _axios.get(`/api/songbook?id=${songId}`),
    retry: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    localStorage.setItem("songBookFontSize", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    refetch();
    songBookContainerRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [songId]);

  const handleZoomIN = () => {
    const maxFontSize = window.innerWidth >= 768 ? 23 : 14;

    setFontSize((prevSize: any) => {
      const newSize = prevSize + 1;
      if (newSize > maxFontSize) {
        toast.warning(`Maximum font size reached `, {
          cancel: true,
          duration: 1000,
        });
        return maxFontSize;
      }
      return newSize;
    });
  };

  const handleZoomOUT = () => {
    const minFontSize = window.innerWidth >= 768 ? 14 : 10;

    setFontSize((prevSize: any) => {
      const newSize = prevSize - 1;
      if (newSize < minFontSize) {
        toast.warning(`Minimum font size reached `, {
          cancel: true,
          duration: 1000,
        });
        return minFontSize;
      }
      return newSize;
    });
  };

  const renderParagraphs = (htmlContent: string) => {
    return htmlContent
      ?.split("<p>")
      ?.map((paragraph: string, index: number) => (
        <div
          key={index}
          className='my-4'
          dangerouslySetInnerHTML={{ __html: `<p>${paragraph}` }}
        />
      ));
  };
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsDownloading(true);
      const response = await _axios.post(
        `/api/download/songbookdownload?songbookId=${songId}&format=${data?.format}`,
        null,
        {
          headers: {
            "Content-Type": `${
              data?.format === "pdf" ? "application/pdf" : "text/plain"
            }`,
          },
          responseType: "blob",
        }
      );
      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        `Song-${songId} .${data?.format}` || "Download"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      setIsDownloading(false);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
      setIsDownloading(false);
    }
  }

  return (
    <>
      <main className=' '>
        <div className='px-2  md:px-10 h-[20vh] sticky top-0'>
          <div>
            <div className='flex items-center justify-between'>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger>
                  <Menu className='block md:hidden' />
                </SheetTrigger>
                <SheetContent
                  className='px-0 border-[#1B1B1B] bg-[#1B1B1B]   py-0'
                  side={"left"}>
                  <SheetHeader>
                    <SongBookSideBar onSongBookSelect={handleSongBookSelect} />
                    {/* <Sidebar onSongBookSelect={handleSongBookSelect} /> */}
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <p className=' py-2 md:py-4 text-xs md:text-base text-center font-nirmala'>
                {songLyrics?.data?.data[0]?.name}
              </p>
              <p className=' py-4 text-center  font-nirmala'></p>
            </div>

            <div className='flex items-center gap-4 mt-2 py-2 bg-[#212121] rounded-md justify-around px-2'>
              <audio
                className='w-full'
                controls
                src={songLyrics?.data?.data[0]?.audiourl || ""}></audio>
              <div className='flex items-center gap-4 cursor-pointer text-[#E7B051]'>
                <div>
                  <Minus onClick={() => handleZoomOUT()} />
                </div>
                <div>
                  <Plus onClick={() => handleZoomIN()} />
                </div>
                <div>
                  <ThemeToggle />
                </div>
                <div>
                  <Dialog>
                    <DialogTrigger>
                      <Download />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Download</DialogTitle>
                        <DialogDescription className='font-madefuture'>
                          You can download bible PDF or TXT format
                        </DialogDescription>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='w-2/3 space-y-6'>
                            <FormField
                              control={form.control}
                              name='format'
                              render={({ field }) => (
                                <FormItem className='space-y-3'>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className='flex flex-col space-y-1'>
                                      <FormItem className='flex items-center space-x-3 space-y-0'>
                                        <FormControl>
                                          <RadioGroupItem value='pdf' />
                                        </FormControl>
                                        <FormLabel className='font-readux'>
                                          PDF Format
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className='flex items-center space-x-3 space-y-0'>
                                        <FormControl>
                                          <RadioGroupItem value='txt' />
                                        </FormControl>
                                        <FormLabel className='font-readux'>
                                          TXT Format
                                        </FormLabel>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button disabled={isDownloading}>
                              {isDownloading ? (
                                <LoaderCircle
                                  className={`mr-2 h-4 w-4 ${
                                    isDownloading ? "animate-spin" : ""
                                  }`}
                                />
                              ) : (
                                <Download className='h-4 w-4 mr-2' />
                              )}
                              {isDownloading ? "Processing" : "Download"}
                            </Button>
                          </form>
                        </Form>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={songBookContainerRef}
          className='h-[80vh] w-full overflow-x-hidden  overflow-y-scroll'>
          <div
            className=' font-nirmala   gap-y-2 px-1 md:px-4 py-5'
            style={{ fontSize: `${fontSize}px` }}>
            {isSongLyricsLoading ? (
              <div className='flex h-[70vh] items-center justify-center'>
                <CircularProgressIndicator />
              </div>
            ) : (
              <div className=' font-nirmala '>
                {renderParagraphs(songLyrics?.data?.data?.[0]?.lyrics)}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
