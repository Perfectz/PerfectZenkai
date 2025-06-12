import { useEffect } from 'react'
import { useWeightStore } from '../store'
import { WeightRow } from '../components/WeightRow'

export default function WeightPage() {
  const { weights, loadWeights, isLoading } = useWeightStore()

  useEffect(() => {
    if (weights.length === 0) {
      loadWeights()
    }
  }, [weights.length, loadWeights])

  return (
    <div className="container mx-auto px-4 pb-24 pt-4">
      <h2 className="text-lg font-semibold mb-4">Weight History</h2>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && weights.length === 0 && (
        <div className="text-center text-muted-foreground mt-20">
          <p className="text-4xl mb-4">📊</p>
          <p>No weights logged yet</p>
          <p className="text-sm">Tap + to add your first</p>
        </div>
      )}

      <div className="space-y-2">
        {weights.map((w) => (
          <WeightRow key={w.id} entry={w} />
        ))}
      </div>
    </div>
  )
} 