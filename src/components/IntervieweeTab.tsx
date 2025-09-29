import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { 
  setCandidateInfo, 
  startInterview, 
  submitAnswer, 
  updateTimer, 
  pauseInterview, 
  resumeInterview, 
  completeInterview,
  resetInterview
} from '../store/slices/interviewSlice'
import { addCandidate } from '../store/slices/candidatesSlice'
import { ResumeParser } from '../services/resumeParser'
import { AIService } from '../services/aiService'
import { Upload, Clock, Pause, Play, CheckCircle, FileText, User, Mail, Phone } from 'lucide-react'

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch()
  const interview = useSelector((state: RootState) => state.interview)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  // Check for existing session on component mount
  useEffect(() => {
    if (interview.isStarted && !interview.isCompleted && interview.sessionId) {
      setShowWelcomeBack(true)
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (interview.isStarted && !interview.isPaused && !interview.isCompleted && interview.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        dispatch(updateTimer(interview.timeRemaining - 1))
      }, 1000)
    } else if (interview.timeRemaining === 0 && interview.isStarted && !interview.isCompleted) {
      // Auto-submit when timer reaches 0
      handleSubmitAnswer()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [interview.isStarted, interview.isPaused, interview.isCompleted, interview.timeRemaining])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const parsedData = await ResumeParser.parseFile(file)
      dispatch(setCandidateInfo(parsedData))
      
      // Check for missing fields
      const missing = []
      if (!parsedData.name) missing.push('Name')
      if (!parsedData.email) missing.push('Email')  
      if (!parsedData.phone) missing.push('Phone')
      
      setMissingFields(missing)
    } catch (error) {
      alert('Error parsing resume. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleStartInterview = () => {
    if (missingFields.length > 0) {
      alert(`Please provide the following missing information: ${missingFields.join(', ')}`)
      return
    }
    
    const questions = AIService.generateQuestions()
    const sessionId = Date.now().toString()
    dispatch(startInterview({ questions, sessionId }))
  }

  const handleSubmitAnswer = () => {
    const currentQuestion = interview.questions[interview.currentQuestionIndex]
    if (currentQuestion) {
      const timeSpent = currentQuestion.timeLimit - interview.timeRemaining
      dispatch(submitAnswer({ answer: currentAnswer, timeSpent }))
      setCurrentAnswer('')
      
      // Check if this was the last question
      if (interview.currentQuestionIndex === interview.questions.length - 1) {
        // Evaluate all answers
        const evaluation = AIService.evaluateAnswers(interview.questions, [
          ...interview.answers,
          { questionId: currentQuestion.id, answer: currentAnswer, timeSpent }
        ])
        
        dispatch(completeInterview({ 
          totalScore: evaluation.totalScore, 
          summary: evaluation.summary 
        }))
        
        // Add to candidates list
        setTimeout(() => {
          dispatch(addCandidate({
            ...interview,
            answers: [...interview.answers, { 
              questionId: currentQuestion.id, 
              answer: currentAnswer, 
              timeSpent,
              score: evaluation.evaluatedAnswers[evaluation.evaluatedAnswers.length - 1]?.score
            }],
            totalScore: evaluation.totalScore,
            summary: evaluation.summary,
            isCompleted: true
          }))
        }, 100)
      }
    }
  }

  const handlePause = () => {
    dispatch(pauseInterview())
  }

  const handleResume = () => {
    dispatch(resumeInterview())
    setShowWelcomeBack(false)
  }

  const handleRestart = () => {
    dispatch(resetInterview())
    setCurrentAnswer('')
    setMissingFields([])
    setShowWelcomeBack(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-amber-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Welcome Back Modal
  if (showWelcomeBack) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back!</h2>
            <p className="text-gray-600 mb-6">
              You have an interview in progress. Would you like to continue where you left off?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleResume}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue Interview
              </button>
              <button
                onClick={handleRestart}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!interview.isStarted ? (
        // Resume Upload and Info Collection
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Interview Assistant</h1>
            <p className="text-xl text-gray-600">Upload your resume to get started</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isUploading ? 'Parsing Resume...' : 'Upload Resume'}
              </h3>
              <p className="text-gray-500">
                Support for PDF and DOCX files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {interview.candidateInfo.content && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">Resume Parsed Successfully!</span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4" />
                      Name {missingFields.includes('Name') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={interview.candidateInfo.name}
                      onChange={(e) => dispatch(setCandidateInfo({ name: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        missingFields.includes('Name') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4" />
                      Email {missingFields.includes('Email') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="email"
                      value={interview.candidateInfo.email}
                      onChange={(e) => dispatch(setCandidateInfo({ email: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        missingFields.includes('Email') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Phone className="h-4 w-4" />
                      Phone {missingFields.includes('Phone') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      value={interview.candidateInfo.phone}
                      onChange={(e) => dispatch(setCandidateInfo({ phone: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        missingFields.includes('Phone') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="text-center pt-6">
                  <button
                    onClick={handleStartInterview}
                    disabled={missingFields.length > 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    Start AI Interview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : interview.isCompleted ? (
        // Completion Screen
        <div className="text-center space-y-8">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Completed!</h1>
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
              <div className="text-6xl font-bold text-blue-600 mb-4">{interview.totalScore}%</div>
              <p className="text-lg text-gray-700 mb-6">{interview.summary}</p>
              <button
                onClick={handleRestart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Active Interview
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Interview Progress</h2>
              <span className="text-sm text-gray-500">
                Question {interview.currentQuestionIndex + 1} of {interview.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((interview.currentQuestionIndex) / interview.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          {interview.questions[interview.currentQuestionIndex] && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                      interview.questions[interview.currentQuestionIndex].difficulty === 'easy' ? 'bg-green-500' :
                      interview.questions[interview.currentQuestionIndex].difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      {interview.questions[interview.currentQuestionIndex].difficulty.toUpperCase()}
                    </span>
                    <h3 className="text-2xl font-bold">
                      {interview.questions[interview.currentQuestionIndex].text}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-2xl font-mono">
                      <Clock className="h-6 w-6" />
                      <span className={interview.timeRemaining <= 10 ? 'text-red-300 animate-pulse' : ''}>
                        {formatTime(interview.timeRemaining)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {interview.isPaused ? (
                        <button
                          onClick={handleResume}
                          className="bg-green-500 hover:bg-green-600 p-2 rounded-lg transition-colors"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handlePause}
                          className="bg-amber-500 hover:bg-amber-600 p-2 rounded-lg transition-colors"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={interview.isPaused}
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    {currentAnswer.length} characters
                  </span>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={interview.isPaused}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IntervieweeTab