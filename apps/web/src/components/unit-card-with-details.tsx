'use client'

import { useState } from 'react'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { cn } from '@/lib/utils'
import { Sword, Shield, Heart, Zap } from 'lucide-react'

interface Unit {
  id: string
  name: string
  cost: number
  traits: Array<{
    name: string
    category: "Class" | "Origin" | null
  }>
  baseStats: any
  ability: any
  role?: string | null
}

interface UnitCardWithDetailsProps {
  unit: Unit
  className?: string
  onClick?: () => void
}

export function UnitCardWithDetails({ unit, className, onClick }: UnitCardWithDetailsProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getCostColor = (cost: number) => {
    const colors = {
      1: 'bg-gray-500',
      2: 'bg-green-500', 
      3: 'bg-blue-500',
      4: 'bg-purple-500',
      5: 'bg-yellow-500'
    }
    return colors[cost as keyof typeof colors] || 'bg-gray-500'
  }

  const formatStats = (stats: any) => {
    if (!stats || typeof stats !== 'object') return null
    
    // Extract common stats from baseStats
    const hp = Array.isArray(stats.hp) ? stats.hp[0] : stats.hp
    const ad = Array.isArray(stats.ad) ? stats.ad[0] : stats.ad
    const armor = stats.armor
    const mr = stats.mr
    const attackSpeed = stats.as
    const range = stats.range
    
    return { hp, ad, armor, mr, attackSpeed, range }
  }

  const baseStats = formatStats(unit.baseStats)

  return (
    <div className="relative">
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
          "bg-background hover:bg-muted/50",
          className
        )}
        onClick={onClick}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm truncate flex-1">
              {unit.name}
            </span>
            <Badge 
              className={cn(
                "ml-2 h-6 w-6 p-0 rounded-full text-xs flex items-center justify-center text-white font-bold",
                getCostColor(unit.cost)
              )}
            >
              {unit.cost}
            </Badge>
          </div>
          
          {/* Role */}
          {unit.role && (
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              {unit.role}
            </div>
          )}
          
          {/* Traits */}
          <div className="flex flex-wrap gap-1">
            {unit.traits.slice(0, 3).map((trait) => (
              <Badge 
                key={trait.name} 
                variant={trait.category === 'Class' ? 'class' : 'origin'} 
                className="text-xs px-1.5 py-0"
              >
                {trait.name}
              </Badge>
            ))}
            {unit.traits.length > 3 && (
              <span className="text-xs text-muted-foreground">+{unit.traits.length - 3}</span>
            )}
          </div>

          {/* Ability name preview */}
          {unit.ability?.name && (
            <div className="text-xs text-primary font-medium mt-1 truncate">
              {unit.ability.name}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hover Details Tooltip */}
      {showDetails && baseStats && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-card border rounded-lg shadow-lg min-w-[200px]">
          <div className="text-sm font-semibold mb-2">{unit.name}</div>
          
          {/* Base Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              <span>{baseStats.hp}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sword className="h-3 w-3 text-orange-500" />
              <span>{baseStats.ad}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <span>{baseStats.armor}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-purple-500" />
              <span>{baseStats.mr}</span>
            </div>
          </div>

          {/* Range and Attack Speed */}
          <div className="mt-2 text-xs text-muted-foreground">
            Range: {baseStats.range} • AS: {baseStats.attackSpeed}
          </div>

          {/* Ability Preview */}
          {unit.ability?.name && (
            <div className="mt-2 pt-2 border-t">
              <div className="text-xs font-medium text-primary">{unit.ability.name}</div>
              {unit.ability.tags && (
                <div className="text-xs text-muted-foreground mt-1">
                  {unit.ability.tags.slice(0, 3).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}