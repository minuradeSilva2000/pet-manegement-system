import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Training() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState("");
  const [serviceType] = useState("Training");
  const [trainingType, setTrainingType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [session, setSession] = useState({ _id: '', email: '' });
  const [amount, setAmount] = useState(0); // State for service amount

  // Service pricing configuration
  const servicePrices = {
    "Obedience": 5000,
    "Agility": 6000,
    "Behavior Correction": 7500,
    "Puppy Training": 4500
  };

  const timeSlots = [
    "09:00 AM-09:30 AM", "09:30 AM-10:00 AM", "10:00 AM-10:30 AM", "10:30 AM-11:00 AM",
    "11:00 AM-11:30 AM", "11:30 AM-12:00 PM", "02:00 PM-02:30 PM", "02:30 PM-03:00 PM",
    "03:00 PM-03:30 PM", "03:30 PM-04:00 PM"
  ];

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

  // Update amount when training type changes
  useEffect(() => {
    if (trainingType && servicePrices[trainingType]) {
      setAmount(servicePrices[trainingType]);
    } else {
      setAmount(0);
    }
  }, [trainingType]);

  // Fetch user's pets
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/appointments/pets/${userId}`)
        .then(response => setPets(response.data))
        .catch(error => console.error("Error fetching pets:", error));
    }
  }, [userId]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (date) {
      axios.get(`http://localhost:5000/timeslots/bookedSlots?date=${date}&serviceType=${serviceType}`)
        .then(response => setBookedSlots(response.data.map(slot => slot.slot)))
        .catch(error => console.error("Error fetching booked slots:", error));
    }
  }, [date, serviceType]);

  function setData(e) {
    e.preventDefault();

    if (!petId || !trainingType || !date || !time) {
      alert("Please fill in all required fields.");
      return;
    }

    const bookedSlotData = { date, serviceType, slot: time };

    axios.post("http://localhost:5000/timeslots/bookSlot", bookedSlotData)
      .then(() => {
        const details = { trainingType };
        const newAppointment = { 
          petId, 
          userId, 
          serviceType, 
          details, 
          date, 
          time,
          amount 
        };

        axios.post("http://localhost:5000/appointments/add", newAppointment)
          .then(() => {
            alert(`Training Appointment Booked Successfully! Total: LKR${amount.toFixed(2)}`);
            setPetId("");
            setTrainingType("");
            setDate("");
            setTime("");
            setAmount(0);
            navigate("/customer/appointmentSuccess", {
              state: {
                serviceType, 
                date,
                time,
                trainingType,
                amount
              }
            });
          })
          .catch(err => {
            alert("Failed to book appointment.");
            console.error("Error adding appointment:", err);
          });
      })
      .catch(err => {
        alert("Failed to book the time slot. It might be already taken.");
        console.error("Error booking slot:", err);
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
        <h2 className="text-xl font-semibold text-[var(--dark-brown)] mb-4">Book Training Appointment</h2>

        <form onSubmit={setData} className="space-y-4">
          {/* Select Pet */}
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

          {/* Select Training Type */}
          <div>
            <label htmlFor="trainingType" className="block text-[var(--dark-brown)] font-medium">
              Type of Training:
            </label>
            <select
              id="trainingType"
              name="details.trainingType"
              value={trainingType}
              onChange={(e) => setTrainingType(e.target.value)}
              required
              className="w-full p-2 border border-[var(--light-grey)] rounded-md bg-white"
            >
              <option value="">--Select Training Service--</option>
              {Object.entries(servicePrices).map(([service, price]) => (
                <option key={service} value={service}>
                  {service} (LKR{price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Price Display */}
          <div className="bg-[var(--light-grey)] p-3 rounded-md">
            <p className="text-[var(--dark-brown)] font-medium">
              Selected Service: <span className="font-bold">{trainingType || "None selected"}</span>
            </p>
            <p className="text-[var(--dark-brown)] font-medium">
              Total Amount: <span className="font-bold">LKR{amount.toFixed(2)}</span>
            </p>
          </div>

          {/* Select Date */}
          <div>
            <label htmlFor="date" className="block text-[var(--dark-brown)] font-medium">
              Preferred Date:
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-2 border border-[var(--light-grey)] rounded-md bg-white"
            />
          </div>

          {/* Select Time Slot */}
          <div>
            <label htmlFor="time" className="block text-[var(--dark-brown)] font-medium">Preferred Time Slot:</label>
            <select
              id="time"
              name="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full p-2 border border-[var(--light-grey)] rounded-md bg-white"
            >
              <option value="">--Select a Time Slot--</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                  {slot} {bookedSlots.includes(slot) ? "(Booked)" : "(Available)"}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!trainingType || !petId || !date || !time}
            className={`w-full py-2 rounded-md font-semibold transition
              ${!trainingType || !petId || !date || !time 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-[var(--main-color)] hover:bg-[var(--puppy-brown)] text-white"}`}
          >
            {amount > 0 ? `Book Appointment (LKR${amount.toFixed(2)})` : "Book Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Training;
