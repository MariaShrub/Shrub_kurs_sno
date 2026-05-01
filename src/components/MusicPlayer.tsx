"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

// Глобальные переменные (живут вне React)
let globalAudio: HTMLAudioElement | null = null;
let isGlobalPlaying = false;
let globalTrackIndex = 0;
let globalVolume = 0.5;
let globalMuted = false;

const musicTracks = [
  {
    name: "🎵 Музыка для прогулки по Ленина",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isInitialized = useRef(false);

  // Инициализация глобального аудио (один раз)
  useEffect(() => {
    if (isInitialized.current || typeof window === "undefined") return;
    isInitialized.current = true;

    if (!globalAudio) {
      globalAudio = new Audio();
      globalAudio.loop = true;
      globalAudio.volume = globalVolume;
      globalAudio.muted = globalMuted;
      globalAudio.src = musicTracks[globalTrackIndex].url;
      
      globalAudio.onplay = () => {
        setIsPlaying(true);
        isGlobalPlaying = true;
      };
      globalAudio.onpause = () => {
        setIsPlaying(false);
        isGlobalPlaying = false;
      };
      globalAudio.oncanplay = () => {
        setIsLoading(false);
      };
      globalAudio.onerror = null;
    }

    setIsPlaying(isGlobalPlaying);
    setVolume(globalVolume);
    setIsMuted(globalMuted);
    setCurrentTrack(globalTrackIndex);

    return () => {};
  }, []);

  // Синхронизация громкости
  useEffect(() => {
    if (globalAudio) {
      globalAudio.volume = volume;
      globalVolume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!globalAudio) return;

    if (isPlaying) {
      globalAudio.pause();
      isGlobalPlaying = false;
      setIsPlaying(false);
    } else {
      try {
        if (!globalAudio.src || globalAudio.src === "") {
          globalAudio.src = musicTracks[currentTrack].url;
          globalAudio.load();
        }
        await globalAudio.play();
        isGlobalPlaying = true;
        setIsPlaying(true);
      } catch {
        // Тихая обработка
      }
    }
  };

  const changeTrack = async (index: number) => {
    if (!globalAudio) return;
    if (index === currentTrack) return;
    
    setCurrentTrack(index);
    globalTrackIndex = index;
    setIsLoading(true);
    
    const wasPlaying = isPlaying;
    globalAudio.pause();
    globalAudio.src = musicTracks[index].url;
    globalAudio.load();
    globalAudio.volume = volume;
    
    if (wasPlaying) {
      try {
        await globalAudio.play();
      } catch {
        // Тихая обработка
      }
    }
    setIsLoading(false);
  };

  const toggleMute = () => {
    if (!globalAudio) return;
    globalAudio.muted = !isMuted;
    setIsMuted(!isMuted);
    globalMuted = !isMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (globalAudio) {
      globalAudio.volume = newVolume;
      globalVolume = newVolume;
      if (newVolume > 0 && isMuted) {
        globalAudio.muted = false;
        setIsMuted(false);
        globalMuted = false;
      }
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-24 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-secondary transition-all z-50"
          title="Включить музыку"
        >
          <Music size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3 w-80 z-50 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold">🎵 Relax Music</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {isLoading && (
            <div className="mb-2 p-1 bg-blue-100 text-blue-600 text-xs rounded text-center">
              ⏳ Загрузка...
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3 max-h-24 overflow-y-auto">
            {musicTracks.map((track, idx) => (
              <button
                key={idx}
                onClick={() => changeTrack(idx)}
                className={`text-xs px-2 py-1 rounded-full whitespace-nowrap transition ${
                  currentTrack === idx
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <div className="flex items-center gap-2 flex-1 ml-2">
              <button onClick={toggleMute} className="text-gray-500 hover:text-gray-700">
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 rounded-lg bg-gray-300 accent-primary"
              />
            </div>
          </div>

          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {musicTracks[currentTrack].name}
            </p>
          </div>
        </div>
      )}
    </>
  );
}