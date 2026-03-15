import { Route, Routes } from "react-router-dom";
import SoftBackdrop from "./components/SoftBackdrop";
import LenisScroll from "./components/lenis";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Generator from "./pages/Generator";
import Results from "./pages/Results";
import MyGenerations from "./pages/MyGenerations";
import Community from "./pages/Community";
import Loading from "./pages/Loading";

function App() {
  return (
    <>
      <SoftBackdrop />
      <LenisScroll />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generator />} />
        <Route path="/result/:projectId" element={<Results />} />
        <Route path="/my-generations" element={<MyGenerations />} />
        <Route path="/community" element={<Community />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>

      <Footer />
    </>
  );
}
export default App;
