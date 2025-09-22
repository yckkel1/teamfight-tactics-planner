'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchItems } from '@/lib/api'
import { ItemDetailCard } from './item-detail-card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Search, Filter, Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ItemsExplorer() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('item') // Default to completed items
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [])

  // Fetch items with filters
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['items', { search: debouncedSearch, category: selectedSubCategory || selectedCategory, limit: 200 }],
    queryFn: () => fetchItems({ 
      search: debouncedSearch, 
      category: selectedSubCategory || selectedCategory,
      limit: 200 
    })
  })

  const items = itemsData?.items || []

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (itemsError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load items</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Items</h1>
        <p className="text-muted-foreground">
          Explore all Set 15 items including components, completed items, artifacts, radiant items, and emblems
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10"
              key="items-search-input"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Primary Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <div className="flex gap-1">
                <Badge
                  variant={selectedCategory === 'component' ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategory('component')
                    setSelectedSubCategory(undefined)
                  }}
                >
                  Components
                </Badge>
                <Badge
                  variant={selectedCategory === 'item' ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategory('item')
                    setSelectedSubCategory(undefined)
                  }}
                >
                  Items
                </Badge>
                <Badge
                  variant={selectedCategory === 'emblem' ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategory('emblem')
                    setSelectedSubCategory(undefined)
                  }}
                >
                  Emblems
                </Badge>
              </div>
            </div>

            {/* Secondary Filter for Items */}
            {selectedCategory === 'item' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <div className="flex gap-1">
                  <Badge
                    variant={!selectedSubCategory ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedSubCategory(undefined)}
                  >
                    Completed
                  </Badge>
                  <Badge
                    variant={selectedSubCategory === 'artifact' ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedSubCategory('artifact')}
                  >
                    Artifact
                  </Badge>
                  <Badge
                    variant={selectedSubCategory === 'radiant' ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedSubCategory('radiant')}
                  >
                    Radiant
                  </Badge>
                </div>
              </div>
            )}

            {/* View Mode */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium">View:</span>
              <div className="flex border rounded-md">
                <button
                  className={cn(
                    "p-2 rounded-l-md transition-colors",
                    viewMode === 'grid' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  className={cn(
                    "p-2 rounded-r-md transition-colors",
                    viewMode === 'list' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {items.length} item{items.length !== 1 ? 's' : ''}
      </div>

      {/* Items Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-4"
      )}>
        {items.map((item: any) => (
          <ItemDetailCard
            key={item.slug}
            item={item}
            viewMode={viewMode}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found matching your criteria</p>
        </div>
      )}
    </div>
  )
}