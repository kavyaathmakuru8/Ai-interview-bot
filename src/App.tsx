import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store'
import IntervieweeTab from './components/IntervieweeTab'
import InterviewerTab from './components/InterviewerTab'
import { Users, MessageCircle, Loader } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'interviewee' | 'interviewer'>('interviewee')

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Loading interview assistant...</p>
            </div>
          </div>
        } 
        persistor={persistor}
      >
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          {/* Navigation Tabs */}
          <div className="bg-white border-b shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('interviewee')}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold transition-colors border-b-2 ${
                    activeTab === 'interviewee'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 border-transparent'
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  Interviewee (Chat)
                </button>
                
                <button
                  onClick={() => setActiveTab('interviewer')}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold transition-colors border-b-2 ${
                    activeTab === 'interviewer'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 border-transparent'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Interviewer (Dashboard)
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerTab />}
          </div>
        </div>
      </PersistGate>
    </Provider>
  )
}

export default App