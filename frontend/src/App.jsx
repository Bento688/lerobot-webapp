import NavBar from "./components/NavBar";
import LiveFeed from "./components/LiveFeed";
import LiveChat from "./components/LiveChat";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center bg-gray-700">
      <NavBar />
      <div className="w-full max-w-7xl bg-gray-700 flex flex-1 flex-col md:flex-row justify-center gap-10 items-center px-6">
        <LiveFeed />
        <LiveChat />
      </div>
      <Footer />
    </div>
  );
};

export default App;
