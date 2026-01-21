import { Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { ResultsPage } from './pages/ResultsPage';
import { BrowsePage } from './pages/BrowsePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DealsPage } from './pages/DealsPage';
import { SearchPage } from './pages/SearchPage';
import { DealDetailPage } from './pages/DealDetailPage';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Premium page transition variants
const pageVariants = {
    initial: { opacity: 0, y: 12, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.99 }
};

const pageTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    duration: 0.25
};

// Animated page wrapper with premium feel
function AnimatedPage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
}

function App() {
    const location = useLocation();

    return (
        <ErrorBoundary>
            <ToastProvider>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Layout />}>
                        {/* Deal Aggregator (Primary Experience) */}
                        <Route index element={<AnimatedPage><DealsPage /></AnimatedPage>} />
                        <Route path="deals" element={<AnimatedPage><DealsPage /></AnimatedPage>} />
                        <Route path="search" element={<AnimatedPage><SearchPage /></AnimatedPage>} />
                        <Route path="deal/:id" element={<AnimatedPage><DealDetailPage /></AnimatedPage>} />

                        {/* Product Research */}
                        <Route path="assistant" element={<AnimatedPage><HomePage /></AnimatedPage>} />
                        <Route path="browse" element={<AnimatedPage><BrowsePage /></AnimatedPage>} />
                        <Route path="how-it-works" element={<AnimatedPage><HowItWorksPage /></AnimatedPage>} />
                        <Route path="results" element={<AnimatedPage><ResultsPage /></AnimatedPage>} />
                        <Route path="product/:id" element={<AnimatedPage><ProductPage /></AnimatedPage>} />
                    </Route>
                </Routes>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
