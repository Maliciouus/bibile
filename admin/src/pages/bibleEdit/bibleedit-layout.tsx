import { useSearchParams } from "react-router-dom";
import BibleEditBooks from "./bibleEdit-books";
import BibleEditVerse from "./bibleEdit-verse";

const BibleEditLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const bookName = searchParams.get("book");

  return (
    <>
      {!type ? (
        <BibleEditBooks />
      ) : type == "bibleedit" && bookName ? (
        <BibleEditVerse />
      ) : (
        <>Nah</>
      )}
    </>
  );
};

export default BibleEditLayout;
