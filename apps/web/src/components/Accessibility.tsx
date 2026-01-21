import { useEffect, useRef, useState, ReactNode, createContext, useContext } from 'react';

// Accessibility Types
type ColorScheme = 'dark' | 'light' | 'system';
type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
type MotionPreference = 'full' | 'reduced' | 'none';

interface AccessibilitySettings {
    colorScheme: ColorScheme;
    fontSize: FontSize;
    motionPreference: MotionPreference;
    highContrast: boolean;
    screenReaderAnnouncements: boolean;
}

const defaultSettings: AccessibilitySettings = {
    colorScheme: 'dark',
    fontSize: 'medium',
    motionPreference: 'full',
    highContrast: false,
    screenReaderAnnouncements: true,
};

// Context
const AccessibilityContext = createContext<{
    settings: AccessibilitySettings;
    updateSettings: (updates: Partial<AccessibilitySettings>) => void;
} | null>(null);

// Provider
export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        const stored = localStorage.getItem('tadow_accessibility');
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('tadow_accessibility', JSON.stringify(settings));

        // Apply settings to document
        const root = document.documentElement;

        // Font size
        const fontSizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' };
        root.style.fontSize = fontSizes[settings.fontSize];

        // High contrast
        root.classList.toggle('high-contrast', settings.highContrast);

        // Reduced motion
        root.classList.toggle('reduce-motion', settings.motionPreference !== 'full');
    }, [settings]);

    const updateSettings = (updates: Partial<AccessibilitySettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    return (
        <AccessibilityContext.Provider value={{ settings, updateSettings }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
    return context;
}

// Skip Link (for keyboard navigation)
export function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:rounded-lg focus:font-semibold"
        >
            Skip to main content
        </a>
    );
}

// Live Region for Screen Reader Announcements
export function LiveRegion({ message, priority = 'polite' }: { message: string; priority?: 'polite' | 'assertive' }) {
    return (
        <div
            role="status"
            aria-live={priority}
            aria-atomic="true"
            className="sr-only"
        >
            {message}
        </div>
    );
}

// Focus Trap for Modals
export function FocusTrap({ children, active = true }: { children: ReactNode; active?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active) return;

        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [active]);

    return <div ref={containerRef}>{children}</div>;
}

// Accessible Tooltip
export function AccessibleTooltip({
    content,
    children,
    id
}: {
    content: string;
    children: ReactNode;
    id: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                aria-describedby={id}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
            >
                {children}
            </div>
            {visible && (
                <div
                    id={id}
                    role="tooltip"
                    className="absolute z-50 px-3 py-2 bg-zinc-800 text-white text-sm rounded-lg shadow-lg -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                    {content}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45" />
                </div>
            )}
        </div>
    );
}

// Keyboard Shortcut Handler
interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

export function KeyboardShortcuts({ shortcuts }: { shortcuts: KeyboardShortcut[] }) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const shortcut = shortcuts.find(s =>
                s.key.toLowerCase() === e.key.toLowerCase() &&
                !!s.ctrl === (e.ctrlKey || e.metaKey) &&
                !!s.shift === e.shiftKey &&
                !!s.alt === e.altKey
            );

            if (shortcut) {
                e.preventDefault();
                shortcut.action();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    return null;
}

// Keyboard Shortcuts Help Modal
export function ShortcutsHelp({ shortcuts, onClose }: { shortcuts: KeyboardShortcut[]; onClose: () => void }) {
    const formatKey = (shortcut: KeyboardShortcut) => {
        const parts = [];
        if (shortcut.ctrl) parts.push('⌘');
        if (shortcut.shift) parts.push('⇧');
        if (shortcut.alt) parts.push('⌥');
        parts.push(shortcut.key.toUpperCase());
        return parts.join(' + ');
    };

    return (
        <FocusTrap>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Keyboard Shortcuts</h2>
                    <div className="space-y-2">
                        {shortcuts.map((s, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800">
                                <span className="text-zinc-300">{s.description}</span>
                                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-400 font-mono text-sm">
                                    {formatKey(s)}
                                </kbd>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-2 bg-amber-500 text-black font-semibold rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </FocusTrap>
    );
}

// Accessibility Settings Panel
export function AccessibilitySettingsPanel() {
    const { settings, updateSettings } = useAccessibility();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Accessibility</h2>

            {/* Font Size */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <label className="block text-white font-medium mb-3">Text Size</label>
                <div className="flex gap-2">
                    {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map(size => (
                        <button
                            key={size}
                            onClick={() => updateSettings({ fontSize: size })}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${settings.fontSize === size
                                    ? 'bg-amber-500 text-black'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                            style={{ fontSize: size === 'large' ? '18px' : size === 'xlarge' ? '20px' : undefined }}
                        >
                            {size === 'xlarge' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Motion */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <label className="block text-white font-medium mb-3">Motion & Animations</label>
                <div className="space-y-2">
                    {([
                        { id: 'full', label: 'Full animations' },
                        { id: 'reduced', label: 'Reduced motion' },
                        { id: 'none', label: 'No animations' },
                    ] as { id: MotionPreference; label: string }[]).map(option => (
                        <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="motion"
                                checked={settings.motionPreference === option.id}
                                onChange={() => updateSettings({ motionPreference: option.id })}
                                className="text-amber-500"
                            />
                            <span className="text-zinc-300">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* High Contrast */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-medium">High Contrast</h4>
                        <p className="text-sm text-zinc-500">Increase color contrast for better visibility</p>
                    </div>
                    <button
                        role="switch"
                        aria-checked={settings.highContrast}
                        onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                        className={`w-12 h-6 rounded-full transition-colors ${settings.highContrast ? 'bg-amber-500' : 'bg-zinc-700'
                            }`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                    </button>
                </div>
            </div>

            {/* Screen Reader */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-medium">Screen Reader Announcements</h4>
                        <p className="text-sm text-zinc-500">Announce dynamic content changes</p>
                    </div>
                    <button
                        role="switch"
                        aria-checked={settings.screenReaderAnnouncements}
                        onClick={() => updateSettings({ screenReaderAnnouncements: !settings.screenReaderAnnouncements })}
                        className={`w-12 h-6 rounded-full transition-colors ${settings.screenReaderAnnouncements ? 'bg-amber-500' : 'bg-zinc-700'
                            }`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.screenReaderAnnouncements ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default {
    AccessibilityProvider,
    useAccessibility,
    SkipLink,
    LiveRegion,
    FocusTrap,
    AccessibleTooltip,
    KeyboardShortcuts,
    ShortcutsHelp,
    AccessibilitySettingsPanel,
};
