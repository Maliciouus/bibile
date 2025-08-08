import { useSearchParams } from "react-router-dom";
import BibleAudioBooks from "./bible-audio-books";
import BibleUploadAudio from "./bibleaudio-upload";

const BibleAudioLayout = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const bookName = searchParams.get("book");

  return (
    <>
      {!type ? (
        <BibleAudioBooks />
      ) : type == "bibleaudios" && bookName ? (
        <BibleUploadAudio />
      ) : (
        <>Nah</>
      )}
    </>
  );
};

export default BibleAudioLayout;
