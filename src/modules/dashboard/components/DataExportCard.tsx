import { useState } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Download, Database, CheckCircle, AlertCircle } from 'lucide-react'
import { exportAllData, downloadDataAsFile, getDataSummary, AppDataExport } from '@/shared/utils/dataExport'

export function DataExportCard() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [lastExport, setLastExport] = useState<AppDataExport | null>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportStatus('idle')
      
      const exportData = await exportAllData()
      downloadDataAsFile(exportData)
      
      setLastExport(exportData)
      setExportStatus('success')
      
      // Reset success status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
      
      // Reset error status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const summary = lastExport ? getDataSummary(lastExport) : null

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-sm">Data Backup</h3>
          </div>
          
          {exportStatus === 'success' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {exportStatus === 'error' && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Export all your data as a backup file for future app updates
        </p>

        {summary && (
          <div className="text-xs text-muted-foreground mb-3 space-y-1">
            <div>Last export: {summary.exportDate}</div>
            <div>
              {summary.totalWeights} weights • {summary.totalTasks} tasks • {summary.totalNotes} notes
            </div>
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={isExporting}
          size="sm"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>

        {exportStatus === 'success' && (
          <p className="text-xs text-green-600 mt-2 text-center">
            ✓ Data exported successfully!
          </p>
        )}
        
        {exportStatus === 'error' && (
          <p className="text-xs text-red-600 mt-2 text-center">
            ✗ Export failed. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  )
} 