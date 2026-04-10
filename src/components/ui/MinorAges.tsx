import React from 'react';

interface MinorAgesProps {
    count: number;
    ages: string[];
    onChange: (index: number, value: string) => void;
}

export const MinorAges: React.FC<MinorAgesProps> = ({ count, ages, onChange }) => {
    if (count <= 0) return null;

    return (
        <div className="col-span-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-inner">
                <header className="mb-4">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                        Edades de los menores
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Indica la edad para calcular la tarifa exacta
                    </p>
                </header>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index} className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 ml-1 uppercase">
                                Niño {index + 1}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="17"
                                placeholder="0"
                                value={ages[index] || ''}
                                onChange={(e) => onChange(index, e.target.value)}
                                className="w-full h-12 px-4 bg-white border-2 border-transparent rounded-2xl text-sm font-bold transition-all outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-slate-700 shadow-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};