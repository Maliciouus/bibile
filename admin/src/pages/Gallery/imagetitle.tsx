import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import CirculaProgress from "@/components/loading";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const ImageTitle = () => {
  const [modelOpen, setModelOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
  });
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: () => _axios.post("/api/gallery/createtitle", formValues),
    // @ts-ignore
    onSuccess(data: any) {
      setFormValues({
        title: "",
      });
      refetch();
      setModelOpen(false);
    },
  });

  const { refetch, isLoading, isError, data } = useQuery({
    queryKey: ["imagetitles"],
    queryFn: () => _axios.get("/api/gallery/imagetitles"),
  });

  const { mutate: handleDeleteTitle } = useMutation({
    mutationFn: (id) => {
      return _axios.delete(`/api/gallery/deletetitle?id=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("Title deleted successfully");
        refetch();
      }
    },
  });

  if (isLoading) return <CirculaProgress />;
  if (isError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl bg-red-600'>Some thing went wrong</div>
      </div>
    );

  return (
    <>
      {/* <Tabs defaultValue='gallery' className='p-4'>
        <TabsList className=' bg-gray-800'>
          <TabsTrigger value='gallery'>Gallery</TabsTrigger>
          <TabsTrigger value='pdfGallery'>PDF Gallery</TabsTrigger>
        </TabsList>
        <TabsContent className='w-full' value='gallery'></TabsContent>
        <TabsContent className='w-full' value='pdfGallery'>
          <Pdfgallery />
        </TabsContent>
      </Tabs> */}
      <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
        <div className='flex gap-2 justify-between'>
          <div className='flex flex-col gap-2 items-start'>
            <h1 className='text-lg font-semibold md:text-2xl'>Image Title</h1>
            <div className='text-xs font-500 text-slate-400'>
              Add image titles here!
            </div>
          </div>

          <Dialog open={modelOpen} onOpenChange={setModelOpen}>
            <DialogTrigger asChild>
              <Button className='bg-black text-white' variant='outline'>
                Add Title
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new Title ?</DialogTitle>
                <DialogDescription>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      mutate();
                    }}>
                    <div className='flex gap-2 py-4'>
                      <Input
                        name='title'
                        type='text'
                        placeholder='Enter Title'
                        required
                        value={formValues.title}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            title: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <Button type='submit'>Create</Button>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className='h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:hidden'>
          <div className='grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
            {data &&
              data.data &&
              data.data.data.length > 0 &&
              data.data.data.map((imagetitle: any) => (
                <div key={imagetitle.id}>
                  <Card
                    className='w-full h-[100px] flex text-center justify-center border border-slate-200 items-center font-bold cursor-pointer hover:bg-slate-900 hover:transition-colors hover:duration-[0.8s] hover:text-white group'
                    onClick={() => {
                      navigate(
                        `/layout/gallery?type=uploadimage&titleId=${imagetitle?.id}&title=${imagetitle?.title}`
                      );
                    }}>
                    <CardContent>{imagetitle?.title}</CardContent>
                  </Card>
                  <div className='flex items-center mt-1 justify-center'>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Icon
                          className='h-8 w-8 cursor-pointer text-red-500'
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
                              <div>
                                <span className='font-extrabold'>
                                  {imagetitle?.title}
                                </span>{" "}
                                will be permanently deleted. This action cannot
                                be undone.
                              </div>
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              handleDeleteTitle(imagetitle?.id);
                            }}>
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
      </main>
    </>
  );
};

export default ImageTitle;
