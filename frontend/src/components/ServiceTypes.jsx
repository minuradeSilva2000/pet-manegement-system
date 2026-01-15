import React from "react";
import { useNavigate } from "react-router-dom";

function ServiceType() {
  const navigate = useNavigate();

  const services = [
    {
      name: "Grooming",
      path: "/customer/bookGrooming",
      bgColor: "var(--main-color)",
      textColor: "var(--white)",
      icon: "✂️",
      description: "Professional grooming services for your pet"
    },
    {
      name: "Training",
      path: "/customer/bookTraining",
      bgColor: "var(--light-purple)",
      textColor: "var(--dark-brown)",
      icon: "🎓",
      description: "Behavioral and skill training programs"
    },
    {
      name: "Medical",
      path: "/customer/bookMedical",
      bgColor: "var(--puppy-brown)",
      textColor: "var(--white)",
      icon: "🏥",
      description: "Veterinary care and health services"
    },
    {
      name: "Boarding",
      path: "/customer/bookBoarding",
      bgColor: "var(--light-brown)",
      textColor: "var(--dark-brown)",
      icon: "🏠",
      description: "Safe and comfortable overnight stays"
    }
  ];

  return (
    <div className="min-h-screen p-6 flex flex-col items-center" style={{ backgroundColor: "var(--background-light)" }}>
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--dark-brown)" }}>Our Services</h1>
          <div className="w-20 h-1 mx-auto mb-4" style={{ backgroundColor: "var(--main-color)" }}></div>
          <p className="text-lg" style={{ color: "var(--dark-brown)" }}>
            Choose the perfect care for your pet
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              className="rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1"
              style={{ 
                backgroundColor: service.bgColor,
                color: service.textColor
              }}
            >
              <button
                onClick={() => navigate(service.path)}
                className="w-full h-full p-6 text-left"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{service.icon}</span>
                    <h2 className="text-2xl font-semibold">{service.name}</h2>
                  </div>
                  <p className="mb-4 opacity-90">{service.description}</p>
                  <div className="mt-auto">
                    <span className="inline-block px-4 py-2 rounded-lg font-medium"
                      style={{ 
                        backgroundColor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(5px)"
                      }}>
                      Book Now →
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center text-sm" style={{ color: "var(--dark-brown)" }}>
          <p>All services include professional care from certified experts</p>
        </div>
      </div>
    </div>
  );
}

export default ServiceType;
