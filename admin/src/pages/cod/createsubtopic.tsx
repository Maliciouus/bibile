import CirculaProgress from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
// import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
export default function CreateSubTopic() {
  //   const router = useRouter();
  //   const searchParams = useSearchParams();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [modelOpen, setModelOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    subtopic: "",
    topic: "",
  });

  const subtopic = searchParams.get("topic");

  const { mutate } = useMutation({
    onSuccess() {
      setFormValues({
        subtopic: "",
        topic: "",
      });
      setModelOpen(false);
      refetch();
    },
    mutationFn: () => _axios.post("/api/cod/createSubtopic", formValues),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["subtopics"],
    queryFn: () =>
      _axios.get(
        `/api/cod/getSubtopics/${Number(searchParams.get("subtopic"))}`
      ),
  });

  const { mutate: handleDeleteSubtopic } = useMutation({
    //@ts-ignore
    mutationFn: (book: any) => {
      return _axios.delete(
        `/api/cod/deletesubtopic?id=${book?.id}&topicId=${parseInt(
          book?.topicid
        )}`
      );
    },
    // @ts-ignore
    onSuccess: (data: any) => {
      refetch();
    },
  });

  if (isLoading) return <CirculaProgress />;
  if (isError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
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
                Cod Subtopics
              </h1>
              <p className='text-xs font-500 text-slate-400'>
                {" "}
                {subtopic ?? "Cod Subtopics"}
              </p>
            </div>
          </div>
        </div>

        <Dialog open={modelOpen} onOpenChange={setModelOpen}>
          <DialogTrigger asChild>
            <Button className='bg-black text-white' variant='outline'>
              Add Subtopic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new Subtopic ? - ({subtopic})</DialogTitle>
              <DialogDescription>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormValues({
                      ...formValues,
                      topic: searchParams.get("subtopic") ?? "",
                    });

                    mutate();
                  }}>
                  <div className='flex flex-col gap-2 py-4'>
                    <Label>Subtopic</Label>
                    <Input
                      name='topic'
                      type='text'
                      placeholder=''
                      required
                      value={formValues.subtopic}
                      onChange={(e) => {
                        setFormValues({
                          ...formValues,
                          subtopic: e.target.value,
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

      <div className='h-[calc(100vh-200px)] grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 overflow-y-auto'>
        {data &&
          data.data &&
          data.data.data.length > 0 &&
          data.data.data.map((book: any) => (
            <div>
              <Card
                className='w-full h-[100px] flex text-center justify-center border border-slate-200 items-center font-bold cursor-pointer hover:bg-slate-900 hover:transition-colors hover:duration-[0.8s] hover:text-white group'
                key={book.subtopicid}
                onClick={() => {
                  navigate(
                    `/layout/cod/?type=createquestion&topicName=${
                      book.subtopicid
                    }&topic=${
                      book.topicid
                    }&subtopicQuestion=${true}&subtopicId=${book.id}`
                  );
                }}>
                <CardContent>{book?.subtopicid}</CardContent>
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
                              {book?.subtopicid}
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
                          handleDeleteSubtopic(book);
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
    </main>
  );
}
