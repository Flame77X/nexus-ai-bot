import React, { useEffect, useRef, useState } from 'react';

const JarvisMode = ({ onClose, onSend, isSpeaking, lastBotMessage }) => {
    const [status, setStatus] = useState('Initializing...');
    const [isListening, setIsListening] = useState(false);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    // Initialize Audio Context & Visualizer
    useEffect(() => {
        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;

                sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                sourceRef.current.connect(analyserRef.current);

                drawVisualizer();
                setStatus('Online. Listening...');
                startListening();
            } catch (err) {
                console.error("Audio init failed", err);
                setStatus('Microphone Access Denied');
            }
        };

        initAudio();

        return () => {
            if (audioContextRef.current) audioContextRef.current.close();
            if (recognitionRef.current) recognitionRef.current.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, []);

    // Visualizer Loop
    const drawVisualizer = () => {
        const canvas = canvasRef.current;
        if (!canvas || !analyserRef.current) return;

        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            if (!canvas) return;
            requestAnimationFrame(render);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 100;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.stroke();

            // Draw circular waveform
            ctx.beginPath();
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] * 0.8;
                const angle = (i * Math.PI * 2) / bufferLength;
                const x = centerX + Math.cos(angle) * (radius + barHeight);
                const y = centerY + Math.sin(angle) * (radius + barHeight);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = isSpeaking ? '#f472b6' : '#22d3ee'; // Pink if bot speaking, Cyan if listening
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner Glow
            const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
            gradient.addColorStop(0, isSpeaking ? 'rgba(236, 72, 153, 0.8)' : 'rgba(6, 182, 212, 0.8)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        };
        render();
    };

    // Speech Recognition Logic
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            // Auto restart if not closed
            if (audioContextRef.current?.state === 'running') recognition.start();
        };

        recognition.onresult = (event) => {
            if (isSpeaking) return; // Don't listen while bot is talking

            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            if (event.results[0].isFinal) {
                setStatus('Processing...');
                onSend(null, transcript); // Send to main chat handler
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Header */}
            <div className="absolute top-8 left-0 right-0 text-center">
                <h2 className="text-cyan-400 text-2xl tracking-[0.5em] uppercase font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                    JARVIS INTERFACE
                </h2>
                <p className="text-cyan-700 text-sm mt-2">{status}</p>
            </div>

            {/* Visualizer Canvas */}
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="relative z-10"
            />

            {/* Subtitles / Last Message */}
            <div className="absolute bottom-32 max-w-2xl text-center px-4">
                <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed animate-pulse">
                    {lastBotMessage || "Awaiting input..."}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute bottom-10 px-8 py-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-full hover:bg-red-500/20 transition-all uppercase tracking-widest text-sm"
            >
                Terminate Session
            </button>
        </div>
    );
};

export default JarvisMode;
