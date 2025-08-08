import Navbar from "@/components/Navbar/Navbar";
import { ThemeToggle } from "@/components/themetoggler";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Download, LoaderCircle, Minus, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgressIndicator } from "@/components/LoadingIndicator";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";

const FormSchema = z.object({
  format: z.enum(["pdf", "txt"], {
    required_error: "You need to select a notification format.",
  }),
});
const TamilSpDocx = () => {
  const tamilSPBooksRef = useRef<any>(null);
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("tamilSpFontSize");
    return savedFontSize ? parseInt(savedFontSize) : 19;
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    localStorage.setItem("tamilSpFontSize", fontSize.toString());
  }, [fontSize]);

  let bookId: any = searchParams.get("BookId");

  const {
    data: books,
    isLoading: isLoading,
    isError: isErrorBooks,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["tamilSpBookdocxview", bookId],
    queryFn: () => {
      return _axios.get(`/api/tamil-specialbook/getall?id=${bookId}`);
    },
  });
  useEffect(() => {
    refetchBooks();
    tamilSPBooksRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [bookId]);

  if (isLoading)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <CircularProgressIndicator />
      </div>
    );
  if (isErrorBooks)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );
  const handleZoomIN = () => {
    const maxFontSize = window.innerWidth >= 768 ? 23 : 17;

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
    const minFontSize = window.innerWidth >= 768 ? 14 : 12;

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
        `/api/download/tamilspecialbookdownload?bookId=${bookId}&format=${data?.format}`,
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
        `Book-${bookId} .${data?.format}` || "Download"
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
      <main className={``}>
        <Navbar />
        <div className='px-5 md:px-10  sticky top-0'>
          <div>
            <div className='flex items-center justify-between'>
              <ChevronLeft
                size={35}
                className=' text-[#E7B051] cursor-pointer'
                onClick={() => navigate(-1)}
              />
              <p className='py-2 text-center font-nirmala bg-clip-text text-transparent bg-gradient-to-r from-[#E7B051] via-[#A66C00] via-[#F3B233] via-[#BB7E03] to-[#E7BA57]'>
                {books?.data?.data?.[0]?.title}
              </p>
              <p></p>
            </div>

            <div className='flex items-center gap-4 mt-2 py-2 bg-[#212121] rounded-md justify-around px-2'>
              <audio
                className='w-full'
                controls
                src={books?.data?.data?.[0]?.audiourl || ""}></audio>
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
                          Download {books?.data?.data?.[0]?.booktitle}
                        </DialogTitle>
                        <DialogDescription className='font-madefuture'>
                          You can download PDF or TXT format
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
          ref={tamilSPBooksRef}
          className=' overflow-x-hidden px-3  md:px-20  overflow-y-scroll mt-5 h-[63vh] md:h-[74vh] w-full [&::-webkit-scrollbar]:hidden  '>
          <div
            className=' font-nirmala   gap-y-2 px-1 md:px-4 py-5'
            style={{ fontSize: `${fontSize}px` }}>
            <div className=' font-nirmala '>
              {renderParagraphs(books?.data?.data?.[0]?.content)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TamilSpDocx;
