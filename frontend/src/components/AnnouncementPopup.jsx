import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { getPublicAnnouncement } from '../api';

// Module-level variable to track dismissal during the current app execution (resets on F5)
let isDismissedInSession = false;

const AnnouncementPopup = () => {
    const [config, setConfig] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                // Check if already dismissed in this execution
                if (isDismissedInSession) {
                    console.log("Announcement blocked: already shown/dismissed during this visit (F5 to see again).");
                    return;
                }

                const data = await getPublicAnnouncement();
                console.log("Announcement Data Fetched:", data);
                
                if (data && data.isActive) {
                    console.log("Announcement active: displaying in 2s...");
                    setConfig(data);
                    // Show after a natural delay
                    setTimeout(() => {
                        setIsVisible(true);
                        setIsAnimating(true);
                    }, 2000);

                    // Auto-close after 10 seconds of visibility
                    const autoCloseTimer = setTimeout(() => {
                        handleClose();
                    }, 12000); // 2s show delay + 10s visibility

                    return () => clearTimeout(autoCloseTimer);
                }
            } catch (err) {
                console.error("Failed to fetch announcement:", err);
            }
        };

        fetchAnnouncement();
    }, []);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
            isDismissedInSession = true;
        }, 500); // Smooth exit duration
    };

    if (!isVisible || !config) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-md transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] max-w-lg w-full overflow-hidden relative transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform ${isAnimating ? 'scale-100 translate-y-0 translate-z-0' : 'scale-90 translate-y-12'}`}>
                
                {/* Decorative Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />

                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2.5 bg-red-50 hover:bg-red-100 rounded-full transition-all text-red-500 hover:text-red-700 z-10 hover:scale-110 active:scale-90 shadow-sm border border-red-100/50"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 stroke-[3]" />
                </button>

                <div className="p-8 sm:p-14 text-center space-y-8 relative">
                    {/* Visual Element (Icon) */}
                    <div className="relative inline-flex mb-2">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 rotate-3 group-hover:rotate-0 transition-transform">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black animate-bounce">
                            !
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                            {config.title || "Special Alert!"}
                        </h2>
                        <div className="w-16 h-1.5 bg-orange-500 mx-auto rounded-full mt-2" />
                        <p className="text-gray-600 text-base sm:text-xl font-medium leading-relaxed max-w-[90%] mx-auto">
                            {config.content}
                        </p>

                        {config.displayDate && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mt-4 border border-gray-100 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {config.displayDate}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 space-y-6">
                        {config.buttonText && config.buttonLink && (
                            <a 
                                href={config.buttonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-3 w-full h-16 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-orange-600 hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0 group"
                            >
                                {config.buttonText}
                                <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        )}
                        
                        <button 
                            onClick={handleClose}
                            className="block w-full text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors"
                        >
                            Dismiss for now
                        </button>
                    </div>
                </div>

                {/* Progress Bar (Timer indicator) */}
                <div className="absolute bottom-0 left-0 h-1.5 bg-gray-50/50 w-full overflow-hidden">
                    {isAnimating && (
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 animate-countdown"
                        />
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress-countdown {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
                .animate-countdown {
                    animation: progress-countdown 10s linear forwards;
                    transform-origin: left;
                }
            `}} />
        </div>
    );
};

export default AnnouncementPopup;
