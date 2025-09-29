import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import mammoth from 'mammoth'

// Set up the worker for pdfjs

export interface ParsedResumeData {
  name: string
  email: string
  phone: string
  content: string
}

export class ResumeParser {
  static async parseFile(file: File): Promise<ParsedResumeData> {
    let content = ''
    
    if (file.type === 'application/pdf') {
      content = await this.parsePDF(file)
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      content = await this.parseDOCX(file)
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
    }
    
    return this.extractInfo(content)
  }
  
  private static async parsePDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ''
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }
      
      return fullText
    } catch (error) {
      console.error('PDF parsing error:', error)
      return ''
    }
  }
  
  private static async parseDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    
    try {
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error('DOCX parsing error:', error)
      return ''
    }
  }
  
  private static extractInfo(content: string): ParsedResumeData {
    // Simple regex patterns for extracting information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const phoneRegex = /(\+?1?[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/g
    
    const emails = content.match(emailRegex) || []
    const phones = content.match(phoneRegex) || []
    
    // Try to extract name from the beginning of the resume
    const lines = content.split('\n').filter(line => line.trim().length > 0)
    let name = ''
    
    // Look for name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim()
      // Simple heuristic: name is likely a line with 2-4 words, no special characters
      if (line.length > 3 && line.length < 50 && /^[a-zA-Z\s]+$/.test(line) && line.split(' ').length >= 2) {
        name = line
        break
      }
    }
    
    return {
      name: name || '',
      email: emails[0] || '',
      phone: phones[0] || '',
      content: content
    }
  }
}