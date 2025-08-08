import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Crosshair, Trophy, Zap, ArrowLeft, Brain, Target, Users } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 h-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-red-500/20"></div>
          ))}
        </div>
      </div>

 
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-48 h-48 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-44 h-44 bg-red-700/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        

        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-ping"
            style={{
              left: `${10 + (i * 9)}%`,
              top: `${15 + (i * 7)}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: '5s'
            }}
          />
        ))}
      </div>


      <Link 
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-300 group"
      >
        <div className="w-10 h-10 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span className="hidden md:block font-bold">BACK TO BASE</span>
      </Link>
      
      <div className="relative z-10 w-full max-w-lg mx-auto p-6">
  
        <div className="text-center mb-12 w-full flex flex-col items-center">

          <div className="mb-8 flex justify-center w-full">
            <div className="relative">
              <div className="absolute inset-0 w-28 h-28 border-4 border-red-500/30 rounded-3xl animate-spin-slow"></div>
              <div className="absolute inset-2 w-24 h-24 border-2 border-red-600/50 rounded-2xl animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }}></div>
              
              <div className="relative w-28 h-28 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center group">
                <Crosshair className="w-14 h-14 text-white group-hover:scale-110 transition-transform duration-300" />
                
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                  <Target className="w-3 h-3 text-white" />
                </div>
              </div>
              
    
              <div className="absolute inset-0 w-28 h-28 border-2 border-red-500/50 rounded-3xl animate-ping opacity-75"></div>
              <div className="absolute inset-2 w-24 h-24 border border-red-400/30 rounded-2xl animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          <div className="mb-6 flex justify-center w-full">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-widest text-center">
              SCRIMIFY<span className="text-red-500">AI</span>
            </h1>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-3 relative">
            <span className="relative">
              ENTER THE
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-red-500 mb-4 flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 animate-pulse" />
            ARENA
            <Zap className="w-8 h-8 animate-pulse" />
          </h3>
          <p className="text-gray-300 font-medium px-4 text-lg">
            Join the elite. Prove your worth. Dominate the competition.
          </p>
          
          <div className="flex justify-center items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4 text-red-500" />
              <span className="font-bold">25K+ Warriors</span>
            </div>
            <div className="w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Brain className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-bold">AI-Powered</span>
            </div>
          </div>
        </div>
        
   
        <div className="relative group w-full flex justify-center">
          <div className="absolute -inset-6 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="absolute -inset-3 bg-gradient-to-r from-red-600/25 to-red-800/25 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg rounded-3xl p-8 border-2 border-red-500/30 hover:border-red-500/70 transition-all duration-500 w-full max-w-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            
            <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            
            <div className="w-full flex justify-center">
              <div className="w-full max-w-sm mx-auto">
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: "w-full mx-auto",
                      card: "bg-transparent shadow-none w-full",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border-red-500/30 text-white hover:bg-red-600/20 hover:border-red-500/70 transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/20 w-full",
                      formFieldInput: "bg-black/80 border-red-500/30 text-white placeholder:text-gray-400 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-300 w-full",
                      formFieldLabel: "text-gray-300 font-bold text-sm",
                      footerActionLink: "text-red-500 hover:text-red-400 font-bold transition-colors duration-300 hover:underline",
                      dividerLine: "bg-red-500/30",
                      dividerText: "text-gray-400 font-medium text-center",
                      formFieldInputShowPasswordButton: "text-gray-400 hover:text-red-500 transition-colors duration-300",
                      identityPreviewEditButton: "text-red-500 hover:text-red-400",
                      formHeaderTitle: "text-white font-black text-xl text-center",
                      formHeaderSubtitle: "text-gray-400 text-center",
                      socialButtonsBlockButtonText: "font-bold text-center",
                      formFieldSuccessText: "text-green-400 font-medium",
                      formFieldErrorText: "text-red-400 font-medium",
                      alertText: "text-red-400 font-medium",
                      formResendCodeLink: "text-red-500 hover:text-red-400 font-bold",
                      formFieldAction: "text-red-500 hover:text-red-400 font-bold",
                      otpCodeFieldInput: "bg-black/80 border-red-500/30 text-white focus:border-red-500 transition-all duration-300",
                      formFieldHintText: "text-gray-500 text-xs",
                      phoneInputBox: "bg-black/80 border-red-500/30 text-white focus:border-red-500 transition-all duration-300",
                      footer: "text-center",
                      formButtonReset: "text-red-500 hover:text-red-400 transition-colors duration-300"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4 w-full">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-black/60 border border-red-500/30 rounded-full px-4 py-2 backdrop-blur-sm">
              <Brain className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-gray-300 text-sm font-bold">AI-Enhanced Security</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center text-xs max-w-sm mx-auto">
            <div className="bg-gray-900/60 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <span className="text-gray-300 font-bold">Elite Status</span>
            </div>
            <div className="bg-gray-900/60 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
              <Target className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <span className="text-gray-300 font-bold">AI Matching</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}