// import Navbar from "@/components/Navbar/Navbar";
// import { Button } from "@/components/ui/button";
// import { _axios } from "@/lib/axios";
// import { useQuery } from "@tanstack/react-query";
// import { ChevronLeft, Download } from "lucide-react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const TamilSpPdf = () => {
//   const [searchParams, _] = useSearchParams();
//   let bookId: any = searchParams.get("BookId");
//   const navigate = useNavigate();

//   const {
//     data: books,
//     isLoading: isLoadingBooks,
//     refetch: refetchBooks,
//   } = useQuery({
//     queryKey: ["tamil-specialbookss", bookId],
//     queryFn: () => {
//       return _axios.get(`/api/tamil-specialbook/getall?id=${bookId}`);
//     },
//   });

//   console.log(books?.data?.data?.[0]);

//   const pdfUrl =
//     "https://lastvoicemessage-bible.s3.ap-south-1.amazonaws.com/uploads/tamilSpecialBook/2024-10-01/document.pdf.wgynl67g1oj66gguz75d";

//   const googleDocsViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(
//     pdfUrl
//   )}&embedded=true`;

//   const handleDownload = () => {
//     window.open(pdfUrl, "_blank");
//   };
//   return (
//     <main>
//       <div className='w-full h-screen flex flex-col'>
//         <div className='bg-[#0B0C0D] p-2 flex justify-between items-center'>
//           <div
//             onClick={() => navigate(-1)}
//             className='flex items-center text-[#EBB34A] cursor-pointer  gap-2'>
//             <div>
//               <ChevronLeft
//                 size={35}
//                 className=' text-[#E7B051] cursor-pointer'
//               />
//             </div>
//             <div className=' hidden md:block'>back</div>
//           </div>
//           <div className='text-[#EBB34A] text-center   text-xl'>
//             "documentsss documentsss documentsss documentsss"
//           </div>
//           <p className=' py-4 text-center  font-nirmala'></p>
//         </div>

//         <iframe
//           src={googleDocsViewer}
//           className='w-full bg-[#0B0C0D]  flex-grow'
//           title='PDF Viewer'
//         />
//       </div>
//       <button
//         onClick={handleDownload}
//         className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 fixed bottom-10 right-10  md:px-4 rounded flex items-center'>
//         <Download className='mr-2' size={20} />
//         PDF
//       </button>
//     </main>
//   );
// };

// export default TamilSpPdf;

import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Download, LoaderCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const EnglishSpPdf = () => {
  const [searchParams, _] = useSearchParams();
  let bookId: any = searchParams.get("BookId");
  const navigate = useNavigate();
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  const {
    data: books,
    isLoading: isLoadingBooks,
    // refetch: refetchBooks,
  } = useQuery({
    queryKey: ["english-specialbookss", bookId],
    queryFn: () => {
      return _axios.get(`/api/english-specialbook/getall?id=${bookId}`);
    },
  });

  const bookData = books?.data?.data?.[0];
  const pdfUrl = bookData?.pdfurl;

  const googleDocsViewer = pdfUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(
        pdfUrl
      )}&embedded=true`
    : null;

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <main>
      <div className='w-full h-screen flex flex-col'>
        <div className='bg-[#0B0C0D] p-2 flex justify-between items-center'>
          <div
            onClick={() => navigate(-1)}
            className='flex items-center text-[#EBB34A] cursor-pointer  gap-2'>
            <div>
              <ChevronLeft
                size={35}
                className=' text-[#E7B051] cursor-pointer'
              />
            </div>
            <div className=' hidden md:block'>back</div>
          </div>
          <div className='text-[#EBB34A] text-center text-wrap text-xl'>
            {bookData?.title || "Loading..."}
          </div>
          <p className=' py-4 text-center  font-nirmala'></p>
        </div>

        <div className='w-full bg-[#0B0C0D] flex-grow relative'>
          {isPdfLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
              <p>
                {" "}
                <LoaderCircle
                  className={`mr-2 h-4 w-4 text-white animate-spin`}
                />
              </p>
              <p className='text-white'> Loading PDF...</p>
            </div>
          )}

          {googleDocsViewer && (
            <iframe
              src={googleDocsViewer}
              className='w-full h-full'
              style={{ minHeight: "300px" }}
              title='PDF Viewer'
              onLoad={() => setIsPdfLoading(false)}
            />
          )}

          {!googleDocsViewer && !isLoadingBooks && (
            <div className='text-white text-center py-10'>
              <p>PDF not available.</p>
            </div>
          )}
        </div>
      </div>

      {pdfUrl && (
        <button
          onClick={handleDownload}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 fixed bottom-10 right-10 md:px-4 rounded flex items-center'>
          <Download className='mr-2' size={20} />
          Download PDF
        </button>
      )}
    </main>
  );
};

export default EnglishSpPdf;
