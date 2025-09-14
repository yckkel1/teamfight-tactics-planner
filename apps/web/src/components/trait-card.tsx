'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { UnitCardWithDetails } from './unit-card-with-details'
import { fetchUnits } from '@/lib/api'
import { ChevronDown, ChevronRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Trait {
  name: string
  category: "Class" | "Origin" | null
  unitCount: number
  tiers: Array<{
    minUnits: number
    note?: string
  }>
}

interface TraitCardProps {
  trait: Trait
}

export function TraitCard({ trait }: TraitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const { data: unitsData, isLoading } = useQuery({
    queryKey: ['units', trait.name],
    queryFn: () => fetchUnits({ trait: trait.name, limit: 100 }),
    enabled: isExpanded
  })

  const getCategoryVariant = (category: string | null) => {
    switch (category) {
      case 'Class': return 'class'
      case 'Origin': return 'origin'
      default: return 'default'
    }
  }

  return (
    <Card className="group cursor-pointer overflow-hidden">
      <CardHeader 
        className="pb-3 hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <CardTitle className="text-lg font-bold">{trait.name}</CardTitle>
            </div>
            {trait.category && (
              <Badge variant={getCategoryVariant(trait.category)}>
                {trait.category}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium">{trait.unitCount}</span>
          </div>
        </div>

        {/* Trait Tiers Preview */}
        <div className="flex flex-wrap gap-1 mt-2">
          {trait.tiers.map((tier, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs px-2 py-0.5"
            >
              {tier.minUnits}
              {tier.note && ` (${tier.note})`}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t bg-muted/20">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Champions ({trait.unitCount})
            </h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {unitsData?.items?.map((unit: any) => (
                  <UnitCardWithDetails
                    key={unit.id}
                    unit={unit}
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}