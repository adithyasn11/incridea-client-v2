import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { X } from 'lucide-react'

interface QrScannerProps {
    onScan: (data: string) => void
    onClose: () => void
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        // Initialize scanner
        // Use a slight timeout to ensure DOM is ready
        const timer = setTimeout(() => {
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { 
                        fps: 10, 
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    false
                )
                
                scanner.render((decodedText) => {
                    if (scannerRef.current) {
                        try {
                             scannerRef.current.clear().catch(console.error)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    onScan(decodedText)
                }, (_error) => {
                    // console.warn(error)
                })

                scannerRef.current = scanner
            }
        }, 100)

        return () => {
            clearTimeout(timer)
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(console.error)
                } catch (e) {
                    console.error("Error clearing scanner", e)
                }
            }
        }
    }, [onScan])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Scan PID QR Code</h3>
                <div id="reader" className="overflow-hidden rounded-lg bg-black"></div>
                <p className="text-center text-sm text-gray-400 mt-4">
                    Point camera at the PID QR code
                </p>
             </div>
        </div>
    )
}
