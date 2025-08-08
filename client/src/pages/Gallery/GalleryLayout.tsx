import { useSearchParams } from "react-router-dom";
import GalleryTitles from "./GalleryTitles";
import NewGallery from "./newgallery";

const GalleryLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const imageId = searchParams.get("imageId");

  return (
    <>
      {!type ? (
        <GalleryTitles />
      ) : type == "images" && imageId ? (
        <NewGallery />
      ) : (
        <>
          <>No Data</>
        </>
      )}
    </>
  );
};

export default GalleryLayout;
