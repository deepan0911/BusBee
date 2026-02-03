"use client"

import React from "react"
import { Disc } from "lucide-react"

const SeatLayout = ({ bus, selectedSeats, onSeatSelect, onProceed }) => {
  // CRITICAL: Use the exact layoutConfig saved by the operator - no defaults!
  // If layoutConfig is missing, this means the bus was created incorrectly
  if (!bus.layoutConfig) {
    console.error("Bus missing layoutConfig! This bus was not properly configured by the operator.")
  }

  const config = bus.layoutConfig || {
    rows: 10,
    colsLeft: 2,
    colsRight: 2,
    upperDeck: bus.seats?.some(s => s.deck === 'upper') || false
  }

  // CRITICAL: Use the exact seats array saved by the operator
  const seats = bus.seats || []

  // Filter seats by deck - ensure we preserve the exact deck assignments
  const lowerSeats = seats.filter(s => s.deck === 'lower' || (!s.deck && s.deck !== 'upper'))
  const upperSeats = seats.filter(s => s.deck === 'upper')

  const renderSideGrid = (deckSeats, side) => {
    const isLeft = side === 'left'
    const cols = isLeft ? config.colsLeft : config.colsRight
    // CRITICAL: Column calculation must match exactly how operator saved seats
    // Left side: cols 0 to (colsLeft-1)
    // Right side: cols colsLeft to (colsLeft+colsRight-1)
    const startCol = isLeft ? 0 : config.colsLeft
    const rows = config.rows
    const gridItems = []
    const skipMap = new Set()

    // CRITICAL: Iterate through grid positions exactly as operator designed
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Calculate the actual column index that matches the operator's saved seat positions
        const actualCol = startCol + c
        if (skipMap.has(`${r}-${c}`)) continue

        // CRITICAL: Find seat by exact row and col match - this must match operator's saved data
        const seat = deckSeats.find(s => s.row === r && s.col === actualCol)
        const isSleeper = seat?.type === 'sleeper'

        // Handle sleeper seats that span 2 rows
        if (isSleeper) {
          skipMap.add(`${r + 1}-${c}`)
        }

        const isSelected = seat ? selectedSeats.includes(seat.seatNumber) : false
        const isBooked = seat?.isBooked || false

        gridItems.push(
          <div
            key={`${r}-${actualCol}`}
            onClick={() => seat && !isBooked && onSeatSelect(seat.seatNumber)}
            className={`
              relative border rounded-md flex flex-col items-center justify-center transition-all duration-200
              ${isSleeper ? 'row-span-2 h-full' : 'h-10'}
              ${!seat ? 'border-dashed border-gray-200 bg-gray-50' : ''}
              ${isBooked ? 'bg-red-50 border-red-200 cursor-not-allowed grayscale' :
                isSelected ? 'bg-blue-600 border-blue-800 shadow-md ring-2 ring-blue-100' :
                  seat?.type === 'seater' ? 'bg-[#dcfce7] border-[#22c55e] hover:shadow-md cursor-pointer' :
                    seat?.type === 'sleeper' ? 'bg-[#f3e8ff] border-[#a855f7] hover:shadow-md cursor-pointer' : ''}
            `}
            style={{ width: '2.5rem' }}
          >
            {seat && (
              <div className="flex flex-col items-center justify-center h-full gap-0.5">
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {seat.seatNumber.replace('S', '')}
                </span>
                <span className={`text-[10px] font-semibold leading-none ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {seat.type === 'sleeper' ? (bus.priceSleeper || bus.price) : (bus.priceSeater || bus.price)}
                </span>
              </div>
            )}
          </div>
        )
      }
    }

    return (
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 2.5rem)`,
          gridAutoRows: '2.5rem'
        }}
      >
        {gridItems}
      </div>
    )
  }

  const renderDeck = (deckSeats, deckName) => {
    return (
      <div className="flex flex-col items-center">
        <h5 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
          {deckName} Deck
        </h5>

        <div className="bg-white border-2 border-gray-300 rounded-[3rem] p-5 relative shadow-xl min-h-[400px]">
          {/* Driver Indicator (LOWER ONLY) */}
          {deckName === 'Lower' && (
            <div className="absolute top-5 right-5 text-gray-400 flex flex-col items-center z-10">
              <div className="border-[3px] border-gray-400 rounded-full p-1.5 mb-1 bg-gray-50">
                <Disc className="w-4 h-4 rotate-90 text-gray-600" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Driver</span>
            </div>
          )}

          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-300 uppercase tracking-widest font-bold border-b border-gray-100 pb-1 w-20 text-center">Front</div>

          <div className="flex gap-5 mt-14 px-2">
            {renderSideGrid(deckSeats, 'left')}

            {/* Aisle */}
            <div className="flex items-center justify-center w-8 text-gray-200">
              <span className="text-[10px] font-bold rotate-90 whitespace-nowrap tracking-[0.5em]">
                AISLE
              </span>
            </div>

            {renderSideGrid(deckSeats, 'right')}
          </div>

          {/* No Rear End label in operator panel image effectively */}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-32">
        <div className="mb-10 text-center">
          <h3 className="text-2xl font-black text-gray-800">Select Seats</h3>

          {/* Designer-Style Legend */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#dcfce7] border border-[#22c55e]"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Seater (₹{bus.priceSeater || bus.price})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#f3e8ff] border border-[#a855f7]"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Sleeper (₹{bus.priceSleeper || bus.price})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-600 border border-blue-800 shadow-sm shadow-blue-100"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-200 grayscale opacity-60"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Booked</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-start gap-12 overflow-x-auto pb-4 custom-scrollbar">
          {renderDeck(lowerSeats, "Lower")}
          {config.upperDeck && renderDeck(upperSeats, "Upper")}
        </div>
      </div>

      {/* Sticky Bottom Footer - Full Width White Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50 animate-slideUp">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

            <div className="flex-1 w-full md:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Selected Seats ({selectedSeats.length})</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seatId => {
                  const seatObj = bus.seats.find(s => s.seatNumber === seatId)
                  const price = seatObj?.type === 'sleeper' ? (bus.priceSleeper || bus.price) : (bus.priceSeater || bus.price)
                  return (
                    <div key={seatId} className="flex items-center bg-gray-50 rounded border border-gray-200 overflow-hidden">
                      <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-black border-r border-gray-200 min-w-[2.5rem] text-center">
                        {seatId}
                      </div>
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-500">
                        ₹{price}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Total Payable</p>
                <div className="flex items-baseline gap-1 md:justify-end">
                  <span className="text-lg text-gray-400 font-medium">₹</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    {selectedSeats.reduce((total, seatId) => {
                      const seatObj = bus.seats.find(s => s.seatNumber === seatId)
                      const price = seatObj?.type === 'sleeper' ? (bus.priceSleeper || bus.price) : (bus.priceSeater || bus.price)
                      return total + price
                    }, 0)}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceed} // Use the new prop
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Proceed to Book
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default SeatLayout
