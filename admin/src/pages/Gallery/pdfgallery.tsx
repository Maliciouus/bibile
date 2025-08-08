import { useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import CirculaProgress from "@/components/loading";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { pageThumbnailPlugin } from "./pageThumbnailPlugin";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
// import pdfimage from "../../../public/ஆனாலும் அவைகளுக்கு இளைப்பாறுதல் தேவையே.pdf";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { config } from "@/lib/config";

const Pdfgallery = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  const thumbnailPluginInstance = thumbnailPlugin();
  const { Cover } = thumbnailPluginInstance;
  //@ts-ignore
  const pageThumbnailPluginInstance = pageThumbnailPlugin({
    PageThumbnail: <Cover getPageIndex={() => 0} />,
  });

  function openFile() {
    fileRef.current?.click();
  }

  const onFileChange = (e: any) => {
    const selectedFiles = e.target.files;
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > 5) {
      toast.error("You can only upload a maximum of 5 files");
      return;
    }

    if (selectedFiles) {
      setFiles((prevFiles: any) => [...prevFiles, ...selectedFiles]);
    } else {
      setFiles([]);
    }
  };

  const {
    data: allpdfs,
    isLoading: allpdfsLoading,
    isError: allpdfsError,
    refetch: pdfsRefetch,
  } = useQuery({
    queryKey: ["gallerypdf"],
    queryFn: () => _axios.get("/api/gallery/getpdfs"),
  });

  const { mutate: deletepdf } = useMutation({
    mutationFn: (id: any) => {
      return _axios.delete(`/api/gallery/deletepdf?pdfId=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        pdfsRefetch();
        toast.success("File deleted successfully");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  if (allpdfsLoading) return <CirculaProgress />;
  if (allpdfsError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Something went wrong</div>
      </div>
    );

  return (
    <>
      <main className='p-5'>
        <div className='flex gap-2 justify-between'>
          <div className='flex flex-col gap-2 items-start'>
            <h1 className='text-lg font-semibold md:text-2xl'>PDF Gallery</h1>
            <div className='text-xs font-500 text-slate-400'>
              Manage your PDF gallery here
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button>Upload</Button>
            </SheetTrigger>
            <SheetContent className='h-screen'>
              <SheetHeader>
                <SheetTitle>Upload PDF Files</SheetTitle>
                <SheetDescription className='flex items-center justify-between'>
                  You can upload a maximum of 5 files
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

              {files.length > 0 && <Button className='w-full'>upload</Button>}

              <input
                type='file'
                ref={fileRef}
                className='hidden'
                onChange={onFileChange}
                accept='.pdf'
                multiple
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className='overflow-x-hidden pt-2 px-3 overflow-y-auto max-h-[70vh]'>
          <div className='grid grid-cols-2 md:grid-cols-3  gap-4'>
            {allpdfs?.data?.data?.map((pdf: any) => (
              <div
                key={pdf.id}
                className='border-dashed p-2 border-slate-200 bg-slate-100 my-4 rounded-md flex flex-col'>
                <div onClick={() => setSelectedPdf(pdf.id)}>
                  <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
                    <div
                      style={{
                        height: "200px",
                        width: "100%",
                      }}>
                      <Viewer
                        fileUrl={`${config.baseUrl}/api/gallery/viewpdf?pdfId=${pdf.id}`}
                        plugins={[thumbnailPluginInstance]}
                        defaultScale={0.4}
                        enableSmoothScroll
                        initialPage={0}
                        key={pdf.id}
                      />
                    </div>
                  </Worker>
                </div>
                <div className='flex flex-col justify-between flex-grow'>
                  <p className='text-slate-400 text-xs text-start mt-2'>
                    {pdf.pdfname}
                  </p>
                  <div className='flex justify-end mt-2'>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Icon
                          className='h-5 text-gray-500 w-5 cursor-pointer'
                          icon={"icon-park-outline:delete-one"}
                        />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <p>
                              <span className='font-extrabold'>
                                {pdf.pdfname}
                              </span>{" "}
                              will be permanently deleted. This action cannot be
                              undone.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletepdf(pdf?.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
        <DialogContent className='h-[500px] max-w-3xl overflow-y-scroll '>
          {selectedPdf && (
            <>
              <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
                <Viewer
                  fileUrl={`${config.baseUrl}/api/gallery/viewpdf?pdfId=${selectedPdf}`}
                  enableSmoothScroll
                  initialPage={0}
                  plugins={[thumbnailPluginInstance]}
                  defaultScale={1}
                />
              </Worker>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Pdfgallery;
