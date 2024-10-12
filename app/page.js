import Image from "next/image";
import QRCodeScanner from "./QRCodeScanner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <QRCodeScanner />
    </main>
  );
}
