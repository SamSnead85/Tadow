import { Routes, Route } from 'react-router-dom';
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

function App() {
    return (
        <ToastProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Deal Aggregator (New Primary Experience) */}
                    <Route index element={<DealsPage />} />
                    <Route path="deals" element={<DealsPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="deal/:id" element={<DealDetailPage />} />

                    {/* Product Research (Original Verity) */}
                    <Route path="assistant" element={<HomePage />} />
                    <Route path="browse" element={<BrowsePage />} />
                    <Route path="how-it-works" element={<HowItWorksPage />} />
                    <Route path="results" element={<ResultsPage />} />
                    <Route path="product/:id" element={<ProductPage />} />
                </Route>
            </Routes>
        </ToastProvider>
    );
}

export default App;
