import Sidebar from "@/components/Sidebar";
import BibleSideBar from "@/components/sidebars/bibilesidebar";
import BMSideBar from "@/components/sidebars/bmsidebar";
import MessageSideBar from "@/components/sidebars/messagesidebar";
import SongBookSideBar from "@/components/sidebars/songbooksidebar";
import { useParams } from "react-router-dom";

export default function SubRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const getType: any = useParams();
  return (
    <>
      <div className='flex h-screen'>
        <div
          className='hidden md:block'
          style={{ flex: 1, backgroundColor: "#1B1B1B" }}>
          {getType?.type === "bible" && (
            <BibleSideBar onBibleSelect={() => {}} />
          )}
          {getType?.type === "message" && (
            <MessageSideBar onMessageSelect={() => {}} />
          )}
          {getType?.type === "songbooks" && (
            <SongBookSideBar onSongBookSelect={() => {}} />
          )}
          {getType?.type === "bmpage" && <BMSideBar />}
          {getType?.type === "search" && <Sidebar />}
        </div>
        <div style={{ flex: 4 }} className='flex-grow '>
          {children}
        </div>
      </div>
    </>
  );
}
