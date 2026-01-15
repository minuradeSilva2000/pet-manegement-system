import React from "react";

function AppointmentFilter({ filter, onFilterChange }) {
  const handleClearFilters = () => {
    
    onFilterChange({ 
      target: { 
        name: 'status', 
        value: '' 
      } 
    });
    onFilterChange({ 
      target: { 
        name: 'serviceType', 
        value: '' 
      } 
    });
  };

  return (
    <div className="mb-6 p-4 bg-[var(--background-light)] rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center">
          <label className="mr-2 text-[var(--dark-brown)] font-medium">Status:</label>
          <select
            name="status"
            value={filter.status}
            onChange={onFilterChange}
            className="p-2 border border-[var(--light-grey)] rounded-md bg-[var(--white)] text-[var(--dark-brown)] focus:ring-2 focus:ring-[var(--main-color)] focus:border-transparent"
          >
            <option value="">All</option>
            <option value="Booked">Booked</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Service Type Filter */}
        <div className="flex items-center">
          <label className="mr-2 text-[var(--dark-brown)] font-medium">Service:</label>
          <select
            name="serviceType"
            value={filter.serviceType}
            onChange={onFilterChange}
            className="p-2 border border-[var(--light-grey)] rounded-md bg-[var(--white)] text-[var(--dark-brown)] focus:ring-2 focus:ring-[var(--main-color)] focus:border-transparent"
          >
            <option value="">All</option>
            <option value="Grooming">Grooming</option>
            <option value="Training">Training</option>
            <option value="Medical">Medical</option>
            <option value="Boarding">Boarding</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="ml-auto px-4 py-2 bg-[var(--light-brown)] text-[var(--dark-brown)] rounded-md hover:bg-[var(--puppy-brown)] transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default AppointmentFilter;
