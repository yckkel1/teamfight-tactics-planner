'use client'

import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { cn } from '@/lib/utils'
import { Package, Star, Sword, Shield, Sparkles } from 'lucide-react'

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
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT SIDE */}
            <div>
              {/* Header section */}
              <div className="flex items-center gap-4 mb-4">
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

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
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

              {/* Stats */}
              {Object.keys(getDisplayStats()).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Stats</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(getDisplayStats()).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{formatStatName(key)}</span>
                        <span className="font-mono text-xs">{formatStatValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Components */}
              {item.components && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Components</h4>
                  <div className="flex gap-1 flex-wrap">
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
                  <Badge variant="class" className="text-xs">{item.grants_trait}</Badge>
                </div>
              )}
            </div>

            {/* RIGHT SIDE - Description aligned with header */}
            <div className="pt-2">
              {getDisplayText() && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Description</h4>
                  <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-md">
                    {getDisplayText()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 h-full">
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

      <CardContent className="pt-0 space-y-3 flex-1">
        {getDisplayText() && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</h5>
            <div className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-2 rounded">
              {getDisplayText()}
            </div>
          </div>
        )}

        {Object.keys(getDisplayStats()).length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Stats</h5>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {Object.entries(getDisplayStats()).slice(0, 4).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{formatStatName(key)}</span>
                  <span className="font-mono text-right">{formatStatValue(key, value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.components && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Components</h5>
            <div className="flex gap-1 flex-wrap">
              {item.components.map((comp) => (
                <Badge key={comp} variant="secondary" className="text-xs">
                  {comp.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.grants_trait && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Grants Trait</h5>
            <Badge variant="class" className="text-xs">{item.grants_trait}</Badge>
          </div>
        )}

        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Recommended For</h5>
          <div className="text-xs text-muted-foreground italic">
            Coming soon...
          </div>
        </div>

        {item.kind === 'component' && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Builds Into</h5>
            <div className="text-xs text-muted-foreground italic">
              Coming soon...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}