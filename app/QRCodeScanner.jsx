"use client";
import React, { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";
import jsQR from "jsqr";
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

  const scanImage = async (image) => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });
    try {
      // Try QrScanner library first
      console.log("Attempting to scan with QrScanner...");
      const result = await QrScanner.scanImage(image, {
        returnDetailedScanResult: true,
        qrEngine: QrScanner.WORKER_PATH,
        maxScansPerSecond: 1,
      });
      setData(result.data);
      setStatus({
        type: "success",
        message: "QR code scanned successfully with QrScanner!",
      });
    } catch (qrScannerError) {
      console.error("QrScanner failed:", qrScannerError);
      // If QrScanner fails, try jsQR
      console.log("Attempting to scan with jsQR...");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        setData(code.data);
        setStatus({
          type: "success",
          message: "QR code scanned successfully with jsQR!",
        });
      } else {
        console.error("jsQR failed to detect a QR code");
        throw new Error("Both QR code scanning methods failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.src = imageUrl;
      image.onload = () => {
        console.log("Image loaded successfully. Dimensions:", image.width, "x", image.height);
        scanImage(image);
      };
      image.onerror = (error) => {
        console.error("Error loading image:", error);
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
            message: "QR code scanned successfully from camera!",
          });
        },
        { returnDetailedScanResult: true }
      );
      scannerRef.current.start().catch((error) => {
        console.error("Camera start failed:", error);
        setStatus({
          type: "error",
          message: `Error starting camera. Please try again or use file upload. ${error.message}`,
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
      console.log("File selected:", selectedFile.name, "Size:", selectedFile.size, "bytes");
      const fileUrl = URL.createObjectURL(selectedFile);
      setImageUrl(fileUrl);
      setIsCameraActive(false);
      setStatus({ type: "", message: "" });
      setData("");
    }
  };

  const handleCameraToggle = () => {
    setIsCameraActive((prev) => !prev);
    setImageUrl(null);
    setStatus({ type: "", message: "" });
    setData("");
  };

  const handleTryAgain = () => {
    if (imageUrl) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
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
    <div className="flex flex-col items-center justify-center space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">QR Code Scanner</h2>
      <div className="flex flex-col space-y-2 w-full">
        <Input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full"
          ref={fileRef}
        />
        <Button onClick={handleCameraToggle}>
          <Camera className="mr-2 h-4 w-4" />
          {isCameraActive ? "Stop Camera" : "Use Camera"}
        </Button>
      </div>
      {imageUrl && !isLoading && !status.type && (
        <img
          src={imageUrl}
          alt="Selected QR Code"
          className="w-64 h-64 object-contain bg-white border border-gray-300"
        />
      )}
      {isCameraActive && (
        <video ref={videoRef} className="w-64 h-64 object-contain bg-black" />
      )}
      {isLoading && (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Scanning QR code...</span>
        </div>
      )}
      {status.message && (
        <div variant={status.type === "error" ? "destructive" : "default"}>
          <div>{status.type === "error" ? "Error" : "Success"}</div>
          <div>{status.message}</div>
        </div>
      )}
      {data && (
        <div className="mt-4 p-4 bg-gray-100 rounded w-full">
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