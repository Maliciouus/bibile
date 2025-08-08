import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import SubRootLayout from "./layouts/SubRootLayout";
import About from "./pages/Aboutus/About";
import Addchurch from "./pages/Addchurch";
import RootBible from "./pages/Bible";
import RootBMpage from "./pages/Bmpage";
import Codanswer from "./pages/Cod/Codanswer";
import Codpage from "./pages/Cod/Codpage";
import Codquestions from "./pages/Cod/Codquestions";
import Homepage from "./pages/Home/Homepage";
import RootMessage from "./pages/Message";
import Nopage from "./pages/Nopage";
import RootSearch from "./pages/Search";
import Specialbooks from "./pages/specialbooks/Specialbooks";
import Codsubquestion from "./pages/Cod/Codsubquestion";
import GalleryLayout from "./pages/Gallery/GalleryLayout";
import RootSongBooks from "./pages/Songbooks";
import Newbooks from "./pages/newbooks/Newbooks";
import PublishBooksLayout from "./pages/publishedbooks/PublishLayout";
import TamilSpLayout from "./pages/specialbooks/tamil-specialbooks/TamilSpLayout";
import NewGallery from "./pages/Gallery/newgallery";
import EnglishSpLayout from "./pages/specialbooks/english-specialbooks/EnglishSpLayout";
import TamilSermons from "./pages/Message-sermons/TamilSermons";
import EnglishSermon from "./pages/Message-sermons/EnglishSermon";
import PrivacyPolicy from "./components/PrivacyPolicy";

function LayoutRouter() {
  let { type } = useParams();

  let layoutComponent = null;

  switch (type) {
    case "bible":
      layoutComponent = <RootBible />;
      break;
    case "message":
      layoutComponent = <RootMessage />;
      break;
    case "bmpage":
      layoutComponent = <RootBMpage />;
      break;
    case "search":
      layoutComponent = <RootSearch />;
      break;
    case "songbooks":
      layoutComponent = <RootSongBooks />;
      break;
    default:
      layoutComponent = <Nopage />;
  }

  return <SubRootLayout children={layoutComponent} />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/aboutus' element={<About />} />
          <Route path='/gallery' element={<GalleryLayout />} />
          <Route path='/newgallery' element={<NewGallery />} />
          <Route path='/publishedbooks' element={<PublishBooksLayout />} />
          <Route path='/addchurch' element={<Addchurch />} />
          <Route path='/specialbooks' element={<Specialbooks />} />
          <Route
            path='/specialbooks-tamil-layout'
            element={<TamilSpLayout />}
          />
          <Route
            path='/specialbooks-english-layout'
            element={<EnglishSpLayout />}
          />
          <Route path='/newbooks' element={<Newbooks />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/tamildownload-table' element={<TamilSermons />} />
          <Route path='/englishdownload-table' element={<EnglishSermon />} />
          <Route path='/codpage' element={<Codpage />} />
          <Route path='/codpage/:id' element={<Codquestions />} />
          <Route path='/codpage/answer' element={<Codanswer />} />
          <Route path='/codpage/:subTopicId/:id' element={<Codsubquestion />} />
          <Route path='/layout/:type' element={<LayoutRouter />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
