import { useSearchParams } from "react-router-dom";
import ImageTitle from "./imagetitle";
import Gallery from "./gallery";

const GalleryLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const titleId = searchParams.get("titleId");
  return (
    <>
      {!type ? (
        <ImageTitle />
      ) : type == "uploadimage" && titleId ? (
        <Gallery />
      ) : (
        <>
          <>No Data</>
        </>
      )}
    </>
  );
};

export default GalleryLayout;
