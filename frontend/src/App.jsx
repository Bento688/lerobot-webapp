import NavBar from "./components/NavBar";
import LiveFeed from "./components/LiveFeed";
import LiveChat from "./components/LiveChat";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center bg-zinc-700">
      <NavBar />
      <div className="w-full max-w-7xl bg-zinc-700 flex flex-1 flex-col md:flex-row justify-center items-center px-6">
        <div className="w-full flex flex-col md:flex-row gap-10">
          <LiveFeed />
          <LiveChat />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
