import { useSearchParams } from "react-router-dom";
import PublishBooksList from "./PublishBooksList";
import PubilshBookView from "./PubilshBookView";
import Nopage from "../Nopage";

const PublishBooksLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const BookId = searchParams.get("BookId");

  return (
    <>
      {!type ? (
        <PublishBooksList />
      ) : type == "viewbook" && BookId ? (
        <PubilshBookView />
      ) : (
        <Nopage />
      )}
    </>
  );
};

export default PublishBooksLayout;
