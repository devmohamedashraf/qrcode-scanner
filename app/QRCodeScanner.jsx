"use client";
import React, { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const QRCodeScanner = () => {
  const [data, setData] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const scanImage = (imageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      setData(code.data);
      setStatus({
        type: "success",
        message: "QR code scanned successfully!",
      });
    } else {
      setStatus({
        type: "error",
        message: "No QR code found in the image.",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (imageUrl) {
      setIsLoading(true);
      setStatus({ type: "", message: "" });
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.src = imageUrl;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        scanImage(imageData);
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
    let animationFrameId;
    if (isCameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const scanQRCode = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setData(code.data);
            setIsCameraActive(false);
            setStatus({
              type: "success",
              message: "QR code scanned successfully from camera!",
            });
          } else {
            animationFrameId = requestAnimationFrame(scanQRCode);
          }
        } else {
          animationFrameId = requestAnimationFrame(scanQRCode);
        }
      };

      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          animationFrameId = requestAnimationFrame(scanQRCode);
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          setStatus({
            type: "error",
            message: `Error accessing camera. Please try again or use file upload. ${error.message}`,
          });
          setIsCameraActive(false);
        });

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop());
        }
      };
    }
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
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        scanImage(imageData);
      };
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
        <div className="relative w-64 h-64">
          <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover" />
        </div>
      )}
      {isLoading && (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Scanning QR code...</span>
        </div>
      )}
      {status.message && (
        <Alert variant={status.type === "error" ? "destructive" : "default"}>
          <AlertTitle>{status.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
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