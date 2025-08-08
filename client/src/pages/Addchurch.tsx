import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CirclePlus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
const formSchema = z.object({
  pastorname: z.string().min(2, { message: "Pastorname is required" }).max(50),
  churchname: z.string().min(2, { message: "Churchname is required" }).max(50),
  mobile: z
    .string()
    .min(10, { message: "Mobile number must be 10 digits" })
    .max(10, { message: "Mobile number must be 10 digits" }),
  district: z.string().min(2, { message: "Churchname is required" }).max(30),
  city: z.string().min(2, { message: "City is required" }).max(30),
  address: z.string().min(2, { message: "Address is required" }),
});

const Addchurch = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pastorname: "",
      churchname: "",
      mobile: "",
      district: "",
      city: "",
      address: "",
    },
  });
  const [search, setSearch] = useState<any>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      //@ts-ignore
      values.mobile = parseInt(values.mobile);
      const response = await _axios.post("/api/church/create", values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.status === 200) {
        toast.success("Church added successfully");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
    form.reset();
    refetch();
  }

  const {
    data: mobChurchData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<any>({
    queryKey: ["mobChuchData", search],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await _axios.get(
        `/api/church/allchurches?page=${pageParam}&limit=10&search=${search}`
      );
      return response?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any) => {
      const nextPage = allPages?.length + 1;
      return lastPage?.allChurches?.length === 10 ? nextPage : undefined;
    },
  });

  const {
    data: churches,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["addchurches", pagination.page, pagination.limit, search],
    queryFn: () => {
      return _axios.get(
        `/api/church/allchurches?page=${pagination.page}&limit=${pagination.limit}&search=${search}`
      );
    },
  });

  useEffect(() => {
    if (churches) {
      setPagination((prev) => ({
        ...prev,
        total: churches?.data?.totalCount?.count,
      }));
    }
  }, [churches]);

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

  if (isError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  return (
    <main>
      <Navbar />
      <div className='min-h-[91vh] overflow-y-auto pb-6  bg-[#0B0C0D]'>
        <div className='container mx-auto'>
          <div className='text-center px-3 font-readux text-xl py-4 font-bold text-[#EBB34A] '>
            <h1>END TIME CHUCRH ADDRESS</h1>
          </div>
          <div className='text-center px-3 text-[#FFFFFF]/70 font-tamil003 text-3xl pt-4'>
            <h1>
              <span className='text-[#EBB34A]'>ஊழியக்காரர்கள்</span> தங்கள் சபை
              விலாசத்தை பதிவிட விரும்பினால் இங்கே பதிவிடலாம்
            </h1>
          </div>
          <div className='flex md:justify-between flex-wrap justify-center items-center px-5 py-5'>
            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    onClick={() => form.reset()}
                    className='border-2 font-readux font-bold border-dashed border-[#EBB34A] px-4 py-3 sm:px-5 sm:py-5 flex items-center gap-2 sm:gap-3 text-[#EBB34A] text-sm sm:text-base'>
                    <CirclePlus size={20} />
                    ADD CHURCHES
                  </button>
                </DialogTrigger>
                <DialogContent
                  className='font-readux border-0 focus-visible:ring-transparent
                                  w-full max-w-[95vw] h-[500px] md:h-auto  overflow-scroll scrollbar-hide  md:max-w-[500px] p-6'>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className='space-y-3 sm:space-y-4'>
                      {[
                        "pastorname",
                        "churchname",
                        "mobile",
                        "district",
                        "city",
                        "address",
                      ].map((field: any) => (
                        <FormField
                          key={field}
                          control={form.control}
                          name={field}
                          render={({ field: fieldProps }) => (
                            <FormItem>
                              <FormLabel className='text-sm sm:text-base'>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder=''
                                  {...fieldProps}
                                  type={field === "mobile" ? "tel" : "text"}
                                  className='text-sm sm:text-base p-2 sm:p-3'
                                />
                              </FormControl>
                              <FormMessage className='text-xs sm:text-sm' />
                            </FormItem>
                          )}
                        />
                      ))}
                      <div className='pt-3 sm:pt-4'>
                        <Button
                          className='w-full text-sm sm:text-base py-2 sm:py-3'
                          type='submit'>
                          Submit
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <div className='px-4 pt-4 md:p-0'>
                <div className='flex items-center border border-[#EBB34A] rounded-full px-5 p-2'>
                  <Search className='text-[#EBB34A]' />
                  <input
                    onChange={(e) => setSearch(e.target.value)}
                    type='text'
                    value={search}
                    placeholder='Search...'
                    className='border-none  bg-transparent font-readux placeholder:text-[#EBB34A] text-[#EBB34A] w-full focus:outline-none ml-2'
                  />
                </div>
              </div>
            </div>
          </div>
          {/*web view  tables */}
          <div className='w-full hidden md:block'>
            <div className=' rounded-md border border-[#EBB34A]'>
              <Table className='w-full rounded-lg'>
                <TableHeader className='w-full'>
                  <TableRow className='hover:bg-[#0B0C0D]  '>
                    <TableHead className='text-[#EBB34A]   font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      S.No
                    </TableHead>
                    <TableHead className='text-[#EBB34A] text-nowrap font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      Church Name
                    </TableHead>
                    <TableHead className='text-[#EBB34A] text-nowrap  font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      Pastor Name
                    </TableHead>
                    <TableHead className='text-[#EBB34A] font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      Phone no
                    </TableHead>
                    <TableHead className='text-[#EBB34A] font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      Address
                    </TableHead>
                    <TableHead className='text-[#EBB34A] font-readux md:text-xl text-base py-5 border-[#EBB34A] border'>
                      District
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {churches?.data?.allChurches?.map(
                    (church: any, i: number) => (
                      <TableRow className='hover:bg-[#0B0C0D]' key={church.id}>
                        <TableCell className='text-[#F9F9F9] font-readux md:text-lg text-base py-5 border-[#EBB34A] border'>
                          {i + (pagination.page - 1) * pagination.limit + 1}
                        </TableCell>
                        <TableCell className='text-[#F9F9F9] font-readux md:text-lg text-base py-5 border-[#EBB34A] border'>
                          {church?.churchname}
                        </TableCell>
                        <TableCell className='text-[#F9F9F9] font-readux md:text-lg text-base py-5 border-[#EBB34A] border'>
                          {church?.pastorname}
                        </TableCell>
                        <TableCell className='text-[#F9F9F9] text-nowrap font-readux md:text-lg text-base py-5 border-[#EBB34A] border'>
                          {church?.mobile}
                        </TableCell>
                        <TableCell className='text-[#F9F9F9] font-readux md:text-lg text-base py-5 border-[#EBB34A] border'>
                          {church?.address}
                        </TableCell>
                        <TableCell className='text-[#F9F9F9] font-readux md:text-lg text-base py-5 border-[#EBB34A] border'>
                          {church?.district}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            {churches?.data?.allChurches?.length > 0 && (
              <div className='flex justify-between'>
                <Pagination className='my-5 justify-end'>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (pagination.page === 1) return;
                          handlePageChange(pagination.page - 1);
                        }}
                        className={`text-[#FFFFFF]  ${
                          pagination.page === 1
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer opacity-100"
                        }`}
                      />
                    </PaginationItem>
                    {pagination.page > 3 && (
                      <PaginationItem className='bg-white'>
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
                              className='bg-white'
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
                          onClick={() => handlePageChange(totalPages)}>
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
                        className={` text-white ${
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
          {/*mob view  tables */}
          <div className='block md:hidden px-4 font-readux'>
            {mobChurchData?.pages?.map((page: any, pageIndex: any) => (
              <div key={pageIndex}>
                {page?.allChurches?.map((church: any, idx: number) => (
                  <div
                    key={church.id || idx}
                    className='border border-[#EBB34A] rounded-md p-4 mb-4 bg-[#0B0C0D]'>
                    <div className='flex items-center gap-x-2'>
                      <p className='text-base text-[#EBB34A]'>S.No:</p>
                      <p className='text-[#F9F9F9] text-base'>
                        {idx + 1 + pageIndex * 10}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        Church Name:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {church?.churchname}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        Pastor Name:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {church?.pastorname}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        Phone No:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {church?.mobile}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        Address:
                      </p>
                      <p className='text-[#F9F9F9] font-readux break-words overflow-hidden whitespace-normal'>
                        {church?.address}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        District:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {church?.district}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className='flex justify-center my-4'>
              <Button
                className='bg-[#EBB34A] hover:bg-[#EBB34A]/90 text-[#0B0C0D]'
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}>
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                  ? "Load More"
                  : "Load More"}
              </Button>
            </div>
          </div>

          {/* <div className='block md:hidden px-4  font-readux'>
            {mobChurchData?.pages?.map((page: any, pageIndex: any) => (
              <div key={pageIndex}>
                {page?.allChurches?.map((church: any, idx: number) => (
                  <div
                    key={church.id || idx}
                    className='border border-[#EBB34A] rounded-md p-4 mb-4 bg-[#0B0C0D]'>
                    <div className='flex items-center gap-x-2'>
                      <p className='text-base text-[#EBB34A]'>S.No : </p>
                      <p className='text-[#F9F9F9] text-base'>
                        {" "}
                        {idx + 1 + pageIndex * page?.allChurches?.length}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        Church Name:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {church?.churchname}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        Pastor Name:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {church?.pastorname}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        Phone No:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {" "}
                        {church?.mobile}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A]   font-readux text-lg'>
                        Address:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {" "}
                        {church?.address}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-[#EBB34A] font-readux text-lg'>
                        District:
                      </p>
                      <p className='text-[#F9F9F9] font-readux'>
                        {" "}
                        {church?.district}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className='flex justify-center my-4'>
              <Button
                className='bg-[#EBB34A] hover:bg-[#EBB34A]/90  text-[#0B0C0D]'
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}>
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                  ? "Load More"
                  : "Load More"}
              </Button>
            </div>
          </div> */}
        </div>
      </div>
    </main>
  );
};

export default Addchurch;
