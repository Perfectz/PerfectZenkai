// src/modules/notes/types/notes-knowledge.types.ts

// === CORE NOTE TYPES ===
export interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  userId?: string
  attachments?: NoteAttachment[]
  metadata?: NoteMetadata
}

export interface NoteAttachment {
  id: string
  type: 'image' | 'file' | 'link'
  url: string
  name: string
  size?: number
}

export interface NoteMetadata {
  wordCount: number
  readingTime: string
  complexity: 'low' | 'medium' | 'high'
  importance: number
  lastAccessed?: string
}

// === ORGANIZATION TYPES ===
export interface OrganizedNoteStructure {
  categories: Record<string, string[]>
  tags: Record<string, string[]>
  hierarchy: Record<string, any>
  metadata: OrganizationMetadata
}

export interface OrganizationMetadata {
  totalNotes: number
  categoriesCount: number
  tagsCount: number
  organizationScore: number
  lastOrganized?: string
}

export interface NoteHierarchy {
  [key: string]: {
    [subKey: string]: string[]
  }
}

export interface DuplicateNote {
  originalId: string
  duplicateIds: string[]
  similarity: number
  suggestedAction: 'merge' | 'keep-separate' | 'review'
  reasons?: string[]
}

export interface SmartTags {
  [noteId: string]: string[]
}

// === SEARCH TYPES ===
export interface SearchResults {
  results: SearchResult[]
  totalResults: number
  searchTime: number
  query: string
  searchType: 'semantic' | 'contextual' | 'fuzzy' | 'temporal' | 'keyword'
  suggestions?: string[]
}

export interface SearchResult {
  noteId: string
  relevanceScore: number
  matchType: 'semantic' | 'contextual' | 'fuzzy' | 'temporal' | 'exact'
  highlights: string[]
  context: string
  snippet?: string
}

export interface SearchContext {
  userId: string
  currentGoals?: string[]
  recentActivity?: string[]
  timeContext?: string
  preferences?: SearchPreferences
}

export interface SearchPreferences {
  includeArchived?: boolean
  categoryFilter?: string[]
  tagFilter?: string[]
  dateRange?: DateRange
  sortBy?: 'relevance' | 'date' | 'title' | 'category'
}

export interface DateRange {
  start: string
  end: string
}

// === KNOWLEDGE EXTRACTION TYPES ===
export interface KnowledgeInsights {
  keyThemes: string[]
  actionableItems: string[]
  patterns: KnowledgePattern[]
  summary: string
  connections: NoteConnection[]
  metadata: InsightsMetadata
}

export interface KnowledgePattern {
  pattern: string
  frequency: number
  confidence: number
  description: string
  relatedNotes?: string[]
  timeline?: string[]
}

export interface NoteConnection {
  fromNoteId: string
  toNoteId: string
  connectionType: string
  strength: number
  explanation?: string
}

export interface InsightsMetadata {
  totalNotes: number
  analysisTime: number
  confidenceScore: number
  lastAnalyzed?: string
}

export interface NoteSummary {
  overview: string
  keyPoints: string[]
  wordCount: number
  readingTime: string
  complexity: 'low' | 'medium' | 'high'
  topics: string[]
}

export interface ActionableItem {
  noteId: string
  action: string
  priority: 'low' | 'medium' | 'high'
  category: string
  dueDate: string | null
  context: string
  estimatedTime?: string
}

// === CONNECTION MAPPING TYPES ===
export interface RelatedNotes {
  sourceNoteId: string
  relatedNotes: RelatedNote[]
  totalConnections: number
  analysisTime: number
}

export interface RelatedNote {
  noteId: string
  similarityScore: number
  connectionType: string
  sharedConcepts: string[]
  explanation: string
}

export interface KnowledgeSynthesis {
  topic: string
  sourceNotes: string[]
  synthesizedInsights: string[]
  keyConclusions: string[]
  actionRecommendations: string[]
  confidenceScore: number
  novelInsights: string[]
  metadata?: SynthesisMetadata
}

export interface SynthesisMetadata {
  analysisTime: number
  sourceCount: number
  insightQuality: number
  lastSynthesized?: string
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  metadata: GraphMetadata
}

export interface KnowledgeNode {
  id: string
  type: 'note' | 'concept' | 'topic' | 'category'
  label: string
  category: string
  properties?: Record<string, any>
}

export interface KnowledgeEdge {
  from: string
  to: string
  weight: number
  type: string
  properties?: Record<string, any>
}

export interface GraphMetadata {
  totalNodes: number
  totalEdges: number
  density: number
  clusters: number
  lastGenerated?: string
}

// === CHAT INTEGRATION TYPES ===
export interface ChatQuery {
  query: string
  userId: string
  conversationContext?: string
  intent?: QueryIntent
}

export interface QueryIntent {
  type: 'search' | 'organize' | 'extract' | 'synthesize' | 'connect'
  confidence: number
  parameters?: Record<string, any>
}

export interface ChatResponse {
  success: boolean
  message: string
  data?: any
  followUpQuestions?: string[]
  suggestions?: string[]
  error?: string
}

export interface OrganizationSuggestion {
  success: boolean
  message: string
  data: {
    suggestedStructure: Record<string, string[]>
    reasoning: string
    improvements: string[]
  }
}

