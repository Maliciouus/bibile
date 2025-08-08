import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { _axios } from "@/lib/axios";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
const formSchema = z.object({
  titles: z.array(z.string().min(1, "Title is required")),
});

type FormData = z.infer<typeof formSchema>;

const CreateEnglishSermons = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titles: [""],
    },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    //@ts-ignore
    name: "titles",
  });
  const [modelOpen, setModelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookname, setSelectedBookname] = useState<any>(null);
  const [selectedBookId, setSelectedBookId] = useState<any>(null);
  const {
    data: getallBooks,
    isLoading: isallBookLoading,
    isError: isallBookError,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["getallTitles", pagination.page, pagination.limit, searchQuery],
    queryFn: () =>
      _axios.get(
        `/api/englishtable/getalltitles?page=${pagination.page}&limit=${pagination.limit}&search=${searchQuery}`
      ),
  });
  const handleSearch = (query: any) => {
    if (query) {
      setSearchQuery(query);
      setPagination({
        page: 1,
        limit: 25,
        total: 0,
      });
    } else {
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (getallBooks) {
      setPagination((prev) => ({
        ...prev,
        total: getallBooks?.data?.totalCount?.total,
      }));
    }
  }, [getallBooks]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };
  const totalPages = useMemo(
    () => Math.ceil(pagination.total / pagination.limit),
    [pagination.total, pagination.limit]
  );

  const { mutate, isPending } = useMutation({
    mutationKey: ["englishsermon"],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return _axios.post(`/api/englishtable/create`, {
        titles: values.titles,
      });
    },
    onSuccess() {
      toast.success("Titles created successfully");
      form.reset();
      setModelOpen(false);
      refetchBooks();
    },
  });

  const onSubmit = async (values: FormData) => {
    console.log(values);
    mutate(values);
  };

  const updateName = async () => {
    try {
      const res = await _axios.put(
        `/api/englishtable/updatetitle?id=${selectedBookId}`,
        {
          name: selectedBookname,
        }
      );

      if (res?.status === 200) {
        refetchBooks();
        toast.success(" Title updated successfully");
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  if (isallBookError)
    return (
      <div className='flex justify-center items-center h-[75vh]'>
        <div className='text-xl text-red-600'>Some thing went wrong</div>
      </div>
    );
  return (
    <>
      <div className='p-5'>
        <div className='flex gap-2 justify-between'>
          <div className='flex flex-col gap-2 items-start'>
            <h1 className='text-lg font-semibold md:text-2xl'>
              English Sermon
            </h1>
            <div className='text-xs font-500 text-slate-400'>
              Create your English Sermon
            </div>
          </div>

          <div className='flex gap-2 items-center'>
            <div>
              <Input
                id='search'
                type='text'
                value={searchQuery}
                onChange={(e: any) => {
                  handleSearch(e.target.value);
                }}
                className='rounded-lg placeholder:font-bold focus-visible:ring-transparent'
                placeholder='Search...'
              />
            </div>

            <Button
              onClick={() => {
                setModelOpen(true);
              }}>
              Add
            </Button>
          </div>
        </div>
        <div className='overflow-x-hidden pt-2 overflow-y-auto max-h-[70vh]'>
          <Table className='w-full border'>
            <TableHeader className=''>
              <TableRow style={{ fontSize: "15px" }} className=''>
                <TableHead className=' '>S.No</TableHead>
                <TableHead className=' '>Book Name</TableHead>
                <TableHead className='text-center '>Edit Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=''>
              {isallBookLoading && (
                <TableRow>
                  <TableCell>Loading...</TableCell>
                </TableRow>
              )}
              {getallBooks?.data?.data?.map((title: any, i: any) => (
                <TableRow key={title?.id}>
                  <TableCell className='text-ellipsis  '>
                    {i + (pagination.page - 1) * pagination.limit + 1}
                  </TableCell>
                  <TableCell className='text-ellipsis  '>
                    {title?.title}
                  </TableCell>

                  <TableCell className='text-center py-0'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setSelectedBookname(title?.title);
                            setSelectedBookId(title?.id);
                          }}
                          className='text-center'
                          variant='outline'
                          size='icon'>
                          <Icon
                            className='h-5 w-5'
                            icon={"icon-park-outline:edit-one"}
                          />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-[725px]'>
                        <DialogHeader>
                          <DialogTitle>Edit Books Name</DialogTitle>
                          <DialogDescription>
                            Edit the name of the book
                          </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div>
                            <Input
                              className='focus:outline-none'
                              // {...field}
                              // value={field.value || ""}
                              value={selectedBookname}
                              onChange={(e) =>
                                setSelectedBookname(e.target.value)
                              }
                            />
                            <div className='mt-3 flex justify-end'>
                              <Button
                                onClick={() => updateName()}
                                type='submit'>
                                Submit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {getallBooks?.data?.data?.length > 0 && (
          <div className='flex justify-between'>
            <Pagination className='mt-6 justify-end'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={() => {
                      if (pagination.page === 1) return;
                      handlePageChange(pagination.page - 1);
                    }}
                    className={`${
                      pagination.page === 1
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer opacity-100"
                    }`}
                  />
                </PaginationItem>
                {pagination.page > 3 && (
                  <PaginationItem>
                    <PaginationLink
                      href='#'
                      onClick={() => handlePageChange(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}
                {pagination.page > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNumber = pagination.page + i - 1;
                  if (pageNumber > 0 && pageNumber <= totalPages) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href='#'
                          isActive={pageNumber === pagination.page}
                          onClick={() => handlePageChange(pageNumber)}>
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                {pagination.page < totalPages - 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {pagination.page < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink
                      href='#'
                      onClick={() => handlePageChange(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={() => {
                      if (pagination.page === totalPages) return;
                      handlePageChange(pagination.page + 1);
                    }}
                    className={`${
                      pagination.page === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer opacity-100"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={modelOpen} onOpenChange={setModelOpen}>
        <DialogContent className='font-ct min-w-[calc(100vw-40%)] flex flex-col h-[calc(100vh-8rem)] focus-visible:ring-transparent'>
          <DialogHeader>
            <DialogTitle className='text-button text-2xl font-bold'>
              Add Sermons
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              className='flex-1 overflow-y-auto items-center px-5 space-y-3'
              onSubmit={form.handleSubmit(onSubmit)}>
              {fields.map((field, index) => (
                <div key={field.id} className='mb-4'>
                  <FormField
                    control={form.control}
                    name={`titles.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title {index + 1}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Enter title' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={() => remove(index)}
                    className='mt-2'>
                    Remove
                  </Button>
                </div>
              ))}

              <div className='mt-4 flex justify-end'>
                <Button type='button' onClick={() => append("")}>
                  Add Title
                </Button>
              </div>
            </form>
          </Form>

          <div className='flex justify-end p-4 border-t border-gray-200 mt-4'>
            <Button
              type='button'
              onClick={() => {
                form.reset();
                setModelOpen(false);
              }}
              variant='secondary'
              className='mr-2 rounded-lg px-10'>
              Cancel
            </Button>
            <Button
              className='mr-2 rounded-lg hover:bg-button_hover px-10'
              type='submit'
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}>
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateEnglishSermons;
