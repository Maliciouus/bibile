import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import SubRootLayout from "./layouts/SubRootLayout";
import Dashboard from "./pages/Dashboard";
import BibleLayout from "./pages/bible/biblelayout";
import CodLayout from "./pages/cod/codlayout";
import Messages from "./pages/messages/message";
import Loginpage from "./pages/Loginpage";
import Chruches from "./pages/ChurchEndTime/Chruches";
import MessageAudio from "./pages/messages/audiofile";
import GalleryLayout from "./pages/Gallery/GalleryLayout";
import DailyManna from "./pages/Manna/DailyManna";
import Songbook from "./pages/Songsbook/Songbook";
import SongsAudio from "./pages/Songsbook/songaudio";
import BibleAudioLayout from "./pages/bibleaudios/bibleaudio-layout";
import NewBooks from "./pages/newbooks/newbooks";
import PublishedBooks from "./pages/publishedbooks/publishedbook";
import EditPublishedBooks from "./pages/publishedbooks/editpublishbook";
import TamilSpecialBooks from "./pages/specialbooks/tamilspecialbooks/TamilSpecialBooks";
import EditTamilSpecialBooks from "./pages/specialbooks/tamilspecialbooks/EditTamilSpecialBooks";
import EnglishSpecialBooks from "./pages/specialbooks/englishspecialbooks/englishSpeacialBooks";
import EditEnglishSpecialBooks from "./pages/specialbooks/englishspecialbooks/EditEnglishSpecialBooks";
import TamilMessageSermon from "./pages/message-sermons/tamil-sermon";
import CreateEnglishSermons from "./pages/message-sermons/englishTitles";
import EnglishMessageSermon from "./pages/message-sermons/english-sermon";
import BibleEditLayout from "./pages/bibleEdit/bibleedit-layout";
import SongQuil from "./pages/Songsbook/songquil";
import MessageQuil from "./pages/messages/messagequil";

function LayoutRouter() {
  let { type } = useParams();

  let layoutComponent = null;
  switch (type) {
    case "bible":
      layoutComponent = <BibleLayout />;
      break;
    case "_bible-audio":
      layoutComponent = <BibleAudioLayout />;
      break;
    case "_bible-edit":
      layoutComponent = <BibleEditLayout />;
      break;
    case "cod":
      layoutComponent = <CodLayout />;
      break;
    case "messages":
      layoutComponent = <Messages />;
      break;
    case "message-audio":
      layoutComponent = <MessageAudio />;
      break;
    case "songbooks":
      layoutComponent = <Songbook />;
      break;
    case "songbook-audio":
      layoutComponent = <SongsAudio />;
      break;
    case "churches":
      layoutComponent = <Chruches />;
      break;
    case "gallery":
      layoutComponent = <GalleryLayout />;
      break;
    case "dailymanna":
      layoutComponent = <DailyManna />;
      break;
    case "newbooks":
      layoutComponent = <NewBooks />;
      break;
    case "publishedbooks":
      layoutComponent = <PublishedBooks />;
      break;
    case "editpublishedbooks":
      layoutComponent = <EditPublishedBooks />;
      break;
    case "tamilspecialbooks":
      layoutComponent = <TamilSpecialBooks />;
      break;
    case "edittamilspecialbooks":
      layoutComponent = <EditTamilSpecialBooks />;
      break;
    case "englishspecialbooks":
      layoutComponent = <EnglishSpecialBooks />;
      break;
    case "editenglishspecialbooks":
      layoutComponent = <EditEnglishSpecialBooks />;
      break;
    case "tamilmessagesermon":
      layoutComponent = <TamilMessageSermon />;
      break;
    case "create-english-sermon":
      layoutComponent = <CreateEnglishSermons />;
      break;
    case "upload-english-sermon":
      layoutComponent = <EnglishMessageSermon />;
      break;
    default:
  }
  return <SubRootLayout children={layoutComponent} />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Loginpage />} />
          <Route
            path='/dashboard'
            element={<SubRootLayout children={<Dashboard />} />}></Route>
          <Route path='/layout/:type' element={<LayoutRouter />} />
          <Route
            path='/songquil'
            element={<SubRootLayout children={<SongQuil />} />}></Route>
          <Route
            path='/messagequil'
            element={<SubRootLayout children={<MessageQuil />} />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
