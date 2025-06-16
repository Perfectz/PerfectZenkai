import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { AlertTriangle, RefreshCw, CheckCircle, Info } from 'lucide-react'
import { useWeightStore } from '../store'
import { useWeightActions } from '../hooks/useWeightActions'
import { WeightEntry, kgToLbs, lbsToKg } from '../types'

interface ConversionCandidate {
  entry: WeightEntry
  currentDisplayLbs: number
  suggestedLbs: number
  needsConversion: boolean
}

export function WeightConversionTool() {
  const { weights } = useWeightStore()
  const { updateWeight } = useWeightActions()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [candidates, setCandidates] = useState<ConversionCandidate[]>([])
  const [showTool, setShowTool] = useState(false)

  const analyzeEntries = () => {
    setIsAnalyzing(true)
    
    // Analyze entries to find potential kg values stored as lbs
    const conversionCandidates: ConversionCandidate[] = weights.map(entry => {
      const currentDisplayLbs = kgToLbs(entry.kg)
      
      // If the stored kg value is suspiciously high (likely entered as lbs)
      // Typical adult weight ranges: 40-200kg (88-440lbs)
      // If stored kg > 200, it's likely lbs entered as kg
      const needsConversion = entry.kg > 200 || (entry.kg > 100 && entry.kg < 200 && entry.kg % 1 !== 0)
      const suggestedLbs = needsConversion ? entry.kg : currentDisplayLbs
      
      return {
        entry,
        currentDisplayLbs,
        suggestedLbs,
        needsConversion
      }
    }).filter(candidate => candidate.needsConversion)

    setCandidates(conversionCandidates)
    setIsAnalyzing(false)
  }

  const convertEntry = async (candidate: ConversionCandidate) => {
    try {
      // Convert the stored kg value (which was likely entered as lbs) to proper kg
      const correctKg = lbsToKg(candidate.suggestedLbs)
      await updateWeight(candidate.entry.id, { kg: correctKg })
      
      // Remove from candidates list
      setCandidates(prev => prev.filter(c => c.entry.id !== candidate.entry.id))
    } catch (error) {
      console.error('Failed to convert entry:', error)
    }
  }

  const convertAllEntries = async () => {
    setIsConverting(true)
    
    try {
      for (const candidate of candidates) {
        await convertEntry(candidate)
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Failed to convert entries:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const formatDate = (dateISO: string) => {
    return new Date(dateISO).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (!showTool) {
    return (
      <Card className="cyber-card border-yellow-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-yellow-400" />
              <div>
                <h3 className="font-medium text-yellow-400">Weight Unit Conversion</h3>
                <p className="text-sm text-gray-400">
                  Check if any entries need kg → lbs conversion
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTool(true)}
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
              Check Entries
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cyber-card border-yellow-500/50">
      <CardHeader>
        <CardTitle className="cyber-subtitle flex items-center gap-2 text-yellow-400">
          <RefreshCw className="cyber-icon h-5 w-5" />
          Weight Conversion Tool
        </CardTitle>
        <p className="text-sm text-gray-400">
          This tool helps fix weight entries that may have been entered in the wrong unit.
          If you previously entered weights in pounds but they were stored as kilograms, this will correct them.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {candidates.length === 0 && !isAnalyzing && (
          <div className="text-center py-6">
            <Button
              onClick={analyzeEntries}
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              disabled={isAnalyzing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Entries'}
            </Button>
          </div>
        )}

        {candidates.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">
                  Found {candidates.length} entries that may need conversion
                </span>
              </div>
              <Button
                onClick={convertAllEntries}
                variant="cyber-ki"
                size="sm"
                disabled={isConverting}
              >
                {isConverting ? 'Converting...' : 'Convert All'}
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {candidates.map((candidate) => (
                <div
                  key={candidate.entry.id}
                  className="cyber-card bg-gray-900/50 p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-mono text-gray-300">
                          {formatDate(candidate.entry.dateISO)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-red-400 border-red-500/50">
                            Current: {candidate.currentDisplayLbs.toFixed(1)}lbs
                          </Badge>
                          <span className="text-gray-500">→</span>
                          <Badge variant="outline" className="text-ki-green border-ki-green/50">
                            Fixed: {candidate.suggestedLbs.toFixed(1)}lbs
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => convertEntry(candidate)}
                      variant="outline"
                      size="sm"
                      className="border-ki-green/50 text-ki-green hover:bg-ki-green/10"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Fix
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {candidates.length === 0 && isAnalyzing && (
          <div className="text-center py-6">
            <RefreshCw className="h-8 w-8 animate-spin text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Analyzing weight entries...</p>
          </div>
        )}

        {candidates.length === 0 && !isAnalyzing && weights.length > 0 && (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-ki-green mx-auto mb-2" />
            <p className="text-sm text-ki-green font-medium">All entries look correct!</p>
            <p className="text-xs text-gray-400 mt-1">No conversion needed</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTool(false)}
            className="text-gray-400 hover:bg-gray-800"
          >
            Hide Tool
          </Button>
          <div className="text-xs text-gray-500">
            {weights.length} total entries • {candidates.length} need conversion
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 