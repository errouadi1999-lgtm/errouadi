import { motion } from 'motion/react';
import { Play, Tv, Search } from 'lucide-react';
import { Channel, Category } from '../types';
import { useState, useEffect, useRef } from 'react';

interface SidebarProps {
  channels: Channel[];
  selectedChannelId?: string;
  onSelectChannel: (channel: Channel) => void;
}

const CATEGORIES: Category[] = ['All', 'Sports', 'Movies', 'News', 'Entertainment'];

export default function Sidebar({ channels, selectedChannelId, onSelectChannel }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle D-Pad Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setFocusedIndex(prev => Math.min(prev + 1, filteredChannels.length - 1));
      } else if (e.key === 'ArrowUp') {
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        const channel = filteredChannels[focusedIndex];
        if (channel) onSelectChannel(channel);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredChannels, focusedIndex, onSelectChannel]);

  // Auto-scroll focused item into view
  useEffect(() => {
    const focusedElement = document.getElementById(`channel-${focusedIndex}`);
    if (focusedElement) {
      focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedIndex]);

  return (
    <div className="h-full flex flex-col bg-bg-card border-r border-white/5 w-full md:w-80 lg:w-96 overflow-hidden">
      {/* Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Vision<span className="text-brand-primary">IPTV</span></h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search channels..."
            className="w-full bg-bg-dark border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-focus transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-dark text-gray-400 hover:bg-bg-hover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Channel List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 pb-6 space-y-1"
      >
        {filteredChannels.map((channel, index) => (
          <motion.button
            id={`channel-${index}`}
            key={channel.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFocusedIndex(index);
              onSelectChannel(channel);
            }}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative tv-focus-ring ${
              selectedChannelId === channel.id
                ? 'bg-brand-primary/10 border border-brand-primary/20'
                : 'hover:bg-bg-hover border border-transparent'
            } ${focusedIndex === index ? 'ring-4 ring-brand-focus ring-offset-0' : ''}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              selectedChannelId === channel.id ? 'bg-brand-primary' : 'bg-bg-dark'
            }`}>
              {channel.logoUrl ? (
                <img src={channel.logoUrl} alt={channel.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <Play className={`w-5 h-5 ${selectedChannelId === channel.id ? 'text-white' : 'text-gray-600'}`} />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`font-semibold truncate ${selectedChannelId === channel.id ? 'text-brand-primary' : 'text-gray-200'}`}>
                {channel.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{channel.category}</p>
            </div>
            {selectedChannelId === channel.id && (
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
            )}
          </motion.button>
        ))}
        
        {filteredChannels.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-gray-500 text-sm">No channels found</p>
          </div>
        )}
      </div>
    </div>
  );
}

