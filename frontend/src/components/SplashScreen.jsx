import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade out after 2.5 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 2500);

        // Call onComplete after fade out animation (3 seconds total)
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-600 via-indigo-600 to-primary-700 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse"></div>

            {/* Center Content */}
            <div className="relative text-center animate-fade-in">
                {/* Logo with Glow Effect */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 blur-3xl opacity-50 bg-white rounded-full"></div>
                    <div className="relative inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl animate-bounce-slow">
                        <Sparkles className="w-16 h-16 text-white animate-pulse" strokeWidth={2} />
                    </div>
                </div>

                {/* Brand Name with Gradient */}
                <h1 className="text-7xl md:text-8xl font-black text-white mb-6 animate-slide-up tracking-tight">
                    Aidora
                </h1>

                {/* Tagline */}
                <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 animate-slide-up animation-delay-200 tracking-wide">
                    Intelligent Support at the Right Time
                </p>

                {/* Loading Dots */}
                <div className="flex items-center justify-center gap-2 animate-fade-in animation-delay-400">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-0"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-100"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-200"></div>
                </div>

                {/* Developed by */}
                <p className="mt-12 text-sm text-white/70 animate-fade-in animation-delay-600">
                    Developed with ❤️ by <span className="font-semibold text-white">Keeistu M S</span>
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
