import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Gaming Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-2 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-red-500/20"></div>
          ))}
        </div>
      </div>

      {/* Red Glowing Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-48 h-48 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-44 h-44 bg-red-700/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center relative">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L9 9l-8 .75L8.64 17 7 23l5-4 5 4-1.64-6L23 9.75 15 9 12 1z"/>
            </svg>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">ENTER THE</h1>
          <h2 className="text-2xl font-bold text-red-500 mb-4">ARENA</h2>
          <p className="text-gray-300 font-medium">Join the elite. Prove your worth. Dominate the competition.</p>
        </div>
        
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/30">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-500",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-red-500/30 text-white hover:bg-red-600/20",
                formFieldInput: "bg-black border-red-500/30 text-white",
                footerActionLink: "text-red-500 hover:text-red-400"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}