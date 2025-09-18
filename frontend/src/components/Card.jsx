import React from 'react';

const Card = ({ children, className = '', variant = 'default', ...props }) => {
  const baseClasses = "bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1";

  const variants = {
    default: "p-6",
    compact: "p-4",
    spacious: "p-8",
    gradient: "p-6 bg-gradient-to-br from-white to-gray-50",
    primary: "p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200",
    success: "p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200",
    warning: "p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200",
    danger: "p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200"
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;