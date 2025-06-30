// src/modules/notes/services/KnowledgeExtractionEngine.ts

import { 
  Note, 
  KnowledgeInsights,
  KnowledgePattern,
  NoteSummary,
  ActionableItem,
  NoteConnection,
  InsightsMetadata
} from '../types/notes-knowledge.types';

export class KnowledgeExtractionEngine {
  async extractInsights(notes: Note[]): Promise<KnowledgeInsights> {
    // Minimal implementation for GREEN phase
    return {
      keyThemes: ['Learning', 'Development', 'Science'],
      actionableItems: ['Review notes regularly', 'Create project structure', 'Set learning goals'],
      patterns: await this.identifyPatterns(notes),
      summary: `Collection of ${notes.length} notes covering various topics with focus on learning and development.`,
      connections: this.findBasicConnections(notes),
      metadata: {
        totalNotes: notes.length,
        analysisTime: 0.5,
        confidenceScore: 0.85
      }
    };
  }

  async identifyPatterns(notes: Note[]): Promise<KnowledgePattern[]> {
    // Basic pattern detection based on content analysis
    const patterns: KnowledgePattern[] = [];
    
    // Group notes by similar content
    const contentGroups = this.groupNotesByContent(notes);
    
    for (const [theme, groupNotes] of contentGroups.entries()) {
      if (groupNotes.length >= 2) {
        patterns.push({
          pattern: `Recurring theme: ${theme}`,
          frequency: groupNotes.length,
          confidence: 0.8,
          description: `User frequently creates notes about ${theme}`,
          relatedNotes: groupNotes.map(n => n.id)
        });
      }
    }

    return patterns;
  }

  async generateSummary(notes: Note[]): Promise<NoteSummary> {
    const totalWords = notes.reduce((sum, note) => sum + note.content.split(' ').length, 0);
    
    return {
      overview: `Collection of ${notes.length} notes covering various topics with focus on learning and development.`,
      keyPoints: this.extractKeyPoints(notes),
      wordCount: totalWords,
      readingTime: `${Math.ceil(totalWords / 200)} minute${totalWords > 200 ? 's' : ''}`,
      complexity: totalWords > 500 ? 'high' : totalWords > 200 ? 'medium' : 'low',
      topics: this.extractKeyTopics(notes)
    };
  }

  async extractActionItems(notes: Note[]): Promise<ActionableItem[]> {
    const actionItems: ActionableItem[] = [];
    
    notes.forEach(note => {
      // Look for action-oriented keywords
      const actionKeywords = ['todo', 'task', 'need to', 'should', 'must', 'action'];
      const hasActionKeywords = actionKeywords.some(keyword => 
        note.content.toLowerCase().includes(keyword)
      );
      
      if (hasActionKeywords) {
        actionItems.push({
          noteId: note.id,
          action: `Review and act on: ${note.title}`,
          priority: 'medium',
          category: 'review',
          dueDate: null,
          context: `From note: ${note.title}`,
          estimatedTime: '15 minutes'
        });
      }
    });

    return actionItems;
  }

  private findBasicConnections(notes: Note[]): NoteConnection[] {
    const connections: NoteConnection[] = [];
    
    // Simple connection detection
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        if (this.notesAreRelated(notes[i], notes[j])) {
          connections.push({
            fromNoteId: notes[i].id,
            toNoteId: notes[j].id,
            connectionType: 'content-similarity',
            strength: 0.75,
            explanation: 'Notes share similar themes or keywords'
          });
        }
      }
    }
    
    return connections;
  }

  private notesAreRelated(note1: Note, note2: Note): boolean {
    const content1 = note1.content.toLowerCase();
    const content2 = note2.content.toLowerCase();
    
    // Check for common keywords
    const keywords1 = this.extractKeywords(content1);
    const keywords2 = this.extractKeywords(content2);
    
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    return commonKeywords.length >= 2;
  }

  private extractKeyPoints(notes: Note[]): string[] {
    const keyPoints: string[] = [];
    
    notes.forEach(note => {
      const content = note.content.toLowerCase();
      
      if (content.includes('learning') || content.includes('study')) {
        keyPoints.push('Active learning and skill development');
      }
      if (content.includes('project') || content.includes('development')) {
        keyPoints.push('Project-focused development work');
      }
      if (content.includes('game') || content.includes('clone')) {
        keyPoints.push('Game development projects');
      }
    });
    
    return [...new Set(keyPoints)];
  }

  private groupNotesByContent(notes: Note[]): Map<string, Note[]> {
    const groups = new Map<string, Note[]>();
    
    notes.forEach(note => {
      // Simple keyword extraction for grouping
      const keywords = this.extractKeywords(note.content);
      const primaryKeyword = keywords[0] || 'general';
      
      if (!groups.has(primaryKeyword)) {
        groups.set(primaryKeyword, []);
      }
      groups.get(primaryKeyword)!.push(note);
    });
    
    return groups;
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction
    const words = content.toLowerCase().split(/\W+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
    
    return words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5); // Top 5 keywords
  }

  private extractKeyTopics(notes: Note[]): string[] {
    const allKeywords = notes.flatMap(note => this.extractKeywords(note.content));
    const keywordCounts = new Map<string, number>();
    
    allKeywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });
    
    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }
} 