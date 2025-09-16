// unit-card-with-details.tsx - For trait cards
'use client'

import { useState } from 'react'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { cn } from '@/lib/utils'
import { Sword, Shield, Heart, Zap, Target, Info } from 'lucide-react'

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
  const [showTooltip, setShowTooltip] = useState(false)

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
    
    const hp = Array.isArray(stats.hp) ? stats.hp : [stats.hp, stats.hp, stats.hp]
    const ad = Array.isArray(stats.ad) ? stats.ad : [stats.ad, stats.ad, stats.ad]
    const armor = stats.armor
    const mr = stats.mr
    const attackSpeed = stats.as
    const range = stats.range
    const mana = stats.mana
    
    return { hp, ad, armor, mr, attackSpeed, range, mana }
  }

  const baseStats = formatStats(unit.baseStats)

  return (
    <div className="relative">
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group",
          "bg-background hover:bg-muted/50 relative",
          className
        )}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm truncate flex-1">
              {unit.name}
            </span>
            <div className="flex items-center gap-1">
              {unit.ability && (
                <Info className="h-3 w-3 text-blue-500 opacity-60 group-hover:opacity-100" />
              )}
              <Badge 
                className={cn(
                  "h-6 w-6 p-0 rounded-full text-xs flex items-center justify-center text-white font-bold",
                  getCostColor(unit.cost)
                )}
              >
                {unit.cost}
              </Badge>
            </div>
          </div>
          
          {/* Role */}
          {unit.role && (
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              {unit.role}
            </div>
          )}
          
          {/* Traits */}
          <div className="flex flex-wrap gap-1 mb-1">
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

          {/* Ability name and quick stats */}
          <div className="flex items-center justify-between text-xs">
            {unit.ability?.name && (
              <div className="text-primary font-medium truncate flex-1">
                {unit.ability.name}
              </div>
            )}
            {baseStats && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-400" />
                  {baseStats.hp[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Sword className="h-3 w-3 text-orange-400" />
                  {baseStats.ad[0]}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Tooltip */}
      {showTooltip && (
        <div className="fixed z-[9999] pointer-events-none" 
             style={{
               left: '50%',
               top: '20px',
               transform: 'translateX(-50%)'
             }}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 w-[350px] max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{unit.name}</h3>
                {unit.role && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{unit.role}</p>
                )}
              </div>
              <Badge 
                className={cn(
                  "h-8 w-8 p-0 rounded-full text-sm flex items-center justify-center text-white font-bold",
                  getCostColor(unit.cost)
                )}
              >
                {unit.cost}
              </Badge>
            </div>

            {/* Traits */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">TRAITS</div>
              <div className="flex flex-wrap gap-1">
                {unit.traits.map((trait) => (
                  <Badge 
                    key={trait.name} 
                    variant={trait.category === 'Class' ? 'class' : 'origin'}
                    className="text-xs"
                  >
                    {trait.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Base Stats */}
            {baseStats && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">BASE STATS</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">Health</span>
                      </div>
                      <span className="font-mono text-xs">{baseStats.hp.join(' / ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Sword className="h-3 w-3 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-400">Attack</span>
                      </div>
                      <span className="font-mono text-xs">{baseStats.ad.join(' / ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Range</span>
                      </div>
                      <span className="font-mono text-xs">{baseStats.range}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">Armor</span>
                      </div>
                      <span className="font-mono text-xs">{baseStats.armor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-purple-500" />
                        <span className="text-gray-600 dark:text-gray-400">Magic Resist</span>
                      </div>
                      <span className="font-mono text-xs">{baseStats.mr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Attack Speed</span>
                      <span className="font-mono text-xs">{baseStats.attackSpeed}</span>
                    </div>
                  </div>
                </div>
                
                {baseStats.mana && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Mana</span>
                      <span className="font-mono text-xs">
                        {baseStats.mana.start} / {baseStats.mana.max}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ability */}
            {unit.ability && (
              <div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">ABILITY</div>
                <div className="space-y-2">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {unit.ability.name}
                  </div>
                  
                  {/* Tags */}
                  {unit.ability.tags && unit.ability.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {unit.ability.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Description */}
                  {unit.ability.text && (
                    <div className="text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded border text-gray-700 dark:text-gray-300">
                      {unit.ability.text}
                    </div>
                  )}
                  
                  {/* Key Stats */}
                  {unit.ability.stats && Object.keys(unit.ability.stats).length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Key Values:</div>
                      <div className="space-y-1">
                        {Object.entries(unit.ability.stats)
                          .slice(0, 6)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="font-mono text-gray-900 dark:text-gray-100">
                                {Array.isArray(value) ? value.join(' / ') : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
