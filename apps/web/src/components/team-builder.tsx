'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchUnits, fetchTraits } from '@/lib/api'
import { X, Users, Save, Trash2 } from 'lucide-react'

// Add type imports
interface Unit {
  id: string
  name: string
  cost: number
  traits: Array<{
    name: string
    category: "Class" | "Origin" | null
  }>
}

interface Trait {
  name: string
  category: "Class" | "Origin" | null
  unitCount: number
  tiers: Array<{
    minUnits: number
    note?: string | null
  }>
}

const COST_COLORS: Record<number, string> = {
  1: 'bg-gray-500',
  2: 'bg-green-500',
  3: 'bg-blue-500',
  4: 'bg-purple-500',
  5: 'bg-yellow-500'
}

const BOARD_POSITIONS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  row: Math.floor(i / 7) + 1,
  col: i % 7
}))

export function TeamBuilder() {
  const [board, setBoard] = useState<Record<number, Unit>>({})
  const [draggedUnit, setDraggedUnit] = useState<(Unit & { fromPosition?: number }) | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null)
  const [teamName, setTeamName] = useState('My Team Comp')

  // Fetch units from API
  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', { limit: 100 }],
    queryFn: () => fetchUnits({ limit: 100 })
  })

  // Fetch traits with tiers from API
  const { data: traitsData, isLoading: traitsLoading } = useQuery({
    queryKey: ['traits', { limit: 100 }],
    queryFn: () => fetchTraits({ limit: 100 })
  })

  const allUnits = (unitsData?.items || []) as Unit[]
  const allTraits = (traitsData?.items || []) as Trait[]

  // Build trait tiers map from API data
  const traitTiers = useMemo(() => {
    const map: Record<string, number[]> = {}
    allTraits.forEach((trait: Trait) => {
      if (trait.tiers && trait.tiers.length > 0) {
        map[trait.name] = trait.tiers.map(t => t.minUnits).sort((a, b) => a - b)
      }
    })
    return map
  }, [allTraits])

  // Calculate active traits using API data
  const activeTraits = useMemo(() => {
    const traitCounts: Record<string, number> = {}
    Object.values(board).forEach(unit => {
      unit.traits.forEach(trait => {
        traitCounts[trait.name] = (traitCounts[trait.name] || 0) + 1
      })
    })

    const result: Record<string, { count: number; activeTier: number | null; tiers: number[] }> = {}
    Object.entries(traitCounts).forEach(([traitName, count]) => {
      const tiers = traitTiers[traitName] || []
      let activeTier: number | null = null
      for (let i = tiers.length - 1; i >= 0; i--) {
        if (count >= tiers[i]) {
          activeTier = i
          break
        }
      }
      result[traitName] = { count, activeTier, tiers }
    })
    return result
  }, [board, traitTiers])

  const placedUnitIds = new Set(Object.values(board).map(u => u.id))
  const availableUnits = allUnits.filter(u => !placedUnitIds.has(u.id))

  const unitsByCost = useMemo(() => {
    const groups: Record<number, Unit[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
    availableUnits.forEach(unit => {
      groups[unit.cost].push(unit)
    })
    return groups
  }, [availableUnits])

  // Loading state
  if (unitsLoading || traitsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleDragStart = (unit: Unit) => {
    setDraggedUnit(unit)
  }

  const handleDragOver = (e: React.DragEvent, positionId: number) => {
    e.preventDefault()
    if (!board[positionId]) {
      setDragOverPosition(positionId)
    }
  }

  const handleDragLeave = () => {
    setDragOverPosition(null)
  }

  const handleDrop = (e: React.DragEvent, positionId: number) => {
    e.preventDefault()
    if (Object.keys(board).length >= 15 && !board[positionId]) return
    
    if (draggedUnit && !board[positionId]) {
      setBoard(prev => ({ ...prev, [positionId]: draggedUnit }))
    }
    setDraggedUnit(null)
    setDragOverPosition(null)
  }

  const handleUnitClick = (unit: Unit) => {
    if (Object.keys(board).length >= 15) return
    
    const emptyPosition = BOARD_POSITIONS.find(pos => !board[pos.id])
    if (emptyPosition) {
      setBoard(prev => ({ ...prev, [emptyPosition.id]: unit }))
    }
  }

  const handleRemoveUnit = (positionId: number) => {
    setBoard(prev => {
      const newBoard = { ...prev }
      delete newBoard[positionId]
      return newBoard
    })
  }

  const handleBoardUnitDragStart = (positionId: number) => {
    setDraggedUnit({ ...board[positionId], fromPosition: positionId })
  }

  const handleBoardDrop = (e: React.DragEvent, targetPositionId: number) => {
    e.preventDefault()
    if (draggedUnit && draggedUnit.fromPosition !== undefined) {
      if (!board[targetPositionId] || board[targetPositionId].id === draggedUnit.id) {
        setBoard(prev => {
          const newBoard = { ...prev }
          delete newBoard[draggedUnit.fromPosition!]
          newBoard[targetPositionId] = { 
            id: draggedUnit.id, 
            name: draggedUnit.name, 
            cost: draggedUnit.cost, 
            traits: draggedUnit.traits 
          }
          return newBoard
        })
      }
    } else if (draggedUnit) {
      if (Object.keys(board).length >= 15 && !board[targetPositionId]) return
      
      if (!board[targetPositionId]) {
        setBoard(prev => ({ ...prev, [targetPositionId]: draggedUnit }))
      }
    }
    setDraggedUnit(null)
    setDragOverPosition(null)
  }

  const getCategoryColor = (trait: string) => {
    const classes = ['Bastion', 'Duelist', 'Edgelord', 'Executioner', 'Heavyweight', 'Juggernaut', 'Prodigy', 'Protector', 'Sniper', 'Sorcerer', 'Strategist']
    return classes.includes(trait) ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
  }

  const handleSaveTeam = () => {
    const teamData = {
      name: teamName,
      slots: Object.entries(board).map(([position, unit]) => ({
        position: parseInt(position),
        unitId: unit.id,
        items: []
      })),
      activeTraits: activeTraits
    }
    console.log('Saving team:', teamData)
    alert('Team saved! (Check console for data)')
  }

  const handleClearBoard = () => {
    if (Object.keys(board).length > 0 && confirm('Clear all units from the board?')) {
      setBoard({})
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Active Traits */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-bold">Active Traits</h2>
            <span className={`ml-auto text-sm font-semibold ${Object.keys(board).length >= 15 ? 'text-red-500' : 'text-gray-500'}`}>
              {Object.keys(board).length}/15
            </span>
          </div>

          {Object.keys(activeTraits).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Place units on the board to see active traits
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(activeTraits)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([trait, data]) => (
                  <div key={trait} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getCategoryColor(trait)}`}>
                        {trait}
                      </span>
                      <span className="text-sm font-bold">
                        {data.count}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {data.tiers.map((tier, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-2 rounded ${
                            data.activeTier !== null && idx <= data.activeTier
                              ? 'bg-yellow-500'
                              : 'bg-gray-300'
                          }`}
                          title={`${tier} units`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      {data.tiers.map((tier, idx) => (
                        <span key={idx} className={data.activeTier === idx ? 'font-bold text-yellow-600' : ''}>
                          {tier}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Team Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="text-xl font-bold border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2"
            placeholder="Team Name"
            />
            <button
            onClick={handleClearBoard}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            disabled={Object.keys(board).length === 0}
            >
            <Trash2 className="h-4 w-4" />
            Clear
            </button>
          </div>
          </div>

          {/* Board */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Team Composition Board</h2>
            
            {/* Row labels */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Front Row</span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map(rowNum => (
                <div key={rowNum}>
                  <div className="flex gap-2 justify-center">
                    {BOARD_POSITIONS.filter(pos => pos.row === rowNum).map(pos => (
                      <div
                        key={pos.id}
                        className={`w-20 h-20 flex items-center justify-center rounded-lg border-2 transition-all ${
                          board[pos.id]
                            ? 'bg-gradient-to-br from-gray-50 to-white border-gray-300 shadow-md'
                            : dragOverPosition === pos.id
                            ? 'bg-blue-50 border-blue-500 scale-105'
                            : 'bg-white border-gray-300 border-dashed hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        onDragOver={(e) => handleDragOver(e, pos.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleBoardDrop(e, pos.id)}
                      >
                        {board[pos.id] ? (
                          <div
                            className="relative w-full h-full cursor-move group"
                            draggable
                            onDragStart={() => handleBoardUnitDragStart(pos.id)}
                            onDoubleClick={() => handleRemoveUnit(pos.id)}
                          >
                            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${COST_COLORS[board[pos.id].cost]} flex items-center justify-center text-white text-xs font-bold z-10 shadow-md`}>
                              {board[pos.id].cost}
                            </div>
                            <button
                              onClick={() => handleRemoveUnit(pos.id)}
                              className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center shadow-md"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="flex flex-col items-center justify-center h-full p-1">
                              <div className="text-xs font-bold text-center leading-tight mb-1 text-gray-900">
                                {board[pos.id].name}
                              </div>
                              <div className="flex flex-wrap gap-0.5 justify-center">
                                {board[pos.id].traits.slice(0, 2).map((trait, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${getCategoryColor(trait.name)}`}
                                  >
                                    {trait.name.slice(0, 4)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">
                            {pos.id + 1}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {rowNum === 2 && (
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Back row label */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Back Row</span>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Drag units to the board or click to auto-place. Double-click or use × to remove.
            </p>
          </div>

          {/* Available Units */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Available Champions</h2>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(cost => (
                <div key={cost}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full ${COST_COLORS[cost]} flex items-center justify-center text-white text-sm font-bold`}>
                      {cost}
                    </div>
                    <h3 className="font-semibold text-sm">
                      Cost {cost} ({unitsByCost[cost].length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {unitsByCost[cost].map(unit => (
                      <div
                        key={unit.id}
                        className="bg-white border border-gray-200 rounded-lg p-2 cursor-move hover:shadow-lg hover:scale-105 transition-all hover:border-blue-400"
                        draggable
                        onDragStart={() => handleDragStart(unit)}
                        onClick={() => handleUnitClick(unit)}
                      >
                        <div className="text-xs font-bold text-center mb-1 text-gray-900">
                          {unit.name}
                        </div>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {unit.traits.map((trait, idx) => (
                            <div
                              key={idx}
                              className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${getCategoryColor(trait.name)}`}
                            >
                              {trait.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamBuilder