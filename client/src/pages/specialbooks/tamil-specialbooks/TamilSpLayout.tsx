import { useSearchParams } from "react-router-dom";
import TamilSpPdf from "../../../components/tamilSPbooks/TamilSpPdf";
import TamilSpDocx from "../../../components/tamilSPbooks/TamilSpDocx";
import Nopage from "@/pages/Nopage";

const TamilSpLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const BookId = searchParams.get("BookId");
  return (
    <>
      {type === "pdf" && BookId ? (
        <TamilSpPdf />
      ) : type === "docx" && BookId ? (
        <TamilSpDocx />
      ) : (
        <Nopage />
      )}
    </>
  );
};

export default TamilSpLayout;
