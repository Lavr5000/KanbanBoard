"use client";

import { useEffect, useRef } from "react";

interface QRCodeDisplayProps {
  data: string;
  size?: number;
}

export const QRCodeDisplay = ({ data, size = 200 }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Простая генерация QR кода через API
    // Используем публичный API для генерации QR кодов
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      data
    )}`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.onerror = () => {
      // Fallback - рисуем текст если QR не загрузился
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#000000";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("QR код недоступен", size / 2, size / 2);
    };
    img.src = qrApiUrl;
  }, [data, size]);

  return (
    <div className="flex justify-center items-center bg-white p-4 rounded-lg">
      <canvas ref={canvasRef} width={size} height={size} className="max-w-full h-auto" />
    </div>
  );
};
