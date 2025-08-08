import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Download, LoaderCircle, Menu, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { ThemeToggle } from "../components/themetoggler";
import BibleSideBar from "@/components/sidebars/bibilesidebar";
const FormSchema = z.object({
  format: z.enum(["pdf", "txt"], {
    required_error: "You need to select a notification format.",
  }),
});

export default function RootBible() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const bibleContainerRef = useRef<any>(null);
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("bibleFontSize");
    return savedFontSize ? parseInt(savedFontSize) : 17;
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const handleBibleSelect = () => {
    setIsSheetOpen(false);
  };

  useEffect(() => {
    localStorage.setItem("bibleFontSize", fontSize.toString());
  }, [fontSize]);

  let bookname =
    searchParams.get("book") ||
    localStorage.getItem("MainBiblename") ||
    "ஆதியாகமம்";
  let chapter: any =
    searchParams.get("chapter") || localStorage.getItem("MainChapter") || 1;
  // @ts-ignore
  let storedMainBible = localStorage.setItem("MainBiblename", bookname);
  // @ts-ignore
  let storedMainChapter = localStorage.setItem("MainChapter", chapter);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["chapter_count"],
    queryFn: () =>
      _axios.get(`/api/bible/chapter?chapter=${chapter}&book=${bookname}`),
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  });

  useEffect(() => {
    refetch();
    bibleContainerRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapter, bookname]);

  if (isLoading)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );
  if (isError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );
  const handleZoomIN = () => {
    const maxFontSize = window.innerWidth >= 768 ? 23 : 13;

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
    const minFontSize = window.innerWidth >= 768 ? 14 : 11;

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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsDownloading(true);
      const response = await _axios.post(
        `/api/download/bibledownload?title=${bookname}&chapter=${chapter}&format=${data?.format}`,
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
        `${bookname}-${chapter}.${data?.format}` || "Download"
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
    <main className={``}>
      <div className='px-5 md:px-10  sticky top-0'>
        <div>
          <div className='flex py-2  items-center justify-between'>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger>
                <Menu className='block md:hidden' />
              </SheetTrigger>
              <SheetContent
                className='px-0 py-0 bg-[#1B1B1B] border-[#1B1B1B]'
                side={"left"}>
                {/* <Sidebar onBibleSelect={handleBibleSelect} /> */}
                <BibleSideBar onBibleSelect={handleBibleSelect} />
              </SheetContent>
            </Sheet>
            <p className='  text-center text-xs md:text-sm  font-nirmala'>
              {bookname} - {chapter}
            </p>
            <p className='  text-center  font-nirmala'></p>
          </div>

          <div className='flex items-center gap-4 mt-2 py-2 bg-[#212121] rounded-md justify-around px-2'>
            <audio
              className='w-full'
              controls
              src={data?.data?.data?.audioUrl || ""}></audio>
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
                      <DialogTitle>
                        Download {bookname}- {chapter}
                      </DialogTitle>
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
          <div className='flex z-50 justify-center px-10 pt-1'>
            <Carousel
              opts={{
                align: "center",
                dragFree: true,
              }}
              className=' w-[200px] md:w-[350px]'>
              <CarouselContent>
                {Array.from({ length: data?.data?.data?.chapter_count }).map(
                  (_, index) => (
                    <CarouselItem key={index} className='basis-16'>
                      <Badge
                        key={index}
                        onClick={() => {
                          if (index + 1 == chapter) {
                            return;
                          }

                          navigate(
                            `/layout/bible?type=books&book=${bookname}&chapter=${
                              index + 1
                            }`
                          );
                        }}
                        className={`w-10 h-10 rounded-md bg-[#1b1b1b] cursor-pointer group-hover:bg-slate-100 group-hover:text-slate-900 text-white font-bold text-xs flex hover:bg-slate-900 items-center justify-center ${
                          index + 1 == chapter
                            ? "bg-[#E7B051] text-black hover:bg-white border-2 border-slate-900"
                            : ""
                        }`}>
                        {index + 1}
                      </Badge>
                    </CarouselItem>
                  )
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>

      <div
        ref={bibleContainerRef}
        className=' overflow-x-hidden overflow-y-scroll mt-5 h-[77vh] w-full [&::-webkit-scrollbar]:hidden  '>
        <div
          className=' font-nirmala   gap-y-2 px-1  md:px-4 lg:px-10 '
          style={{ fontSize: `${fontSize}px` }}>
          <>
            {data?.data?.data?.verses &&
              data?.data?.data?.verses.map((verse: any) => (
                <p className='leading-relaxed mb-2' key={verse.verse}>
                  {verse.versecount} . {verse.verse}
                </p>
              ))}
          </>
        </div>
      </div>
    </main>
  );
}
