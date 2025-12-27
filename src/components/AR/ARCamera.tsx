import { useEffect, useRef, useState } from "react";

interface ARCameraProps {
    onStreamReady?: (stream: MediaStream) => void;
    onStreamError?: (error: Error) => void;
    isActive: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null> | React.MutableRefObject<HTMLVideoElement | null>;
}

export const ARCamera = ({
    onStreamReady,
    onStreamError,
    isActive,
    videoRef,
}: ARCameraProps) => {
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!isActive) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            return;
        }

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: "environment",
                    },
                    audio: false,
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    onStreamReady?.(stream);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to access camera. Please check permissions.";
                setError(errorMessage);
                onStreamError?.(new Error(errorMessage));
                console.error("Camera access error:", err);
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, [isActive, onStreamReady, onStreamError, videoRef]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
        />
    );
};
