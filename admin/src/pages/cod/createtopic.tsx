import CirculaProgress from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { _axios } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
export default function CreateTopic() {
  const navigate = useNavigate();
  const [modelOpen, setModelOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    hassubheadings: false,
  });

  const { mutate } = useMutation({
    mutationFn: () => _axios.post("/api/cod/create", formValues),
    onSuccess() {
      setFormValues({
        title: "",
        hassubheadings: false,
      });
      setModelOpen(false);
      refetch();
    },
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["headings"],
    queryFn: () => _axios.get("/api/cod/headings"),
  });

  const { mutate: handleDeleteHeading } = useMutation({
    mutationFn: (id) => {
      return _axios.delete(`/api/cod/deleteheadings?headingId=${id}`);
    },
    onSuccess: (data: any) => {
      if (data?.status === 200) {
        toast.success("Topic deleted successfully");
        refetch();
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [formValues]);

  if (isLoading) return <CirculaProgress />;
  if (isError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl bg-red-600'>Some thing went wrong</div>
      </div>
    );

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <div className='flex gap-2 justify-between'>
        <div className='flex flex-col gap-2 items-start'>
          <h1 className='text-lg font-semibold md:text-2xl'>Cod Questions</h1>
          <div className='text-xs font-500 text-slate-400'>
            Cod Questions from Bible.
          </div>
        </div>

        <Dialog open={modelOpen} onOpenChange={setModelOpen}>
          <DialogTrigger asChild>
            <Button className='bg-black text-white' variant='outline'>
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new topic ?</DialogTitle>
              <DialogDescription>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutate();
                  }}>
                  <div className='flex gap-2 py-4'>
                    <Input
                      name='topic'
                      type='text'
                      placeholder='அனைத்து கேள்விகளும்'
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

                  <div className='flex gap-2 justify-start items-center pb-4 px-1'>
                    <Label>Have Sub Topics ? </Label>
                    <Checkbox
                      checked={formValues.hassubheadings}
                      onClick={() => {
                        setFormValues({
                          ...formValues,
                          hassubheadings: !formValues.hassubheadings,
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
            data.data.data.map((book: any) => (
              <div key={book.id}>
                <Card
                  className='w-full h-[100px] flex text-center justify-center border border-slate-200 items-center font-bold cursor-pointer hover:bg-slate-900 hover:transition-colors hover:duration-[0.8s] hover:text-white group'
                  onClick={() => {
                    if (book.hassubheadings == 0) {
                      navigate(
                        `/layout/cod?type=createquestion&topic=${book.id}&topicName=${book.title}`
                      );
                    } else if (book.hassubheadings == 1) {
                      navigate(
                        `/layout/cod?type=subtopic&subtopic=${book.id}&topic=${book.title}`
                      );
                    }
                  }}>
                  <CardContent>{book?.title}</CardContent>
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
                                {book?.title}
                              </span>{" "}
                              will be permanently deleted. This action cannot be
                              undone.
                            </div>
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteHeading(book?.id);
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
  );
}
