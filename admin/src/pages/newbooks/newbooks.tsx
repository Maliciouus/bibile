import CirculaProgress from "@/components/loading";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
const FormSchema = z.object({
  title: z.string().min(1, "Main title is required"),
  subtitles: z.array(
    z.object({
      subtitle: z.string().min(1, "Subtitle is required"),
      books: z.array(
        z.object({ name: z.string().min(1, "Book name is required") })
      ),
    })
  ),
});

const NewBooks = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      subtitles: [{ subtitle: "", books: [{ name: "" }] }],
    },
  });

  const {
    fields: subtitleFields,
    append: appendSubtitle,
    remove: removeSubtitle,
  } = useFieldArray({
    control: form.control,
    name: "subtitles",
  });

  const [modelOpen, setModelOpen] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);
  const [currBook, setCurrBook] = useState<any>();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { mutate, isPending } = useMutation({
    mutationKey: ["newbookscreate"],
    mutationFn: async (values: z.infer<typeof FormSchema>) => {
      return editEnabled
        ? _axios.put(`/api/newbooks/updatebook?id=${currBook?.id}`, values)
        : _axios.post(`/api/newbooks/create`, values);
    },
    onSuccess() {
      toast.success(
        `${editEnabled ? "Book Updated" : "Book Added"} successfully`
      );
      form.reset();
      setModelOpen(false);
      refetch();
    },
  });
  const {
    data: newbooks,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["newbooksget", pagination.page, pagination.limit, searchQuery],
    queryFn: () => {
      return _axios.get(
        `/api/newbooks/getall?page=${pagination.page}&limit=${pagination.limit}&search=${searchQuery}`
      );
    },
  });
  const { mutate: handleDelete } = useMutation({
    mutationFn: (id: any) => {
      return _axios.delete(`/api/newbooks/deletebook?id=${id}`);
    },
    onSuccess() {
      toast.success("Book deleted successfully");
      refetch();
    },
  });

  useEffect(() => {
    if (newbooks) {
      setPagination((prev) => ({
        ...prev,
        total: newbooks?.data?.totalCount?.count,
      }));
    }
  }, [newbooks]);

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
  const handleSearch = (query: any) => {
    if (query) {
      setSearchQuery(query);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
      });
    } else {
      setSearchQuery("");
    }
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    mutate(values);
  };

  useEffect(() => {
    if (editEnabled && currBook) {
      form.setValue("title", currBook.title);
      form.setValue("subtitles", currBook.subtitles);
    }
  }, [editEnabled, currBook]);

  const handleAddBook = (index: number) => {
    const subtitles = form.getValues("subtitles");
    subtitles[index].books.push({ name: "" });
    form.setValue("subtitles", subtitles);
  };

  const handleRemoveBook = (index: number, bookIndex: number) => {
    const subtitles = form.getValues("subtitles");
    if (subtitles[index].books.length > 1) {
      subtitles[index].books.splice(bookIndex, 1);
      form.setValue("subtitles", subtitles);
    }
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex gap-2 justify-between items-center">
          <div className="flex flex-col gap-2 items-start">
            <h1 className="text-lg font-semibold md:text-2xl">New books</h1>
            <p className="text-xs font-500 text-slate-400">
              Manage your New books here!
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <div>
              <Input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e: any) => {
                  handleSearch(e.target.value);
                }}
                className="  rounded-lg  placeholder:font-bold focus-visible:ring-transparent"
                placeholder="Search..."
              />
            </div>

            <Button
              onClick={() => {
                setModelOpen(true);
                form.reset();
                setEditEnabled(false);
              }}
            >
              Add
            </Button>
          </div>
        </div>
        {isLoading && (
          <div className="flex h-[70vh] items-center justify-center">
            <CirculaProgress />
          </div>
        )}

        {newbooks?.data?.parsedBooks?.length === 0 && !isLoading && (
          <div className="flex items-center justify-center">
            <p className="text-red-500 text-xl">No books found</p>
          </div>
        )}

        <div className="mt-2 w-full px-12 h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 items-stretch ">
            {newbooks?.data?.parsedBooks?.map((book: any) => (
              <Card key={book?.id} className="p-0 mb-3">
                <CardHeader className="p-0">
                  <CardTitle className="p-3  text-center text-lg font-bold  leading-relaxed">
                    {book?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {book?.subtitles?.map((bookName: any, index: number) => (
                    <div
                      key={index}
                      className="text-blue-500 text-lg font-bold"
                    >
                      {bookName?.subtitle}
                      {bookName?.books?.map((book: any, index: number) => (
                        <div key={index} className="text-black font-normal">
                          {index + 1}.{book?.name}
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="justify-end gap-3 text-xl text-gray-800">
                  <Icon
                    onClick={() => {
                      setCurrBook(book);
                      setEditEnabled(true);
                      setModelOpen(true);
                    }}
                    icon={"fluent:edit-32-filled"}
                    className="cursor-pointer"
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Icon
                        onClick={() => {}}
                        icon={"material-symbols:delete-outline"}
                        className="cursor-pointer"
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
                              <span className="font-extrabold">
                                {book?.title}
                              </span>{" "}
                              will be permanently deleted. This action cannot be
                              undone.
                            </p>
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(book?.id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        {newbooks?.data?.parsedBooks?.length > 0 && (
          <div className="flex justify-between">
            <Pagination className="mt-6 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
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
                    <PaginationLink onClick={() => handlePageChange(1)}>
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
                          isActive={pageNumber === pagination.page}
                          onClick={() => handlePageChange(pageNumber)}
                        >
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
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
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
      </main>
      <Dialog open={modelOpen} onOpenChange={setModelOpen}>
        <DialogContent className="font-ct min-w-[calc(100vw-40%)] flex flex-col h-[calc(100vh-8rem)] focus-visible:ring-transparent">
          <DialogHeader>
            <DialogTitle className="text-button text-2xl font-bold">
              Add Books
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto items-center px-5 space-y-3"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Textarea
                        className="focus-visible:ring-transparent"
                        placeholder="Enter title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {subtitleFields.map((subtitleField, index) => (
                <div key={subtitleField.id} className="border p-4 rounded">
                  <FormField
                    control={form.control}
                    name={`subtitles.${index}.subtitle`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            className="focus-visible:ring-transparent"
                            placeholder="Enter subtitle"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form
                    .getValues(`subtitles.${index}.books`)
                    //@ts-ignore
                    .map((book, bookIndex) => (
                      <div key={bookIndex} className="flex items-end">
                        <div className="w-full">
                          <FormField
                            control={form.control}
                            name={`subtitles.${index}.books.${bookIndex}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel>Book {bookIndex + 1}</FormLabel>
                                <FormControl>
                                  <Input
                                    className="focus-visible:ring-transparent"
                                    placeholder="Enter book name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          {form.getValues(`subtitles.${index}.books`).length >
                            1 && (
                            <Button
                              type="button"
                              onClick={() => handleRemoveBook(index, bookIndex)}
                              className="ml-2 bg-red-500 text-white"
                            >
                              Remove Book
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  <Button
                    type="button"
                    onClick={() => handleAddBook(index)}
                    className="mt-2"
                  >
                    Add Book
                  </Button>
                  <Button
                    type="button"
                    onClick={() => removeSubtitle(index)}
                    className="mt-2 ml-2 bg-red-500 text-white"
                  >
                    Remove Subtitle
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() =>
                  appendSubtitle({ subtitle: "", books: [{ name: "" }] })
                }
                className="mt-4"
              >
                Add Subtitle
              </Button>
            </form>
          </Form>

          <div className="flex justify-end p-4 border-t border-gray-200 mt-4">
            <Button
              type="button"
              onClick={() => {
                form.reset();
                setEditEnabled(false);
                setModelOpen(false);
              }}
              variant="secondary"
              className="mr-2 rounded-lg px-10"
            >
              Cancel
            </Button>
            <Button
              className="mr-2 rounded-lg hover:bg-button_hover px-10"
              type="submit"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {editEnabled ? "Update Book" : "Add Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewBooks;
