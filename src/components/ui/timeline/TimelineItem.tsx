import React from 'react';

interface TimelineItemProps {
    title: string;
    description: string;
    image: string;
    sideText?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
                                                       title, description, image, sideText = "XOLO RUTA TDMX", buttonText = "Ver Detalles", onButtonClick
                                                   }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_1fr] gap-8 lg:gap-10 items-center">
            <div className="hidden lg:block">
                <p className="whitespace-nowrap -rotate-90 text-[10px] font-bold tracking-[0.5em] text-indigo-300 uppercase origin-center">
                    {sideText}
                </p>
            </div>

            <div className="order-first lg:order-last">
                <div className="relative group">
                    <div className="absolute -inset-2 md:-inset-4 bg-indigo-50 rounded-[2rem] md:rounded-[2.5rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                    <div className="relative h-60 md:h-80 lg:h-[400px] w-full overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white">
                        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 md:space-y-6 text-center lg:text-left">
                <div className="space-y-2 flex flex-col items-center lg:items-start">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">{title}</h2>
                    <div className="h-1 w-16 md:w-20 bg-indigo-500 rounded-full"></div>
                </div>
                <p className="text-gray-500 leading-relaxed text-base md:text-lg lg:text-xl font-medium">{description}</p>
                <div className="pt-2">
                    <button onClick={onButtonClick} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-indigo-200 active:scale-95 group">
                        {buttonText} <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimelineItem;