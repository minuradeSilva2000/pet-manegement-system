import React from "react";
import PetContainer from "../components/petContainer";

const DoctorDashboard = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 to-pink-100 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-pink-100">
          <PetContainer />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
