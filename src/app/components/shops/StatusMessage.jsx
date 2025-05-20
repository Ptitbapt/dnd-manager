"use client";

import { useState, useEffect } from "react";

export default function StatusMessage({ error, success }) {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Afficher le message d'erreur si présent
    if (error) {
      setShowError(true);
      setShowSuccess(false);
    } else {
      setShowError(false);
    }

    // Afficher le message de succès si présent
    if (success) {
      setShowSuccess(true);
      setShowError(false);
    } else {
      setShowSuccess(false);
    }
  }, [error, success]);

  if (!showError && !showSuccess) {
    return null;
  }

  return (
    <div
      className={`rounded-md p-4 mb-4 ${
        showError
          ? "bg-red-50 border border-red-200"
          : "bg-green-50 border border-green-200"
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {showError ? (
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3
            className={`text-sm font-medium ${
              showError ? "text-red-800" : "text-green-800"
            }`}
          >
            {showError ? "Erreur" : "Succès"}
          </h3>
          <div
            className={`mt-2 text-sm ${
              showError ? "text-red-700" : "text-green-700"
            }`}
          >
            {showError ? error : success}
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() =>
                showError ? setShowError(false) : setShowSuccess(false)
              }
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                showError
                  ? "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50"
                  : "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50"
              }`}
            >
              <span className="sr-only">Fermer</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
