import Link from "next/link";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { AccentButton } from "@/components/ui/accent-button";
import Battlegrounds from "@/components/battlegrounds";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Zap, 
  Target, 
  Clock,
  Star,
  ArrowRight,
  Shield,
  Sword,
  Crosshair,
  Flame,
  Brain,
  BarChart3,
  Calendar
} from "lucide-react";

export default function HomePage() {
  const games = [
    { 
      name: "VALORANT", 
      players: "2.1M", 
      rank: "#1", 
      color: "from-red-600 to-red-800",
      logo: "/logos/valorant-logo.png"
    },
    { 
      name: "LEAGUE OF LEGENDS", 
      players: "1.8M", 
      rank: "#2", 
      color: "from-red-500 to-red-700",
      logo: "/logos/lol-logo.png"
    },
    { 
      name: "COUNTER-STRIKE 2", 
      players: "1.5M", 
      rank: "#3", 
      color: "from-red-600 to-red-900",
      logo: "/logos/cs2-logo.png"
    },
    { 
      name: "OVERWATCH 2", 
      players: "900K", 
      rank: "#4", 
      color: "from-red-400 to-red-600",
      logo: "/logos/overwatch-logo.png"
    },
    { 
      name: "ROCKET LEAGUE", 
      players: "750K", 
      rank: "#5", 
      color: "from-red-700 to-red-900",
      logo: "/logos/rocket-league-logo.png"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="relative z-10 p-4 md:p-6 bg-black/90 backdrop-blur-sm border-b border-red-500/20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center relative">
              <Crosshair className="h-5 w-5 md:h-7 md:w-7 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl md:text-2xl font-bold text-white">SCRIMIFY</span>
              <span className="text-red-500 text-xs md:text-sm font-bold ml-1 md:ml-2">AI</span>
            </div>
          </div>
          <div className="flex gap-2 md:gap-4">
            <AccentButton asChild className="text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
              <Link href="/sign-in">SIGN IN</Link>
            </AccentButton>
            <PrimaryButton asChild className="text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
              <Link href="/sign-up">JOIN NOW</Link>
            </PrimaryButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Gaming Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2 md:gap-4 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-red-500/20"></div>
            ))}
          </div>
        </div>

        {/* Enhanced Red Glowing Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 md:top-20 md:left-20 w-20 h-20 md:w-32 md:h-32 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-16 md:top-60 md:right-32 w-24 h-24 md:w-40 md:h-40 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 md:bottom-32 md:left-1/3 w-20 h-20 md:w-36 md:h-36 bg-red-700/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* New floating elements */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-ping"
              style={{
                left: `${10 + (i * 12)}%`,
                top: `${20 + (i * 8)}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 py-16 md:py-32 relative z-10">
          <div className="text-center mb-12 md:mb-20">
            {/* Enhanced Badge with spinning border */}
            <div className="relative inline-block mb-6 md:mb-8">
              <div className="absolute inset-0 bg-red-600/20 rounded-full blur-lg animate-pulse"></div>
              <Badge className="relative bg-red-600 text-white font-bold px-4 py-2 md:px-6 md:py-2 text-xs md:text-sm border-2 border-red-400">
                <div className="absolute inset-0 border border-red-300 rounded-full animate-spin-slow opacity-50"></div>
                <Brain className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-pulse" />
                AI-POWERED ESPORTS REVOLUTION
              </Badge>
            </div>
            
            {/* Enhanced Title with text effects */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 md:mb-8 leading-none tracking-tight px-2 relative">
              <span className="relative">
                NEXT-GEN
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent blur-xl"></div>
              </span>
              <span className="block text-red-500 text-3xl sm:text-4xl md:text-6xl lg:text-7xl relative">
                SCRIM AI
                <div className="absolute inset-0 bg-red-500/20 blur-2xl animate-pulse"></div>
              </span>
            </h1>
            
            <p className="text-base md:text-xl text-gray-300 mb-12 md:mb-16 max-w-4xl mx-auto leading-relaxed font-medium px-4">
              The revolutionary platform that uses AI to intelligently match teams based on playstyle and performance. 
              Get automated scouting reports, AI scheduling, and strategic insights to elevate your competitive edge.
            </p>
            
            {/* Enhanced Buttons with glow effects */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-8 justify-center items-center px-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <PrimaryButton asChild size="lg" className="relative w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl">
                  <Link href="/sign-up">
                    <Brain className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
                    UNLEASH THE AI
                    <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
                  </Link>
                </PrimaryButton>
              </div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-white/10 to-gray-300/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <SecondaryButton asChild size="lg" className="relative w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl">
                  <Link href="/sign-up">
                    <Target className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                    FIND OPPONENTS
                  </Link>
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Games Section */}
      <Battlegrounds games={games} />

      {/* Enhanced Features Section */}
      <div className="py-16 md:py-32 bg-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-ping"
              style={{
                left: `${15 + (i * 18)}%`,
                top: `${25 + (i * 15)}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: '5s'
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white">AI ARSENAL</h2>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-gray-300 text-lg md:text-xl font-medium px-4">Revolutionary tools powered by artificial intelligence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: Brain, title: "AI MATCHMAKING", desc: "Advanced AI analyzes playstyle, performance metrics, and practice goals to find perfect opponents" },
              { icon: Calendar, title: "AI SCHEDULING", desc: "Intelligent assistant eliminates back-and-forth DMs and automatically coordinates optimal practice times" },
              { icon: BarChart3, title: "SCOUTING REPORTS", desc: "Automated pre-game analysis provides strategic insights and competitive advantages" }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                {/* Card glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                <Card className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 hover:border-red-500/80 transition-all duration-500 group-hover:scale-105 h-full">
                  <CardHeader className="text-center p-6 md:p-8">
                    <div className="relative mx-auto mb-4 md:mb-6">
                      {/* Spinning ring around icon */}
                      <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-2 border-red-500/30 rounded-full animate-spin-slow group-hover:border-red-500/80 transition-colors duration-500"></div>
                      
                      {/* Icon container */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                        
                        {/* Pulse ring */}
                        <div className="absolute inset-0 border-2 border-red-400/50 rounded-2xl animate-ping opacity-0 group-hover:opacity-75"></div>
                      </div>
                    </div>
                    
                    <CardTitle className="text-white text-xl md:text-2xl font-black mb-3 md:mb-4 group-hover:text-red-100 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-base md:text-lg group-hover:text-gray-300 transition-colors duration-300">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="py-16 md:py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Floating stats indicators */}
        <div className="absolute inset-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-red-500/20 rounded-full animate-ping"
              style={{
                left: `${25 + (i * 15)}%`,
                top: `${40 + (i * 5)}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: '6s'
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { label: "TEAMS MATCHED", value: "25,000+", icon: Users },
              { label: "AI ANALYSES", value: "150,000+", icon: Brain },
              { label: "GAMES SUPPORTED", value: "15+", icon: Gamepad2 },
              { label: "SUCCESS RATE", value: "96%", icon: Target }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                {/* Stat glow */}
                <div className="absolute -inset-4 bg-red-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                <div className="relative">
                  {/* Spinning border */}
                  <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 mx-auto border-2 border-red-500/20 rounded-full animate-spin-slow group-hover:border-red-500/60 transition-colors duration-500"></div>
                  
                  {/* Icon container */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                </div>
                
                <div className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3 group-hover:text-red-100 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-bold text-sm md:text-lg group-hover:text-gray-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="py-16 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10"></div>
        
        {/* Enhanced floating elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-ping"
              style={{
                left: `${20 + (i * 12)}%`,
                top: `${30 + (i * 8)}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: '7s'
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 md:mb-8 px-2 relative">
              <span className="relative">
                READY TO EVOLVE?
                <div className="absolute inset-0 bg-red-500/10 blur-2xl animate-pulse"></div>
              </span>
            </h2>
            <p className="text-lg md:text-2xl text-gray-300 mb-8 md:mb-12 font-medium px-4">
              Join the AI revolution. Elevate your gameplay. Dominate with intelligence.
            </p>
            
            <div className="relative group inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <PrimaryButton asChild size="lg" className="relative px-12 md:px-16 py-6 md:py-8 text-xl md:text-2xl border-4">
                <Link href="/sign-up">
                  <Brain className="mr-3 md:mr-4 h-6 w-6 md:h-8 md:w-8 animate-pulse" />
                  ACTIVATE AI
                  <Zap className="ml-3 md:ml-4 h-6 w-6 md:h-8 md:w-8" />
                </Link>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-black border-t-2 border-red-500/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Crosshair className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <span className="text-lg md:text-xl font-bold text-white">SCRIMIFY</span>
                <span className="text-red-500 text-xs md:text-sm font-bold ml-1 md:ml-2">AI</span>
              </div>
            </div>
            <div className="text-gray-400 font-medium text-sm md:text-base text-center">
              © 2025 SCRIMIFY AI. THE FUTURE OF COMPETITIVE GAMING.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
