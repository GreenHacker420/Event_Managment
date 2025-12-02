import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SoulLoader } from "./components/ui/SoulLoader";
import { SketchDock } from "./components/layout/SketchDock";
import { CanvasDashboard } from "./components/views/CanvasDashboard";
import { CreateEventView } from "./components/views/CreateEventView";
import { TaskView } from "./components/views/TaskView";
import { GroupChatView } from "./components/views/GroupChatView";
import { ChannelList } from "./components/views/channels/ChannelList";
import { ChannelView } from "./components/views/channels/ChannelView";
import { LoginSignupView } from "./components/views/LoginSignupView";
import { UserMenu } from "./components/ui/UserMenu";
import { useAppStore } from "./store/useAppStore";
import "./App.css";

function App() {
  const { isAuthenticated, login } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/session', { credentials: 'include' });
        const session = await res.json();
        if (session?.user?.name || session?.user?.email) {
          login(session.user.name || session.user.email);
        }
      } catch (e) {
        console.log('No session');
      }
      setTimeout(() => setIsLoading(false), 1500);
    };
    checkSession();
  }, [login]);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] overflow-hidden selection:bg-[var(--color-highlight)]">

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SoulLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && !isAuthenticated && <LoginSignupView />}

      {!isLoading && isAuthenticated && (
        <>
          <div className="fixed top-4 right-4 z-50">
            <UserMenu />
          </div>
          <main className="relative w-full h-screen overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <PageWrapper>
                    <CanvasDashboard />
                  </PageWrapper>
                } />
                <Route path="/create" element={
                  <PageWrapper>
                    <CreateEventView />
                  </PageWrapper>
                } />
                <Route path="/tasks" element={
                  <PageWrapper>
                    <TaskView />
                  </PageWrapper>
                } />
                <Route path="/messages" element={
                  <PageWrapper>
                    <GroupChatView />
                  </PageWrapper>
                } />
                <Route path="/channels" element={
                  <PageWrapper>
                    <div className="flex h-screen pt-12 pb-12 max-w-7xl mx-auto">
                      <div className="w-80 h-full">
                        <ChannelList />
                      </div>
                      <div className="flex-1 h-full">
                        <ChannelView />
                      </div>
                    </div>
                  </PageWrapper>
                } />

                {/* Fallback for under construction pages */}
                <Route path="*" element={
                  <PageWrapper>
                    <UnderConstruction />
                  </PageWrapper>
                } />
              </Routes>
            </AnimatePresence>
          </main>

          <SketchDock />
        </>
      )}
    </div>
  );
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, filter: "blur(4px)" }}
    animate={{ opacity: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, filter: "blur(4px)" }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    className="w-full min-h-full"
  >
    {children}
  </motion.div>
);

const UnderConstruction = () => (
  <div className="flex flex-col items-center justify-center h-[80vh] text-center">
    <motion.h2
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="text-6xl font-serif font-bold mb-6 text-[#1a1a1a]"
    >
      Under Construction
    </motion.h2>
    <p className="font-hand text-2xl text-[#1a1a1a]/60 max-w-md">
      I haven't drawn this part yet. <br />
      Need more coffee.
    </p>
  </div>
);

export default App;
