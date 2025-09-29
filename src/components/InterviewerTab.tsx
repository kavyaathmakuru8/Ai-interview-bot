import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { setSearchTerm, setSortBy, setSortOrder, deleteCandidate } from '../store/slices/candidatesSlice'
import { Candidate } from '../store/slices/candidatesSlice'
import { Search, Import as SortAsc, Dessert as SortDesc, Eye, Trash2, User, Mail, Phone, Clock, Award, ArrowLeft } from 'lucide-react'

const InterviewerTab: React.FC = () => {
  const dispatch = useDispatch()
  const { candidates, searchTerm, sortBy, sortOrder } = useSelector((state: RootState) => state.candidates)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  // Filter and sort candidates
  const filteredAndSortedCandidates = React.useMemo(() => {
    let filtered = candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'score':
          aValue = a.totalScore
          bValue = b.totalScore
          break
        case 'date':
          aValue = new Date(a.completedAt).getTime()
          bValue = new Date(b.completedAt).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [candidates, searchTerm, sortBy, sortOrder])

  const handleSort = (newSortBy: 'name' | 'score' | 'date') => {
    if (sortBy === newSortBy) {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'))
    } else {
      dispatch(setSortBy(newSortBy))
      dispatch(setSortOrder('asc'))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 65) return 'text-blue-600 bg-blue-100'
    if (score >= 50) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-amber-100 text-amber-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedCandidate) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCandidate(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>

        {/* Candidate Profile */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedCandidate.name}</h1>
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{selectedCandidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{selectedCandidate.phone}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-2">{selectedCandidate.totalScore}%</div>
                <div className="text-blue-100">Overall Score</div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Interview Summary</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCandidate.summary}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Interview Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">{formatDate(selectedCandidate.completedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-medium">{selectedCandidate.answers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Time:</span>
                    <span className="font-medium">
                      {formatTime(selectedCandidate.answers.reduce((sum, answer) => sum + answer.timeSpent, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Answers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Interview Answers</h2>
          {selectedCandidate.answers.map((answer, index) => (
            <div key={answer.questionId} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      Question {index + 1}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${getDifficultyColor(answer.difficulty)}`}>
                      {answer.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {answer.score !== undefined && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(answer.score)}`}>
                        {answer.score}%
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{formatTime(answer.timeSpent)}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{answer.question}</h3>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answer.answer || 'No answer provided'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Dashboard</h1>
        <p className="text-gray-600">Manage and review candidate interviews</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('name')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'name' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Name
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={() => handleSort('score')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'score' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Score
              {sortBy === 'score' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={() => handleSort('date')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'date' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Date
              {sortBy === 'date' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      {filteredAndSortedCandidates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No candidates match your search criteria.' : 'No interviews have been completed yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(candidate.totalScore)}`}>
                        {candidate.totalScore}%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(candidate.completedAt)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 line-clamp-2">{candidate.summary}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-6">
                    <div className="text-right mr-4">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Award className="h-4 w-4" />
                        <span>{candidate.answers.length} questions</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{candidate.totalScore}%</div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => dispatch(deleteCandidate(candidate.id))}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors"
                      title="Delete Candidate"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InterviewerTab