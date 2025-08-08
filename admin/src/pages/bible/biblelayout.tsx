import { useSearchParams } from "react-router-dom";
import Books from "./books";
import Chapters from "./chapters";

const BibleLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const bookname = searchParams.get("book");

  return (
    <>
      {type == "chapter" || !type ? (
        <Books />
      ) : type == "books" && bookname ? (
        <Chapters />
      ) : (
        <>Nah</>
      )}
    </>
  );
};

export default BibleLayout;
