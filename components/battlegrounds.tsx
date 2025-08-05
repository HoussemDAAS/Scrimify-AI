'use client'

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Crosshair, Trophy, Users, Zap } from "lucide-react";

interface Game {
  name: string;
  players: string;
  rank: string;
  color: string;
  logo: string;
}

interface BattlegroundsProps {
  games: Game[];
}

export default function Battlegrounds({ games }: BattlegroundsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationDelay(prev => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 md:py-32 bg-gray-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent"></div>
        {/* Floating Elements */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-red-500/30 rounded-full animate-ping`}
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i * 10)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">BATTLEGROUNDS</h2>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-gray-300 text-lg md:text-xl font-medium px-4">
            AI-powered matchmaking across competitive titles
          </p>
        </div>

        {/* Main Games Showcase */}
        <div className="relative">
          {/* Connecting Lines Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full opacity-20">
              {games.map((_, index) => {
                if (index < games.length - 1) {
                  return (
                    <line
                      key={index}
                      x1={`${(index + 1) * (100 / (games.length + 1))}%`}
                      y1="50%"
                      x2={`${(index + 2) * (100 / (games.length + 1))}%`}
                      y2="50%"
                      stroke="url(#redGradient)"
                      strokeWidth="2"
                      className="animate-pulse"
                      strokeDasharray="5,5"
                    />
                  );
                }
                return null;
              })}
              <defs>
                <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 md:gap-12">
            {games.map((game, index) => (
              <div
                key={index}
                className="group relative h-full"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Main Card - Fixed Height */}
                <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/20 rounded-3xl overflow-hidden group-hover:border-red-500/80 transition-all duration-500 group-hover:scale-105 h-80 flex flex-col">
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-red-600 text-white font-black text-xs border-2 border-red-400">
                      {game.rank}
                    </Badge>
                  </div>

                  {/* Logo Container */}
                  <div className="relative p-6 flex flex-col items-center justify-center flex-1">
                    <div className="relative mb-4">
                      {/* Spinning Ring */}
                      <div className="absolute inset-0 w-28 h-28 border-4 border-red-500/30 rounded-full animate-spin-slow group-hover:border-red-500/80 transition-colors duration-500"></div>
                      
                      {/* Inner Glow */}
                      <div className="absolute inset-2 w-24 h-24 bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-full group-hover:from-red-600/40 group-hover:to-red-900/40 transition-all duration-500"></div>
                      
                      {/* Logo */}
                      <div className="relative w-28 h-28 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-gray-700/80 transition-all duration-500">
                        <img 
                          src={game.logo} 
                          alt={`${game.name} Logo`}
                          className="w-16 h-16 object-contain filter brightness-90 group-hover:brightness-110 group-hover:scale-110 transition-all duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm hidden items-center justify-center rounded-full">
                          <Crosshair className="h-10 w-10 text-red-500" />
                        </div>
                      </div>

                      {/* Pulse Ring */}
                      <div className="absolute inset-0 w-28 h-28 border-2 border-red-500/50 rounded-full animate-ping opacity-0 group-hover:opacity-75"></div>
                    </div>

                    {/* Game Info */}
                    <div className="text-center space-y-2">
                      <h3 className="text-white font-black text-base md:text-lg leading-tight group-hover:text-red-100 transition-colors duration-300 min-h-[2.5rem] flex items-center justify-center">
                        {game.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <Users className="h-3 w-3" />
                        <span className="font-bold text-xs md:text-sm">{game.players} WARRIORS</span>
                      </div>
                    </div>

                    {/* Power Indicator */}
                    <div className="mt-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            i < parseInt(game.rank.replace('#', '')) 
                              ? 'bg-red-500 animate-pulse' 
                              : 'bg-gray-600'
                          }`}
                          style={{
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Floating Stats */}
                <div className={`absolute -top-2 -right-2 bg-black border-2 border-red-500 rounded-lg px-3 py-1 transform transition-all duration-300 ${
                  hoveredIndex === index ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}>
                  <span className="text-red-500 font-bold text-sm">ONLINE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-16 bg-black/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-black text-red-500">5</div>
              <div className="text-gray-400 text-sm font-bold">GAMES</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-black text-red-500">6.3M+</div>
              <div className="text-gray-400 text-sm font-bold">PLAYERS</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-black text-red-500">24/7</div>
              <div className="text-gray-400 text-sm font-bold">ACTIVE</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-black text-red-500">AI</div>
              <div className="text-gray-400 text-sm font-bold">POWERED</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}