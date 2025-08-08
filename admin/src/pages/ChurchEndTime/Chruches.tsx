import CirculaProgress from "@/components/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { _axios } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "sonner";

const Chruches = () => {
  const { mutate: handleDelete } = useMutation({
    mutationFn: (id) => {
      return _axios.delete(`/api/church/deletechurch?churchid=${id}`);
    },
    onSuccess(data: any) {
      if (data?.data?.status === 200) {
        toast.success("Church deleted successfully");
        refetch();
      }
    },
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const {
    data: churches,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["churches", pagination.page, pagination.limit],
    queryFn: () =>
      _axios.get(
        `/api/church/allchurches?page=${pagination.page}&limit=${pagination.limit}`
      ),
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

  if (isLoading) return <CirculaProgress />;
  if (isError)
    return (
      <div className='flex h-[75vh] items-center justify-center'>
        <p className='text-red-500 text-xl'>Some thing went wrong</p>
      </div>
    );

  return (
    <>
      <main className='px-10 h-full py-10'>
        <div className='flex flex-col mb-3 gap-2 items-start'>
          <h1 className='text-lg font-semibold md:text-2xl'>Churches</h1>
        </div>
        <Table className='border'>
          <TableHeader>
            <TableRow className='uppercase'>
              <TableHead className=''>pastorname</TableHead>
              <TableHead>churchname</TableHead>
              <TableHead>mobile</TableHead>
              <TableHead className=''>district</TableHead>
              <TableHead className=''>address</TableHead>
              <TableHead className=''>city</TableHead>
              <TableHead className=''>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {churches?.data?.allChurches.map((church: any) => (
              <TableRow key={church?.id}>
                <TableCell className=''>{church?.pastorname}</TableCell>
                <TableCell className=''>{church?.churchname}</TableCell>
                <TableCell className=''>{church?.mobile}</TableCell>
                <TableCell className=''>{church?.district}</TableCell>
                <TableCell className=''>{church?.address}</TableCell>
                <TableCell className=''>{church?.city}</TableCell>
                <TableCell className=''>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Icon
                        className='h-7 w-7 cursor-pointer text-red-500'
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        icon='ic:baseline-delete'
                      />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {` will be permanently deleted. This action cannot be undone.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(church?.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {churches?.data?.allChurches?.length > 0 && (
          <div className='flex justify-between'>
            {/* <Pagination className='mt-6 justify-end'>
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
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href='#'
                      isActive={i + 1 === pagination.page}
                      onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
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
            </Pagination> */}
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
      </main>
    </>
  );
};

export default Chruches;
