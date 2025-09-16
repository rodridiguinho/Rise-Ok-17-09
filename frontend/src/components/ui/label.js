import React from 'react';

export const Label = ({ children, htmlFor, className = "" }) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 ${className}`}
    >
      {children}
    </label>
  );
};