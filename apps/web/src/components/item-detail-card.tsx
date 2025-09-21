'use client'

import { useState } from 'react'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { cn } from '@/lib/utils'
import { Package, Star, Sword, Shield, Heart, Zap, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'

interface Item {
  slug: string
  name: string
  kind: 'component' | 'item' | 'artifact' | 'radiant' | 'emblem'
  tags: string[]
  stats?: Record<string, number | string | boolean>
  stats_overrides?: Record<string, number | string | boolean>
  text?: string
  text_overrides?: string
  components?: string[]
  base_slug?: string
  grants_trait?: string
  unique?: boolean
}

interface ItemDetailCardProps {
  item: Item
  viewMode: 'grid' | 'list'
}

export function ItemDetailCard({ item, viewMode }: ItemDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getCategoryColor = (kind: string) => {
    const colors = {
      component: 'bg-gray-500 border-gray-600',
      item: 'bg-blue-500 border-blue-600',
      artifact: 'bg-purple-500 border-purple-600',
      radiant: 'bg-yellow-500 border-yellow-600',
      emblem: 'bg-green-500 border-green-600'
    }
    return colors[kind as keyof typeof colors] || 'bg-gray-500'
  }

  const getCategoryIcon = (kind: string) => {
    switch (kind) {
      case 'component': return <Package className="h-3 w-3" />
      case 'item': return <Sword className="h-3 w-3" />
      case 'artifact': return <Star className="h-3 w-3" />
      case 'radiant': return <Sparkles className="h-3 w-3" />
      case 'emblem': return <Shield className="h-3 w-3" />
      default: return <Package className="h-3 w-3" />
    }
  }

  const getDisplayStats = () => {
    return item.stats_overrides || item.stats || {}
  }

  const getDisplayText = () => {
    return item.text_overrides || item.text || ''
  }

  const formatStatValue = (key: string, value: number | string | boolean) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'string') return value
    
    // Format numbers with appropriate suffixes
    if (key.endsWith('_pct')) return `${value}%`
    if (key.endsWith('_flat')) return `+${value}`
    if (key.endsWith('_sec')) return `${value}s`
    return `${value}`
  }

  const formatStatName = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Pct$/, '%')
      .replace(/Flat$/, '')
      .replace(/Sec$/, ' (s)')
  }

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
                getCategoryColor(item.kind)
              )}>
                {getCategoryIcon(item.kind)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  {item.unique && (
                    <Badge variant="secondary" className="text-xs">Unique</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{item.kind}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats Preview */}
              {Object.keys(getDisplayStats()).length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {Object.keys(getDisplayStats()).length} stat{Object.keys(getDisplayStats()).length !== 1 ? 's' : ''}
                </div>
              )}

              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 border-t">
            <div className="space-y-4">
              {/* Components */}
              {item.components && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Components</h4>
                  <div className="flex gap-2">
                    {item.components.map((comp) => (
                      <Badge key={comp} variant="secondary" className="text-xs">
                        {comp.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Grants Trait */}
              {item.grants_trait && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Grants Trait</h4>
                  <Badge variant="class" className="text-sm">{item.grants_trait}</Badge>
                </div>
              )}

              {/* Stats */}
              {Object.keys(getDisplayStats()).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(getDisplayStats()).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{formatStatName(key)}</span>
                        <span className="font-mono text-xs">{formatStatValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {getDisplayText() && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Description</h4>
                  <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-md">
                    {getDisplayText()}
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
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base truncate flex-1">{item.name}</CardTitle>
            <div className="flex items-center gap-1">
              {item.unique && (
                <Star className="h-3 w-3 text-yellow-500" />
              )}
              <Badge 
                className={cn(
                  "h-6 w-6 p-0 rounded-full text-xs flex items-center justify-center text-white font-bold",
                  getCategoryColor(item.kind)
                )}
              >
                {getCategoryIcon(item.kind)}
              </Badge>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground capitalize">{item.kind}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline"
                className="text-xs px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Quick Stats */}
          {Object.keys(getDisplayStats()).length > 0 && (
            <div className="text-xs text-muted-foreground">
              {Object.keys(getDisplayStats()).length} stat{Object.keys(getDisplayStats()).length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Components preview */}
          {item.components && (
            <div className="text-xs text-primary font-medium mt-1">
              {item.components.length} component{item.components.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hover overlay for grid view }
      {isHovered && (
        <div className="absolute z-[100] top-0 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[300px]">
          <div className="space-y-3">
            { Header }
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{item.name}</h3>
              <Badge variant="outline" className="text-xs capitalize">{item.kind}</Badge>
            </div>

            { Description }
            {getDisplayText() && (
              <div className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                {getDisplayText()}
              </div>
            )}

            { Stats }
            {Object.keys(getDisplayStats()).length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stats:</div>
                <div className="space-y-1">
                  {Object.entries(getDisplayStats()).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{formatStatName(key)}</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{formatStatValue(key, value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            { Components }
            {item.components && (
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Components:</div>
                <div className="flex gap-1 flex-wrap">
                  {item.components.map((comp) => (
                    <Badge key={comp} variant="secondary" className="text-xs">
                      {comp.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )*/}
    </div>
  )
}