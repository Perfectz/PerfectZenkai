// src/modules/notes/services/KnowledgeConnectionEngine.ts

import { 
  Note, 
  RelatedNotes,
  RelatedNote,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeEdge,
  GraphMetadata
} from '../types/notes-knowledge.types';

export class KnowledgeConnectionEngine {
  async findRelatedNotes(noteId: string, allNotes: Note[]): Promise<RelatedNotes> {
    const sourceNote = allNotes.find(n => n.id === noteId);
    if (!sourceNote) {
      return {
        sourceNoteId: noteId,
        relatedNotes: [],
        totalConnections: 0,
        analysisTime: 0.1
      };
    }

    const relatedNotes: RelatedNote[] = [];
    
    // Find related notes based on content similarity
    for (const note of allNotes) {
      if (note.id === noteId) continue;
      
      const similarity = this.calculateSimilarity(sourceNote, note);
      if (similarity > 0.3) {
        relatedNotes.push({
          noteId: note.id,
          similarityScore: similarity,
          connectionType: 'content-similarity',
          sharedConcepts: this.findSharedConcepts(sourceNote, note),
          explanation: `Notes share ${Math.round(similarity * 100)}% content similarity`
        });
      }
    }

    // Sort by similarity score
    relatedNotes.sort((a, b) => b.similarityScore - a.similarityScore);

    return {
      sourceNoteId: noteId,
      relatedNotes: relatedNotes.slice(0, 10), // Top 10 related notes
      totalConnections: relatedNotes.length,
      analysisTime: 0.25
    };
  }

  async createKnowledgeGraph(notes: Note[]): Promise<KnowledgeGraph> {
    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];

    // Create nodes for each note
    notes.forEach(note => {
      nodes.push({
        id: note.id,
        type: 'note',
        label: note.title,
        category: note.category || 'uncategorized',
        properties: {
          wordCount: note.content.split(' ').length,
          createdAt: note.createdAt
        }
      });
    });

    // Create concept nodes
    const concepts = this.extractConcepts(notes);
    concepts.forEach((noteIds, concept) => {
      if (noteIds.length > 1) { // Only create concept nodes if shared by multiple notes
        const conceptId = `concept_${concept}`;
        nodes.push({
          id: conceptId,
          type: 'concept',
          label: concept,
          category: 'concept',
          properties: {
            frequency: noteIds.length
          }
        });

        // Create edges from concept to notes
        noteIds.forEach(noteId => {
          edges.push({
            from: conceptId,
            to: noteId,
            weight: 0.7,
            type: 'contains-concept'
          });
        });
      }
    });

    // Create similarity edges between notes
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const similarity = this.calculateSimilarity(notes[i], notes[j]);
        if (similarity > 0.5) {
          edges.push({
            from: notes[i].id,
            to: notes[j].id,
            weight: similarity,
            type: 'similarity'
          });
        }
      }
    }

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        density: edges.length / (nodes.length * (nodes.length - 1) / 2),
        clusters: this.estimateClusters(nodes, edges),
        lastGenerated: new Date().toISOString()
      }
    };
  }

  async mapConcepts(notes: Note[]): Promise<Record<string, string[]>> {
    const conceptMap: Record<string, string[]> = {};
    
    const concepts = this.extractConcepts(notes);
    
    concepts.forEach((noteIds, concept) => {
      conceptMap[concept] = noteIds;
    });

    return conceptMap;
  }

  private calculateSimilarity(note1: Note, note2: Note): number {
    const words1 = this.extractWords(note1.content);
    const words2 = this.extractWords(note2.content);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    // Jaccard similarity
    return intersection.length / union.length;
  }

  private findSharedConcepts(note1: Note, note2: Note): string[] {
    const concepts1 = this.extractKeywords(note1.content);
    const concepts2 = this.extractKeywords(note2.content);
    
    return concepts1.filter(concept => concepts2.includes(concept));
  }

  private extractConcepts(notes: Note[]): Map<string, string[]> {
    const concepts = new Map<string, string[]>();
    
    notes.forEach(note => {
      const keywords = this.extractKeywords(note.content);
      
      keywords.forEach(keyword => {
        if (!concepts.has(keyword)) {
          concepts.set(keyword, []);
        }
        concepts.get(keyword)!.push(note.id);
      });
    });
    
    return concepts;
  }

  private extractWords(content: string): string[] {
    return content.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
  }

  private extractKeywords(content: string): string[] {
    const words = this.extractWords(content);
    
    // Simple frequency-based keyword extraction
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
    
    return Array.from(wordCounts.entries())
      .filter(([, count]) => count >= 2) // Words that appear at least twice
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ];
    return stopWords.includes(word);
  }

  private estimateClusters(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): number {
    // Simple cluster estimation based on connected components
    const visited = new Set<string>();
    let clusters = 0;
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        this.dfsVisit(node.id, edges, visited);
        clusters++;
      }
    });
    
    return clusters;
  }

  private dfsVisit(nodeId: string, edges: KnowledgeEdge[], visited: Set<string>): void {
    visited.add(nodeId);
    
    edges.forEach(edge => {
      if (edge.from === nodeId && !visited.has(edge.to)) {
        this.dfsVisit(edge.to, edges, visited);
      }
      if (edge.to === nodeId && !visited.has(edge.from)) {
        this.dfsVisit(edge.from, edges, visited);
      }
    });
  }
} 