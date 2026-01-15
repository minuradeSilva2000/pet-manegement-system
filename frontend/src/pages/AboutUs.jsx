import React from 'react';

const AboutUs = () => {
  return (
    <div className="text-gray-800 p-8 rounded-2xl max-w-3xl mx-auto shadow-lg">
      <h1 className="text-4xl font-bold text-pink-600 text-center mb-6">
        About Us
      </h1>

      <img
        src="https://plus.unsplash.com/premium_photo-1665296633416-8317f7526c1d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Happy pet at the vet clinic"
        className="w-75 h-auto rounded-xl mx-auto mb-6"
      />

      <p className="mb-4 leading-relaxed">
        Petopia is a dedicated pet care system built as a 2nd Year, 2nd Semester ITP
        project for our client—a renowned vet clinic in Matara. We believe every pet
        deserves top-quality care, and our platform makes it easy for vets and pet owners
        to stay connected.
      </p>
    </div>
  );
};

export default AboutUs;
