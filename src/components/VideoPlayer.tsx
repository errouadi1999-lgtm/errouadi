import { motion, AnimatePresence } from 'motion/react';
import { Maximize, Volume2, Settings, Info, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Channel } from '../types';
import { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  channel?: Channel;
}

export default function VideoPlayer({ channel }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const playerRef = useRef<any>(null);

  if (!channel) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-bg-dark p-8 text-center">
        <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center mb-6">
          <Play className="w-10 h-10 text-gray-700" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Ready to watch?</h2>
        <p className="text-gray-500 max-w-md">Select a channel from the sidebar to start your streaming experience.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-dark overflow-hidden relative">
      {/* Player Area */}
      <div className="flex-1 relative group bg-black flex items-center justify-center overflow-hidden">
        {/* Real Video Player */}
        <div className="absolute inset-0">
          <ReactPlayer
            {...{
              ref: playerRef,
              url: channel.streamUrl,
              playing: isPlaying,
              volume: volume,
              width: "100%",
              height: "100%",
              style: { position: 'absolute', top: 0, left: 0 },
              config: {
                file: {
                  attributes: {
                    referrerPolicy: 'no-referrer',
                  },
                },
              },
              fallback: (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-dark">
                  <img 
                    src={`https://picsum.photos/seed/${channel.id}/1920/1080`} 
                    alt="Stream Preview" 
                    className="w-full h-full object-cover opacity-40 blur-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col items-center gap-4 z-10">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-white font-medium">Loading Stream...</p>
                  </div>
                </div>
              )
            } as any}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Channel Info Overlay (Top) */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
              {channel.logoUrl ? (
                <img src={channel.logoUrl} alt={channel.name} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{channel.name}</h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-brand-primary text-[10px] font-bold rounded uppercase tracking-wider">Live</span>
                <span className="text-sm text-gray-300 font-medium">Now Playing: Global Highlights</span>
              </div>
            </div>
          </div>
          <button className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors border border-white/10">
            <Info className="w-5 h-5 text-white" />
          </button>
        </motion.div>

        {/* Center Play Button (Visible on hover or pause) */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setIsPlaying(true)}
              className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center shadow-2xl shadow-brand-primary/40 z-20"
            >
              <Play className="w-10 h-10 text-white fill-current" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Controls Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {/* Progress Bar (Visual only for live streams) */}
          <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-full bg-brand-primary rounded-full" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <button className="text-white/80 hover:text-white transition-colors">
                  <SkipBack className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-white/80" />
                <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all" 
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-white/80 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const el = document.documentElement;
                  if (document.fullscreenElement) document.exitFullscreen();
                  else el.requestFullscreen();
                }}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Info Panel (Visible on Desktop) */}
      <div className="hidden lg:block bg-bg-card p-6 border-t border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-1">About this channel</h3>
            <p className="text-sm text-gray-400 max-w-2xl">
              {channel.description || "Experience the best in high-definition streaming with Vision IPTV. This channel features premium content curated for our global audience."}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-bg-dark rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-bold">Resolution</p>
              <p className="text-sm font-mono">4K Ultra HD</p>
            </div>
            <div className="text-center px-4 py-2 bg-bg-dark rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-bold">Bitrate</p>
              <p className="text-sm font-mono">12.5 Mbps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

