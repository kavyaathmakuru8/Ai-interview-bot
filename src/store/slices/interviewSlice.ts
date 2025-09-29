import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Question {
  id: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
}

export interface Answer {
  questionId: string
  answer: string
  timeSpent: number
  score?: number
}

export interface InterviewState {
  candidateInfo: {
    name: string
    email: string
    phone: string
    resumeContent: string
  }
  questions: Question[]
  answers: Answer[]
  currentQuestionIndex: number
  timeRemaining: number
  isPaused: boolean
  isCompleted: boolean
  isStarted: boolean
  totalScore: number
  summary: string
  sessionId: string
}

const initialState: InterviewState = {
  candidateInfo: {
    name: '',
    email: '',
    phone: '',
    resumeContent: ''
  },
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isPaused: false,
  isCompleted: false,
  isStarted: false,
  totalScore: 0,
  summary: '',
  sessionId: ''
}

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCandidateInfo: (state, action: PayloadAction<Partial<InterviewState['candidateInfo']>>) => {
      state.candidateInfo = { ...state.candidateInfo, ...action.payload }
    },
    startInterview: (state, action: PayloadAction<{ questions: Question[], sessionId: string }>) => {
      state.questions = action.payload.questions
      state.sessionId = action.payload.sessionId
      state.isStarted = true
      state.currentQuestionIndex = 0
      state.timeRemaining = action.payload.questions[0]?.timeLimit || 0
      state.answers = []
      state.isPaused = false
      state.isCompleted = false
    },
    submitAnswer: (state, action: PayloadAction<{ answer: string, timeSpent: number }>) => {
      const currentQuestion = state.questions[state.currentQuestionIndex]
      if (currentQuestion) {
        const newAnswer: Answer = {
          questionId: currentQuestion.id,
          answer: action.payload.answer,
          timeSpent: action.payload.timeSpent
        }
        
        const existingAnswerIndex = state.answers.findIndex(a => a.questionId === currentQuestion.id)
        if (existingAnswerIndex >= 0) {
          state.answers[existingAnswerIndex] = newAnswer
        } else {
          state.answers.push(newAnswer)
        }
        
        // Move to next question
        if (state.currentQuestionIndex < state.questions.length - 1) {
          state.currentQuestionIndex++
          state.timeRemaining = state.questions[state.currentQuestionIndex].timeLimit
        } else {
          state.isCompleted = true
        }
      }
    },
    updateTimer: (state, action: PayloadAction<number>) => {
      if (!state.isPaused) {
        state.timeRemaining = action.payload
      }
    },
    pauseInterview: (state) => {
      state.isPaused = true
    },
    resumeInterview: (state) => {
      state.isPaused = false
    },
    completeInterview: (state, action: PayloadAction<{ totalScore: number, summary: string }>) => {
      state.isCompleted = true
      state.totalScore = action.payload.totalScore
      state.summary = action.payload.summary
    },
    resetInterview: () => initialState
  }
})

export const {
  setCandidateInfo,
  startInterview,
  submitAnswer,
  updateTimer,
  pauseInterview,
  resumeInterview,
  completeInterview,
  resetInterview
} = interviewSlice.actions

export default interviewSlice.reducer