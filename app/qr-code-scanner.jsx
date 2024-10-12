"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const QrScanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.QrScanner),
  {
    ssr: false,
    loading: () => <p>Loading scanner...</p>,
  }
);

export default function QRCodeScanner() {
  const [result, setResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if the browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support accessing the camera.");
    }
  }, []);

  const handleDecode = (result) => {
    setResult(result);
    setIsCameraActive(false);
  };

  const handleError = (error) => {
    console.error(error);
    setError("An error occurred while scanning. Please try again.");
    setIsCameraActive(false);
  };

  const startScanning = () => {
    setIsCameraActive(true);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">QR Code Scanner</h2>
      </div>
      <div className="p-4">
        {error && (
          <div
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
        {isCameraActive ? (
          <div className="mb-4 relative" style={{ height: "300px" }}>
            <QrScanner
              onDecode={handleDecode}
              onError={handleError}
              constraints={{ facingMode: "environment" }}
            />
          </div>
        ) : (
          <button
            onClick={startScanning}
            className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Start Scanning
          </button>
        )}
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2 text-gray-700">
              Scanned Result:
            </h3>
            <p className="break-all text-gray-600">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
