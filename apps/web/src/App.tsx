import { Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductPage } from './pages/ProductPage';
import { ResultsPage } from './pages/ResultsPage';
import { BrowsePage } from './pages/BrowsePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DealsPage } from './pages/DealsPage';
import { SearchPage } from './pages/SearchPage';
import { DealDetailPage } from './pages/DealDetailPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CategoryPage } from './pages/CategoryPage';
import { AccountPage } from './pages/AccountPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import SellerDashboard from './pages/SellerDashboard';
import CreateListing from './pages/CreateListing';
import Checkout from './pages/Checkout';
import LocalDeals from './pages/LocalDeals';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import MessagesPage from './pages/MessagesPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import DiscoverPage from './pages/DiscoverPage';
import SavedSearchesPage from './pages/SavedSearchesPage';
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
                        <Route path="watchlist" element={<AnimatedPage><WatchlistPage /></AnimatedPage>} />
                        <Route path="category/:category" element={<AnimatedPage><CategoryPage /></AnimatedPage>} />

                        {/* AI & Account */}
                        <Route path="assistant" element={<AnimatedPage><AIAssistantPage /></AnimatedPage>} />
                        <Route path="ai" element={<AnimatedPage><AIAssistantPage /></AnimatedPage>} />
                        <Route path="account" element={<AnimatedPage><AccountPage /></AnimatedPage>} />
                        <Route path="analytics" element={<AnimatedPage><AnalyticsDashboard /></AnimatedPage>} />

                        {/* P2P Marketplace */}
                        <Route path="sell" element={<AnimatedPage><SellerDashboard /></AnimatedPage>} />
                        <Route path="sell/create" element={<AnimatedPage><CreateListing /></AnimatedPage>} />
                        <Route path="checkout/:listingId" element={<AnimatedPage><Checkout /></AnimatedPage>} />
                        <Route path="local" element={<AnimatedPage><LocalDeals /></AnimatedPage>} />
                        <Route path="marketplace" element={<AnimatedPage><Marketplace /></AnimatedPage>} />
                        <Route path="listing/:id" element={<AnimatedPage><ListingDetail /></AnimatedPage>} />
                        <Route path="messages" element={<AnimatedPage><MessagesPage /></AnimatedPage>} />
                        <Route path="orders" element={<AnimatedPage><OrdersPage /></AnimatedPage>} />
                        <Route path="profile/:userId" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
                        <Route path="notifications" element={<AnimatedPage><NotificationsPage /></AnimatedPage>} />
                        <Route path="discover" element={<AnimatedPage><DiscoverPage /></AnimatedPage>} />
                        <Route path="saved-searches" element={<AnimatedPage><SavedSearchesPage /></AnimatedPage>} />

                        {/* Legacy Routes */}
                        <Route path="browse" element={<AnimatedPage><BrowsePage /></AnimatedPage>} />
                        <Route path="how-it-works" element={<AnimatedPage><HowItWorksPage /></AnimatedPage>} />
                        <Route path="results" element={<AnimatedPage><ResultsPage /></AnimatedPage>} />
                        <Route path="product/:id" element={<AnimatedPage><ProductPage /></AnimatedPage>} />

                        {/* 404 Catch All */}
                        <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
                    </Route>
                </Routes>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
