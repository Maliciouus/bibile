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
import { Card, CardContent } from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeft, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CirculaProgress from "@/components/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
const FormSchema = z.object({
  title: z.string().min(1, "title is required").max(40, "title is too long"),
  description: z.string().max(100, "description is too long"),
});
const Gallery = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any>([]);
  const [imageId, setImageId] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let titleId = searchParams.get("titleId");
  let title = searchParams.get("title");

  // const [imagesTitle, setImagesTitle] = useState<any>("");
  // const [imagesDescription, setImagesDescription] = useState<any>("");
  function openFile() {
    fileRef.current?.click();
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await _axios.post(
        `/api/gallery/description?imageId=${imageId}`,
        data
      );
      if (response?.status === 200) {
        refetch();
        toast.success("Description added");
        setImageId(null);
        setIsModalOpen(false);
        form.reset();
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  function onFileChange(e: any) {
    const selectedFiles = e.target.files;
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > 20) {
      toast.error("You can only select up to 20 files");
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
      return _axios.delete(`/api/gallery/deleteimage?imageId=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        refetch();
        toast.success("image deleted successfully");
      }
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append(`images`, files[i]);
      }
      return _axios.post(
        `/api/gallery/uploadimage?titleId=${titleId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (data) => {
      setFiles([]);
      if (data?.status === 200) {
        toast.success("images uploaded successfully");
        refetch();
      }
    },
    //@ts-ignore
    onError: (error) => {
      toast.error("Failed to upload images");
      setFiles([]);
    },
  });

  const {
    data: gallery,
    isLoading: isGalleryLoading,
    isError: isGalleryError,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["gallery"],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/gallery/getimages?titleId=${titleId}&page=${pageParam}&limit=20`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.data?.length === 20 ? nextPage : undefined;
    },
  });

  const handleUpload = () => {
    mutate();
  };

  if (isGalleryLoading) return <CirculaProgress />;
  if (isGalleryError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Something went wrong</div>
      </div>
    );

  return (
    <>
      <main className='p-5'>
        <div className='flex gap-2 justify-between'>
          <div className='flex gap-2 items-center justify-center'>
            <div className='flex justify-center items-center gap-2'>
              <ChevronLeft
                onClick={() => navigate(-1)}
                className='cursor-pointer'
              />
            </div>

            <div className='flex gap-2'>
              <div className='flex flex-col gap-2 items-start justify-between'>
                <h1 className='text-lg font-semibold md:text-2xl'>
                  Upload Images &nbsp; ({gallery?.pages?.[0]?.totalCount?.total}
                  )
                </h1>
                <p className='text-xs font-500 text-slate-400'>{title}</p>
              </div>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button>Upload</Button>
            </SheetTrigger>
            <SheetContent className='h-screen'>
              <SheetHeader>
                <SheetTitle>Upload Images</SheetTitle>
                <SheetDescription className='flex items-center justify-between'>
                  You can upload a maximum of 20 files
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
                accept='image/*'
                multiple
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className='overflow-x-hidden pt-3 px-3 overflow-y-auto max-h-[70vh]'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {gallery?.pages?.flatMap((page) =>
              page?.data?.map((image: any) => (
                <Card key={image.id} className=''>
                  <CardContent className=' p-0'>
                    <img
                      src={image?.imageurl}
                      alt={image?.imagename}
                      className='h-full w-full object-contain rounded'
                    />

                    <div className='p-2'>
                      {image?.title && (
                        <h1 className='text-center font-bold truncate'>
                          {image?.title}
                        </h1>
                      )}
                      {image?.description && (
                        <p className='mt-1 text-sm text-center truncate'>
                          {image?.description}
                        </p>
                      )}
                    </div>
                  </CardContent>

                  <div className='flex p-1 gap-3 items-center justify-end'>
                    <div className='cursor-pointer mt-2'>
                      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                          <Icon
                            onClick={() => {
                              setImageId(image?.id);
                              form.reset({
                                title: image?.title || "",
                                description: image?.description || "",
                              });
                              setIsModalOpen(true);
                            }}
                            className='h-5 text-gray-500 w-5'
                            icon={"icon-park-outline:edit-one"}
                          />
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-[525px]'>
                          <DialogHeader>
                            <DialogTitle>
                              Add Description (Optional)
                            </DialogTitle>
                            <DialogDescription>
                              Add description to your image
                            </DialogDescription>
                          </DialogHeader>
                          <div className='grid gap-4 py-4'>
                            <div>
                              <Form {...form}>
                                <form
                                  onSubmit={form.handleSubmit(onSubmit)}
                                  className='flex flex-col gap-y-5'>
                                  <div>
                                    <Label htmlFor='title' className=''>
                                      Title
                                    </Label>
                                    <FormField
                                      control={form.control}
                                      name='title'
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              id='title'
                                              className='mt-2 focus:outline-none'
                                              {...field}
                                              value={field.value || ""}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor='description' className=''>
                                      Description
                                    </Label>
                                    <FormField
                                      control={form.control}
                                      name='description'
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Textarea
                                              id='description'
                                              className='mt-2 focus:outline-none'
                                              {...field}
                                              value={field.value || ""}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className='mt-3 flex justify-end'>
                                    <Button type='submit'>Submit</Button>
                                  </div>
                                </form>
                              </Form>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className='cursor-pointer mt-2'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Icon
                            className='h-5 text-gray-500 w-5'
                            icon={"icon-park-outline:delete-one"}
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
                                    {image?.imagename}
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
                              onClick={() => handleDelete(image?.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          <div className='flex py-2 justify-center'>
            <Button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}>
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load More"
                : "No more messages"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Gallery;
