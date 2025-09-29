import { Question } from '../store/slices/interviewSlice'

// Simulated AI service for generating questions and evaluating answers
export class AIService {
  private static questionTemplates = {
    easy: [
      "Tell me about yourself and your professional background.",
      "Why are you interested in this position?",
      "What are your greatest strengths?",
      "Describe your ideal work environment.",
      "What motivates you to do your best work?"
    ],
    medium: [
      "Describe a challenging project you've worked on and how you overcame obstacles.",
      "How do you handle tight deadlines and competing priorities?",
      "Tell me about a time when you had to work with a difficult team member.",
      "What's your approach to learning new technologies or skills?",
      "How do you handle constructive criticism and feedback?"
    ],
    hard: [
      "Design a system that can handle millions of concurrent users. Walk me through your architecture decisions.",
      "You notice a critical bug in production that affects 20% of users. How do you handle this situation?",
      "How would you implement a recommendation system for an e-commerce platform?",
      "Explain how you would optimize a slow-performing database query.",
      "Design a distributed cache system that can scale globally."
    ]
  }

  static generateQuestions(): Question[] {
    const questions: Question[] = []
    
    // Generate 2 easy questions (20s each)
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * this.questionTemplates.easy.length)
      questions.push({
        id: `easy_${i + 1}`,
        text: this.questionTemplates.easy[randomIndex],
        difficulty: 'easy',
        timeLimit: 20
      })
    }
    
    // Generate 2 medium questions (60s each)
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * this.questionTemplates.medium.length)
      questions.push({
        id: `medium_${i + 1}`,
        text: this.questionTemplates.medium[randomIndex],
        difficulty: 'medium',
        timeLimit: 60
      })
    }
    
    // Generate 2 hard questions (120s each)
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * this.questionTemplates.hard.length)
      questions.push({
        id: `hard_${i + 1}`,
        text: this.questionTemplates.hard[randomIndex],
        difficulty: 'hard',
        timeLimit: 120
      })
    }
    
    return questions
  }

  static evaluateAnswers(questions: Question[], answers: Array<{ questionId: string, answer: string, timeSpent: number }>) {
    let totalScore = 0
    const evaluatedAnswers = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId)
      let score = 0
      
      if (question) {
        // Simple scoring based on answer length and time spent
        const answerLength = answer.answer.trim().length
        const timeRatio = answer.timeSpent / question.timeLimit
        
        // Base score based on answer length
        if (answerLength > 200) score += 40
        else if (answerLength > 100) score += 30
        else if (answerLength > 50) score += 20
        else if (answerLength > 0) score += 10
        
        // Bonus for using most of the time (shows thoughtfulness)
        if (timeRatio > 0.7) score += 20
        else if (timeRatio > 0.5) score += 15
        else if (timeRatio > 0.3) score += 10
        
        // Difficulty multiplier
        if (question.difficulty === 'hard') score = Math.min(100, score * 1.2)
        else if (question.difficulty === 'medium') score = Math.min(100, score * 1.1)
        
        // Add some randomness for realism
        score += Math.random() * 10 - 5
        score = Math.max(0, Math.min(100, Math.round(score)))
      }
      
      totalScore += score
      return { ...answer, score }
    })
    
    const averageScore = Math.round(totalScore / answers.length)
    
    // Generate summary based on score
    let summary = ""
    if (averageScore >= 80) {
      summary = "Excellent performance! The candidate demonstrated strong technical knowledge and communication skills across all difficulty levels."
    } else if (averageScore >= 65) {
      summary = "Good performance with solid understanding of concepts. Some areas could benefit from more detailed explanations."
    } else if (averageScore >= 50) {
      summary = "Average performance. The candidate shows basic understanding but needs improvement in technical depth and communication."
    } else {
      summary = "Below average performance. Significant gaps in technical knowledge and communication skills were observed."
    }
    
    return {
      totalScore: averageScore,
      summary,
      evaluatedAnswers
    }
  }
}