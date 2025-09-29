import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InterviewState } from './interviewSlice'

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  resumeContent: string
  totalScore: number
  summary: string
  completedAt: string
  answers: Array<{
    questionId: string
    question: string
    answer: string
    timeSpent: number
    score?: number
    difficulty: 'easy' | 'medium' | 'hard'
  }>
}

interface CandidatesState {
  candidates: Candidate[]
  searchTerm: string
  sortBy: 'name' | 'score' | 'date'
  sortOrder: 'asc' | 'desc'
}

const initialState: CandidatesState = {
  candidates: [],
  searchTerm: '',
  sortBy: 'date',
  sortOrder: 'desc'
}

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<InterviewState>) => {
      const interview = action.payload
      if (interview.isCompleted) {
        const candidate: Candidate = {
          id: interview.sessionId,
          name: interview.candidateInfo.name,
          email: interview.candidateInfo.email,
          phone: interview.candidateInfo.phone,
          resumeContent: interview.candidateInfo.resumeContent,
          totalScore: interview.totalScore,
          summary: interview.summary,
          completedAt: new Date().toISOString(),
          answers: interview.answers.map(answer => {
            const question = interview.questions.find(q => q.id === answer.questionId)
            return {
              questionId: answer.questionId,
              question: question?.text || '',
              answer: answer.answer,
              timeSpent: answer.timeSpent,
              score: answer.score,
              difficulty: question?.difficulty || 'easy'
            }
          })
        }
        
        const existingIndex = state.candidates.findIndex(c => c.id === candidate.id)
        if (existingIndex >= 0) {
          state.candidates[existingIndex] = candidate
        } else {
          state.candidates.push(candidate)
        }
      }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setSortBy: (state, action: PayloadAction<'name' | 'score' | 'date'>) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload
    },
    deleteCandidate: (state, action: PayloadAction<string>) => {
      state.candidates = state.candidates.filter(c => c.id !== action.payload)
    }
  }
})

export const {
  addCandidate,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  deleteCandidate
} = candidatesSlice.actions

export default candidatesSlice.reducer