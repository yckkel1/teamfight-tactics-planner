'use client'

import { useState } from 'react'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { cn } from '@/lib/utils'
import { Heart, Sword, Shield, Zap, Target, ChevronDown, ChevronRight } from 'lucide-react'

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

interface UnitDetailCardProps {
  unit: Unit
  viewMode: 'grid' | 'list'
}

export function UnitDetailCard({ unit, viewMode }: UnitDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getCostColor = (cost: number) => {
    const colors = {
      1: 'bg-gray-500 border-gray-600',
      2: 'bg-green-500 border-green-600', 
      3: 'bg-blue-500 border-blue-600',
      4: 'bg-purple-500 border-purple-600',
      5: 'bg-yellow-500 border-yellow-600'
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

  if (viewMode === 'list') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader 
          className="pb-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-lg border-2 flex items-center justify-center text-white font-bold",
                getCostColor(unit.cost)
              )}>
                {unit.cost}
              </div>
              
              <div className="space-y-1">
                <CardTitle className="text-lg">{unit.name}</CardTitle>
                {unit.role && (
                  <p className="text-sm text-muted-foreground">{unit.role}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              {baseStats && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{baseStats.hp[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sword className="h-4 w-4 text-orange-500" />
                    <span>{baseStats.ad[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>{baseStats.range}</span>
                  </div>
                </div>
              )}

              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Traits */}
          <div className="flex flex-wrap gap-1 mt-2">
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
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 border-t">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Base Stats */}
              {baseStats && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Base Stats</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>Health</span>
                        </div>
                        <span className="font-mono">{baseStats.hp.join(' / ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sword className="h-4 w-4 text-orange-500" />
                          <span>Attack Damage</span>
                        </div>
                        <span className="font-mono">{baseStats.ad.join(' / ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span>Armor</span>
                        </div>
                        <span className="font-mono">{baseStats.armor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-purple-500" />
                          <span>Magic Resist</span>
                        </div>
                        <span className="font-mono">{baseStats.mr}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span>Attack Speed</span>
                        </div>
                        <span className="font-mono">{baseStats.attackSpeed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Range</span>
                        <span className="font-mono">{baseStats.range}</span>
                      </div>
                    </div>
                  </div>
                  
                  {baseStats.mana && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>Mana</span>
                        <span className="font-mono">
                          {baseStats.mana.start} / {baseStats.mana.max}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ability */}
              {unit.ability && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Ability</h4>
                  <div className="space-y-2">
                    <div className="font-medium text-primary">{unit.ability.name}</div>
                    
                    {unit.ability.tags && (
                      <div className="flex flex-wrap gap-1">
                        {unit.ability.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {unit.ability.text && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {unit.ability.text}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // Grid view (compact)
  return (
    <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base truncate">{unit.name}</CardTitle>
          <Badge 
            className={cn(
              "h-6 w-6 p-0 rounded-full text-xs flex items-center justify-center text-white font-bold",
              getCostColor(unit.cost)
            )}
          >
            {unit.cost}
          </Badge>
        </div>
        
        {unit.role && (
          <p className="text-xs text-muted-foreground">{unit.role}</p>
        )}
        
        {/* Traits */}
        <div className="flex flex-wrap gap-1">
          {unit.traits.slice(0, 2).map((trait) => (
            <Badge 
              key={trait.name} 
              variant={trait.category === 'Class' ? 'class' : 'origin'}
              className="text-xs px-1.5 py-0"
            >
              {trait.name}
            </Badge>
          ))}
          {unit.traits.length > 2 && (
            <span className="text-xs text-muted-foreground">+{unit.traits.length - 2}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Stats */}
        {baseStats && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              <span>{baseStats.hp[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sword className="h-3 w-3 text-orange-500" />
              <span>{baseStats.ad[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <span>{baseStats.armor}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-green-500" />
              <span>{baseStats.range}</span>
            </div>
          </div>
        )}

        {/* Ability name */}
        {unit.ability?.name && (
          <div className="text-xs text-primary font-medium mt-2 truncate">
            {unit.ability.name}
          </div>
        )}
      </CardContent>
    </Card>
  )
}