export interface InsightsSummaryResponse {
  success: boolean
  message: string
  data: {
    insights: {
      keyThemes: string[]
      patterns: string[]
      actionItems: string[]
    }
    visualizations?: Record<string, any>
  }
}

// === AGENT CONTEXT TYPES ===
export interface UserContext {
  userId: string
  preferences?: UserPreferences
  currentGoals?: string[]
  recentActivity?: string[]
  workingContext?: string
}

export interface UserPreferences {
  organizationType?: 'category' | 'topic' | 'priority' | 'timeline'
  searchType?: 'semantic' | 'keyword' | 'fuzzy'
  insightLevel?: 'basic' | 'detailed' | 'comprehensive'
  autoTagging?: boolean
  duplicateHandling?: 'auto-merge' | 'prompt' | 'ignore'
}

// === INTEGRATION TYPES ===
export interface TaskConversion {
  convertedTasks: ConvertedTask[]
  totalConverted: number
  conversionRate: number
  skippedNotes?: string[]
}

export interface ConvertedTask {
  sourceNoteId: string
  taskTitle: string
  category: string
  priority: 'low' | 'medium' | 'high'
  estimatedTime: string
  description?: string
  tags?: string[]
}

export interface TaskConversionOptions {
  autoConvert: boolean
  filterByPriority: 'low' | 'medium' | 'high'
  includeContext?: boolean
  categoryMapping?: Record<string, string>
}

export interface GoalConnection {
  connectedGoals: ConnectedGoal[]
  totalConnections: number
  averageAlignment: number
}

export interface ConnectedGoal {
  goalId: string
  goalTitle: string
  relevantNotes: string[]
  alignmentScore: number
  supportingInsights: string[]
  recommendations?: string[]
}

export interface GoalConnectionOptions {
  userId: string
  activeGoals: string[]
  includeCompleted?: boolean
  alignmentThreshold?: number
}

// === SERVICE INTERFACE TYPES ===
export interface INotesOrganizationEngine {
  categorizeNotes(notes: Note[]): Promise<OrganizedNoteStructure>
  generateTags(notes: Note[]): Promise<SmartTags>
  createHierarchy(notes: Note[], type: string): Promise<NoteHierarchy>
  detectDuplicates(notes: Note[]): Promise<DuplicateNote[]>
  prioritizeNotes(notes: Note[]): Promise<Note[]>
}

export interface ISemanticSearchEngine {
  semanticSearch(query: string, notes: Note[], context?: SearchContext): Promise<SearchResults>
  contextualRanking(query: string, notes: Note[], context: SearchContext): Promise<SearchResults>
  fuzzyMatch(query: string, notes: Note[]): Promise<SearchResults>
  temporalSearch(query: string, timeframe: string, notes: Note[]): Promise<SearchResults>
}

export interface IKnowledgeExtractionEngine {
  extractInsights(notes: Note[]): Promise<KnowledgeInsights>
  identifyPatterns(notes: Note[]): Promise<KnowledgePattern[]>
  generateSummary(notes: Note[]): Promise<NoteSummary>
  extractActionItems(notes: Note[]): Promise<ActionableItem[]>
}

export interface IKnowledgeConnectionEngine {
  findRelatedNotes(noteId: string, allNotes: Note[]): Promise<RelatedNotes>
  createKnowledgeGraph(notes: Note[]): Promise<KnowledgeGraph>
  mapConcepts(notes: Note[]): Promise<Record<string, string[]>>
}

// === AGENT CONFIGURATION TYPES ===
export interface AgentConfiguration {
  organizationEnabled: boolean
  semanticSearchEnabled: boolean
  knowledgeExtractionEnabled: boolean
  connectionMappingEnabled: boolean
  chatIntegrationEnabled: boolean
  performanceMode: 'fast' | 'balanced' | 'comprehensive'
  cacheSettings: CacheSettings
}

export interface CacheSettings {
  enabled: boolean
  ttl: number
  maxSize: number
  strategy: 'lru' | 'fifo' | 'lfu'
}

// === ERROR TYPES ===
export interface NotesKnowledgeError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ValidationError extends NotesKnowledgeError {
  field: string
  value: any
  constraint: string
}

// === ANALYTICS TYPES ===
export interface NotesAnalytics {
  totalNotes: number
  categoryDistribution: Record<string, number>
  tagUsage: Record<string, number>
  creationTrends: Record<string, number>
  searchPatterns: Record<string, number>
  insightGeneration: Record<string, number>
}

export interface PerformanceMetrics {
  searchLatency: number
  organizationTime: number
  insightGenerationTime: number
  cacheHitRate: number
  errorRate: number
}

// === EXPORT AGGREGATION ===
export type NotesKnowledgeTypes = {
  Note: Note
  OrganizedNoteStructure: OrganizedNoteStructure
  SearchResults: SearchResults
  KnowledgeInsights: KnowledgeInsights
  RelatedNotes: RelatedNotes
  KnowledgeSynthesis: KnowledgeSynthesis
  SearchContext: SearchContext
  UserContext: UserContext
  ChatResponse: ChatResponse
} 