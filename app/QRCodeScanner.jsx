"use client";
import React, { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RefreshCw } from "lucide-react";

const QRCodeScanner = () => {
  const [data, setData] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const scanImage = (image) => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });
    QrScanner.scanImage(image, { returnDetailedScanResult: true })
      .then((result) => {
        setData(result.data);
        setStatus({
          type: "success",
          message: "QR code scanned successfully!",
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Scan failed:", error);
        setStatus({
          type: "error",
          message: "QR code not detected. Please try again.",
        });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (imageUrl) {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => scanImage(image);
      image.onerror = () => {
        setStatus({
          type: "error",
          message: "Error loading image. Please try a different file.",
        });
        setIsLoading(false);
      };
    }
  }, [imageUrl]);

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setData(result.data);
          setIsCameraActive(false);
          setStatus({
            type: "success",
            message: "QR code scanned successfully!",
          });
        },
        { returnDetailedScanResult: true }
      );
      scannerRef.current.start().catch((error) => {
        console.error("Camera start failed:", error);
        setStatus({
          type: "error",
          message: "Error starting camera. Please try again." + error,
        });
        setIsCameraActive(false);
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, [isCameraActive]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setImageUrl(fileUrl);
      setIsCameraActive(false);
      setStatus({ type: "", message: "" });
    }
  };

  const handleCameraToggle = () => {
    setIsCameraActive(!isCameraActive);
    setImageUrl(null);
    setStatus({ type: "", message: "" });
    setData("");
  };

  const handleTryAgain = () => {
    if (imageUrl) {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => scanImage(image);
    } else {
      setStatus({ type: "", message: "" });
      setData("");
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <h2 className="text-2xl font-bold">QR Code Scanner</h2>
      <div className="flex space-x-2">
        <Input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full max-w-sm"
          ref={fileRef}
        />
        <Button onClick={handleCameraToggle}>
          <Camera className="mr-2 h-4 w-4" />{" "}
          {isCameraActive ? "Stop Camera" : "Use Camera"}
        </Button>
      </div>
      {imageUrl && !isLoading && !status.type && (
        <img
          src={imageUrl}
          alt="Selected QR Code"
          className="w-64 h-64 object-contain"
        />
      )}
      {isCameraActive && (
        <video ref={videoRef} className="w-64 h-64 object-contain" />
      )}
      {isLoading && (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Scanning QR code...</span>
        </div>
      )}
      {status.message && (
        <div
          className={`text-center p-2 rounded ${
            status.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {status.message}
        </div>
      )}
      {data && (
        <div className="mt-4 p-4 bg-gray-100 rounded w-full max-w-sm">
          <h3 className="font-bold mb-2">Scanned Result:</h3>
          <p className="break-all">{data}</p>
        </div>
      )}
      {(status.type || data) && (
        <Button onClick={handleTryAgain} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      )}
    </div>
  );
};

export default QRCodeScanner;
