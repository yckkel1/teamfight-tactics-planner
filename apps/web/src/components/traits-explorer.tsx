'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTraits } from '@/lib/api'
import { TraitCard } from './trait-card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Search, Filter } from 'lucide-react'

export function TraitsExplorer() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Debounce search to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Use useCallback to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['traits', { search: debouncedSearch, limit: 100 }],
    queryFn: () => fetchTraits({ search: debouncedSearch, limit: 100 })
  })

  // Memoize filtered traits to prevent unnecessary re-renders
  const filteredTraits = useMemo(() => {
    return data?.items?.filter((trait: any) => {
      if (categoryFilter && trait.category !== categoryFilter) return false
      return true
    }) || []
  }, [data?.items, categoryFilter])

  const categories = ['Class', 'Origin']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load traits</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Traits Explorer</h1>
        <p className="text-muted-foreground">
          Discover Set 15 traits and their champion compositions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search traits..."
            value={search}
            onChange={handleSearchChange}
            className="pl-10"
            // Prevent re-render from losing focus
            key="search-input"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            <Badge
              variant={categoryFilter === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryFilter(null)}
            >
              All
            </Badge>
            {categories.map(category => (
              <Badge
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTraits.length} trait{filteredTraits.length !== 1 ? 's' : ''}
      </div>

      {/* Traits Grid */}
      <div className="grid gap-4 md:gap-6">
        {filteredTraits.map((trait: any) => (
          <TraitCard key={trait.name} trait={trait} />
        ))}
      </div>

      {filteredTraits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No traits found matching your criteria</p>
        </div>
      )}
    </div>
  )
}