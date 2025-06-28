"use client"

import React from "react"

const SeatLayout = ({ bus, selectedSeats, onSeatSelect }) => {
  const renderSeat = (seat, index) => {
    const isSelected = selectedSeats.includes(seat.seatNumber)
    const isBooked = seat.isBooked

    let seatClass = "seat"
    if (isBooked) {
      seatClass += " booked"
    } else if (isSelected) {
      seatClass += " selected"
    } else {
      seatClass += " available"
    }

    return (
      <div
        key={seat.seatNumber}
        className={seatClass}
        onClick={() => !isBooked && onSeatSelect(seat.seatNumber)}
        title={`Seat ${seat.seatNumber} - ${isBooked ? "Booked" : "Available"}`}
      >
        {seat.seatNumber.replace("S", "")}
      </div>
    )
  }

  const seatsPerRow = 4
  const rows = []

  for (let i = 0; i < bus.seats.length; i += seatsPerRow) {
    const rowSeats = bus.seats.slice(i, i + seatsPerRow)
    rows.push(rowSeats)
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Select Your Seats</h3>

        {/* Legend */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center">
            <div className="seat available mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="seat selected mr-2"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="seat booked mr-2"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="relative bg-gray-100 rounded-lg p-4">
        {/* Driver Section */}
        <div className="mb-4 text-center">
          <div className="w-16 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
          <span className="text-xs text-gray-500">Driver</span>
        </div>

        {/* Seats Grid */}
        <div className="space-y-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-2">
              {row.map((seat, seatIndex) => (
                <React.Fragment key={seat.seatNumber}>
                  {renderSeat(seat, seatIndex)}
                  {seatIndex === 1 && <div className="w-8"></div>} {/* Aisle */}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Seats:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seatNumber) => (
              <span key={seatNumber} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {seatNumber}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Total: ₹{selectedSeats.length * bus.price}</p>
        </div>
      )}
    </div>
  )
}

export default SeatLayout
