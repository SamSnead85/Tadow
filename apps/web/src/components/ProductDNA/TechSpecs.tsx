import { motion } from 'framer-motion';
import { Cpu, Monitor, HardDrive, Battery, Weight, Gauge } from 'lucide-react';
import type { ProductSpecs } from '@/types';

interface TechSpecsProps {
    specs: ProductSpecs;
}

const specIcons: Record<string, React.ReactNode> = {
    cpu: <Cpu className="w-4 h-4" />,
    gpu: <Gauge className="w-4 h-4" />,
    ram: <HardDrive className="w-4 h-4" />,
    storage: <HardDrive className="w-4 h-4" />,
    display: <Monitor className="w-4 h-4" />,
    displayResolution: <Monitor className="w-4 h-4" />,
    weight: <Weight className="w-4 h-4" />,
    batteryLife: <Battery className="w-4 h-4" />,
};

const specLabels: Record<string, string> = {
    cpu: 'Processor',
    gpu: 'Graphics',
    ram: 'Memory',
    storage: 'Storage',
    display: 'Display',
    displayResolution: 'Resolution',
    weight: 'Weight',
    batteryLife: 'Battery Life',
};

export function TechSpecs({ specs }: TechSpecsProps) {
    const specEntries = Object.entries(specs);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-6"
        >
            <h3 className="font-semibold text-noir-900 mb-6">Technical Specifications</h3>

            <div className="grid sm:grid-cols-2 gap-4">
                {specEntries.map(([key, value], index) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-noir-50/50"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-noir-500 shadow-sm">
                            {specIcons[key] || <Cpu className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-noir-500 uppercase tracking-wide">
                                {specLabels[key] || key}
                            </p>
                            <p className="text-sm font-medium text-noir-900 truncate">
                                {value}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
