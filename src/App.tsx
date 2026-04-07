import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import { Channel } from './types';
import { Menu, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firestore Connection
  useEffect(() => {
    const q = query(collection(db, 'channels'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Channel[];
      
      setChannels(channelData);
      
      // Auto-play first channel on startup
      if (channelData.length > 0 && !selectedChannel) {
        setSelectedChannel(channelData[0]);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedChannel]);

  // Orientation and Immersive Mode
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Lock to landscape if supported
        const orientation = screen.orientation as any;
        if (orientation && orientation.lock) {
          await orientation.lock('landscape');
        }
      } catch (err) {
        console.warn("Orientation lock not supported:", err);
      }
    };

    const enableImmersive = async () => {
      try {
        // Request fullscreen for immersive mode
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Immersive mode (fullscreen) failed:", err);
      }
    };

    // Trigger on user interaction or startup
    const handleInteraction = () => {
      lockOrientation();
      enableImmersive();
      window.removeEventListener('click', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('click', handleInteraction);
    };
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-bg-dark flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-gray-400 font-medium">Initializing Vision IPTV...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-bg-dark overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-bg-card border-b border-white/5 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center">
              <span className="text-[10px] font-bold">V</span>
            </div>
            <span className="font-bold">Vision</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-bg-dark rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-[70] transition-transform duration-300' : 'relative'}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        h-full
      `}>
        <Sidebar 
          channels={channels} 
          selectedChannelId={selectedChannel?.id}
          onSelectChannel={handleSelectChannel}
        />
      </div>

      {/* Main Content */}
      <main className={`flex-1 h-full flex flex-col ${isMobile ? 'pt-16' : ''}`}>
        <div className="flex-1 min-h-0">
          <VideoPlayer channel={selectedChannel} />
        </div>
      </main>
    </div>
  );
}
