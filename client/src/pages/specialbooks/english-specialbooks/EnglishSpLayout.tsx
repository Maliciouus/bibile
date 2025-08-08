import { useSearchParams } from "react-router-dom";
import Nopage from "@/pages/Nopage";
import EnglishSpPdf from "@/components/englishSPbooks/EnglishSpPdf";
import EnglishSpDocx from "@/components/englishSPbooks/EnglishSpDocx";

const EnglishSpLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const BookId = searchParams.get("BookId");
  return (
    <>
      {type === "pdf" && BookId ? (
        <EnglishSpPdf />
      ) : type === "docx" && BookId ? (
        <EnglishSpDocx />
      ) : (
        <Nopage />
      )}
    </>
  );
};

export default EnglishSpLayout;
