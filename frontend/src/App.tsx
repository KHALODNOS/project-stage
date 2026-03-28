import { Routes, Route } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import Rightbarlayout from "./components/Rightbar";
import Home from "./pages/Home";
import Novel from "./pages/Novel";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Error from "./pages/Error";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import { ToastManager } from "./components/message/ToastManager";
import AddNovel from "./pages/AddNovel";
import AddChapter from "./pages/Addchapter";
import ChapterContent from "./pages/ChapterContent";
import EditNovel from "./pages/EditNovel";
import Message from "./pages/Message";
import ChatBot from "./pages/ChatBot";
import TikTokPage from "./pages/TikTokPage";
import Novels from "./pages/Novels";
import AboutUs from "./pages/AboutUs";

function App() {
  return (
    <ToastManager>
      <div className="global font-Cairo m-0 p-0 box-border leading-[1.15] flex  flex-col min-h-[100svh] ">
        <NavBar />
        <section className="mt-24 flex-grow">
          <Routes>
            <Route path="/" element={<Rightbarlayout />}>
              <Route path="/chatbot" element={<ChatBot />} />
              <Route path="/messages" element={<Message />}></Route>
              <Route index element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/Register" element={<Register />} />
              <Route path="/addnovel" element={<AddNovel />} />
              <Route path="/updatenovel/:novelId" element={<EditNovel />} />
              <Route
                path="/novel/:novelId/addchapter"
                element={<AddChapter />}
              />
            </Route>
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/novel/:novelId" element={<Novel />} />
            <Route path="/novel/:novelId/:chapterId"
              element={<ChapterContent />}
            />
            <Route path="/novels" element={<Novels />} />
            <Route path="/tiktok" element={<TikTokPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/*" element={<Error />} />
          </Routes>

        </section>
        <Routes>
          <Route path="/messages" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </ToastManager>
  );
}

export default App;
