import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Boarding() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState("");
  const [serviceType] = useState("Boarding");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [session, setSession] = useState({ _id: '', email: '' });
  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState(0);

  // Pricing configuration
  const dailyRate = 5000; // $50 per day
  const weeklyDiscount = 0.9; // 10% discount for stays of 7+ days

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/users/session', {
          credentials: 'include', 
        });
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  const userId = session._id;

  // Calculate duration and amount when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.max(0, end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDuration(diffDays);
      
      // Apply weekly discount for stays of 7+ days
      const calculatedAmount = diffDays >= 7 
        ? diffDays * dailyRate * weeklyDiscount
        : diffDays * dailyRate;
      
      setAmount(calculatedAmount);
    } else {
      setDuration(0);
      setAmount(0);
    }
  }, [startDate, endDate]);

  // Fetch user's pets
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/appointments/pets/${userId}`)
        .then(response => setPets(response.data))
        .catch(error => console.error("Error fetching pets:", error));
    }
  }, [userId]);

  const today = new Date().toISOString().split("T")[0];

  function setData(e) {
    e.preventDefault();

    if (!petId) {
      alert("Please select a pet.");
      return;
    }

    if (startDate < today) {
      alert("Start date cannot be in the past.");
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after the start date.");
      return;
    }

    const boardingDetails = { startDate, endDate };
    const details = { boardingDetails };
    const newAppointment = { 
      petId, 
      userId, 
      serviceType, 
      details,
      amount // Include amount in the appointment
    };

    axios.post("http://localhost:5000/appointments/add", newAppointment)
      .then(() => {
        alert(`Boarding Booked Successfully! Total: LKR${amount.toFixed(2)}`);
        setPetId("");
        setStartDate("");
        setEndDate("");
        setAmount(0);
        navigate("/customer/appointmentSuccess", {
          state: {
            serviceType, 
            startDate,
            endDate,
            amount
          }
        });
      })
      .catch(err => {
        alert("Failed to book boarding appointment.");
        console.error(err);
      });
  }

  return (
    <div className="p-4" style={{ backgroundColor: 'var(--main-color)', color: 'var(--grey)' }}>
      <button 
        onClick={() => navigate("/customer/ServiceType")} 
        className="bg-[var(--dark-brown)] text-white py-2 px-4 rounded-md hover:bg-[var(--light-brown)] transition-colors duration-300 ease-in-out"
      >
        Back
      </button>

      <div className="bg-[var(--background-light)] p-6 rounded-lg shadow-md max-w-md mx-auto mt-8 mb-8">
        <h2 className="text-xl font-semibold text-[var(--dark-brown)] mb-4">
          Book Boarding Appointment
        </h2>

        <form onSubmit={setData} className="space-y-4">
          <div>
            <label htmlFor="petId" className="block text-[var(--dark-brown)] font-medium">Select Pet:</label>
            <select
              id="petId"
              name="petId"
              onChange={(e) => setPetId(e.target.value)}
              required
              className="w-full p-2 border border-[var(--light-grey)] rounded-md bg-white"
              value={petId}
            >
              <option value="">--Select Your Pet--</option>
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>{pet.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-[var(--dark-brown)] font-medium">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              name="details.boardingDetails.startDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full p-2 border border-[var(--light-grey)] rounded-md bg-white"
              value={startDate}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-[var(--dark-brown)] font-medium">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              name="details.boardingDetails.endDate"
              min={startDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full p-2 border border-[var(--light-grey)] rounded-md bg-white"
              value={endDate}
            />
          </div>

          {/* Price Calculation Display */}
          <div className="bg-[var(--light-grey)] p-3 rounded-md">
            <div className="grid grid-cols-2 gap-2 text-[var(--dark-brown)]">
              <div>
                <p className="font-medium">Duration:</p>
                <p>{duration} {duration === 1 ? 'day' : 'days'}</p>
              </div>
              <div>
                <p className="font-medium">Daily Rate:</p>
                <p>LKR{dailyRate.toFixed(2)}</p>
              </div>
            </div>
            {duration >= 7 && (
              <div className="mt-2 text-[var(--dark-brown)]">
                <p className="font-medium">Weekly Discount (10% off):</p>
                <p>Applied</p>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-[var(--grey)]">
              <p className="font-bold">Total Amount:</p>
              <p className="text-lg">LKR{amount.toFixed(2)}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!petId || !startDate || !endDate || amount <= 0}
            className={`w-full py-2 rounded-md font-semibold transition
              ${!petId || !startDate || !endDate || amount <= 0
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-[var(--main-color)] hover:bg-[var(--puppy-brown)] text-white"}`}
          >
            {amount > 0 ? `Book Boarding (LKR${amount.toFixed(2)})` : "Book Boarding"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Boarding;
