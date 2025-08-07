export default function TestPage() {
  const testAI = async () => {
    console.log('🚀 Testing AI Recommendations Endpoint...\n');
    
    try {
      const response = await fetch('/api/ai/team-recommendations?game=League+of+Legends&limit=5', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response:', errorText);
        return;
      }

      const data = await response.json();
      console.log('\n📦 Response Data:', data);
      
      if (data.recommendations && data.recommendations.length > 0) {
        console.log('\n🎯 Sample Recommendation:');
        const first = data.recommendations[0];
        console.log('- Team Name:', first.team?.name);
        console.log('- Score:', first.score);
        console.log('- Reason:', first.reason);
      } else {
        console.log('\n❌ No recommendations returned');
        console.log('Full response:', JSON.stringify(data, null, 2));
      }

    } catch (error) {
      console.error('❌ Network/Parse Error:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI Recommendations Test</h1>
      <button 
        onClick={testAI}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test AI Endpoint
      </button>
      <p className="mt-4 text-gray-600">
        Click the button and check the browser console (F12) for results.
        Also check your server terminal for detailed logs.
      </p>
    </div>
  );
}
