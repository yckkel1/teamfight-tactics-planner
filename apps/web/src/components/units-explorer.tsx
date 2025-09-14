'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchUnits, fetchTraits } from '@/lib/api'
import { UnitDetailCard } from './unit-detail-card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Search, Filter, Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UnitsExplorer() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCost, setSelectedCost] = useState<number | undefined>()
  const [selectedTrait, setSelectedTrait] = useState<string | undefined>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [])

  // Fetch units with filters
  const { data: unitsData, isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ['units', { search: debouncedSearch, cost: selectedCost, trait: selectedTrait, limit: 100 }],
    queryFn: () => fetchUnits({ 
      search: debouncedSearch, 
      cost: selectedCost, 
      trait: selectedTrait, 
      limit: 100 
    })
  })

  // Fetch traits for filter dropdown
  const { data: traitsData } = useQuery({
    queryKey: ['traits', { limit: 100 }],
    queryFn: () => fetchTraits({ limit: 100 })
  })

  const units = unitsData?.items || []
  const traits = traitsData?.items || []

  if (unitsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (unitsError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load units</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Champions</h1>
        <p className="text-muted-foreground">
          Explore all Set 15 champions with detailed stats and abilities
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
              placeholder="Search champions..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10"
              key="units-search-input"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Cost Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Cost:</span>
              <div className="flex gap-1">
                <Badge
                  variant={selectedCost === undefined ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCost(undefined)}
                >
                  All
                </Badge>
                {[1, 2, 3, 4, 5].map(cost => (
                  <Badge
                    key={cost}
                    variant={selectedCost === cost ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCost(cost)}
                  >
                    {cost}★
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trait Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Trait:</span>
              <div className="flex gap-1 flex-wrap">
                <Badge
                  variant={selectedTrait === undefined ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTrait(undefined)}
                >
                  All
                </Badge>
                {traits.slice(0, 8).map((trait: any) => (
                  <Badge
                    key={trait.name}
                    variant={selectedTrait === trait.name ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTrait(trait.name)}
                  >
                    {trait.name}
                  </Badge>
                ))}
              </div>
            </div>

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
        Showing {units.length} champion{units.length !== 1 ? 's' : ''}
      </div>

      {/* Units Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-4"
      )}>
        {units.map((unit: any) => (
          <UnitDetailCard
            key={unit.id}
            unit={unit}
            viewMode={viewMode}
          />
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No champions found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
