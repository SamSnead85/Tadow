/**
 * Extended Demo Tech Deals Database - 100+ Products
 * Comprehensive product inventory for Tadow platform
 */

import { DEMO_DEALS, getDealById, getSimilarDeals, getHotDeals, getAllTimeLowDeals } from './demoDeals';
import type { TechDeal } from './demoDeals';

// Re-export base functions and type
export type { TechDeal };
export { getDealById, getSimilarDeals, getHotDeals, getAllTimeLowDeals };

// Marketplace configs (including Samsung)
const MP = {
    amazon: { id: 'amazon', name: 'Amazon', color: '#FF9900', baseUrl: 'https://amazon.com' },
    bestbuy: { id: 'bestbuy', name: 'Best Buy', color: '#0046BE', baseUrl: 'https://bestbuy.com' },
    walmart: { id: 'walmart', name: 'Walmart', color: '#0071CE', baseUrl: 'https://walmart.com' },
    target: { id: 'target', name: 'Target', color: '#CC0000', baseUrl: 'https://target.com' },
    apple: { id: 'apple', name: 'Apple Store', color: '#555555', baseUrl: 'https://apple.com' },
    newegg: { id: 'newegg', name: 'Newegg', color: '#F7941D', baseUrl: 'https://newegg.com' },
    bh: { id: 'bh', name: 'B&H Photo', color: '#2B2B2B', baseUrl: 'https://bhphotovideo.com' },
    costco: { id: 'costco', name: 'Costco', color: '#E31837', baseUrl: 'https://costco.com' },
    microcenter: { id: 'microcenter', name: 'Micro Center', color: '#D02020', baseUrl: 'https://microcenter.com' },
    samsung: { id: 'samsung', name: 'Samsung', color: '#1428A0', baseUrl: 'https://samsung.com' },
};

// Price history generator
function genHistory(price: number, days = 30): Array<{ price: number; recordedAt: string }> {
    return Array.from({ length: days + 1 }, (_, i) => ({
        price: i === days ? price : Math.round(price * (1 + (Math.random() - 0.5) * 0.15)),
        recordedAt: new Date(Date.now() - (days - i) * 86400000).toISOString(),
    }));
}

// Deal template generator
function deal(id: string, title: string, cat: string, brand: string, orig: number, curr: number, mp: typeof MP.amazon, opts: Partial<TechDeal> = {}): TechDeal {
    const discount = Math.round((1 - curr / orig) * 100);
    return {
        id, title, category: cat, brand,
        description: opts.description || `Premium ${brand} ${cat.toLowerCase()} with excellent features and value.`,
        imageUrl: opts.imageUrl || `https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800`,
        originalPrice: orig, currentPrice: curr, discountPercent: discount,
        condition: 'New', dealScore: opts.dealScore || Math.min(99, 70 + discount),
        aiVerdict: discount >= 25 ? 'Incredible Deal' : discount >= 15 ? 'Great Deal' : 'Good Deal',
        priceVsAverage: -discount, isHot: opts.isHot || discount >= 20,
        isFeatured: opts.isFeatured || false, isAllTimeLow: opts.isAllTimeLow || discount >= 25,
        allTimeLowPrice: curr, historicHighPrice: Math.round(orig * 1.1),
        pricePrediction: opts.pricePrediction || 'stable', priceDropPercent30d: discount,
        fakeReviewRisk: 5, reviewQualityScore: 92, verifiedPurchasePercent: 88,
        city: 'New York', state: 'NY',
        externalUrl: `${mp.baseUrl}/${id}`, views: Math.floor(Math.random() * 50000) + 1000,
        saves: Math.floor(Math.random() * 5000) + 100,
        postedAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        sellerName: mp.name, sellerRating: 4.7, sellerReviews: 100000,
        isVerifiedSeller: true, marketplace: mp, priceHistory: genHistory(curr),
        ...opts,
    };
}

// === EXTENDED DEALS DATABASE ===
export const EXTENDED_DEALS: TechDeal[] = [
    ...DEMO_DEALS,

    // LAPTOPS (15 more)
    deal('laptop-1', 'MacBook Air M3 15" - 256GB SSD, Midnight', 'Laptops', 'Apple', 1299, 1099, MP.apple, { isFeatured: true, isHot: true }),
    deal('laptop-2', 'ASUS ROG Strix G16 Gaming Laptop - RTX 4070', 'Laptops', 'ASUS', 1799, 1399, MP.newegg, { isHot: true }),
    deal('laptop-3', 'Lenovo ThinkPad X1 Carbon Gen 11', 'Laptops', 'Lenovo', 1849, 1449, MP.amazon),
    deal('laptop-4', 'HP Spectre x360 16 - Intel Core Ultra 7', 'Laptops', 'HP', 1699, 1349, MP.bestbuy),
    deal('laptop-5', 'Razer Blade 15 - RTX 4080, 240Hz QHD', 'Laptops', 'Razer', 2999, 2299, MP.amazon, { isHot: true }),
    deal('laptop-6', 'Microsoft Surface Laptop 6 - 13.5"', 'Laptops', 'Microsoft', 1299, 999, MP.bestbuy),
    deal('laptop-7', 'Acer Swift Go 14 - Intel Core Ultra 5', 'Laptops', 'Acer', 899, 699, MP.walmart),
    deal('laptop-8', 'Dell Inspiron 16 Plus - RTX 3050', 'Laptops', 'Dell', 1199, 899, MP.costco),
    deal('laptop-9', 'Framework Laptop 16 - Modular Gaming', 'Laptops', 'Framework', 1699, 1499, MP.amazon),
    deal('laptop-10', 'ASUS Zenbook 14 OLED - AMD Ryzen 7', 'Laptops', 'ASUS', 1099, 849, MP.newegg),
    deal('laptop-11', 'MSI Creator Z16 - RTX 4060', 'Laptops', 'MSI', 2099, 1699, MP.bh),
    deal('laptop-12', 'Lenovo Legion Pro 5i - RTX 4070', 'Laptops', 'Lenovo', 1699, 1299, MP.microcenter, { isHot: true }),
    deal('laptop-13', 'Samsung Galaxy Book4 Ultra', 'Laptops', 'Samsung', 2399, 1899, MP.samsung),
    deal('laptop-14', 'HP Omen 16 - RTX 4080', 'Laptops', 'HP', 2199, 1699, MP.bestbuy),
    deal('laptop-15', 'Gigabyte AERO 16 OLED - Creator Laptop', 'Laptops', 'Gigabyte', 1999, 1499, MP.newegg),

    // PHONES (15 more)
    deal('phone-1', 'Google Pixel 8 Pro 256GB - Bay', 'Phones', 'Google', 999, 799, MP.amazon, { isHot: true }),
    deal('phone-2', 'iPhone 15 Plus 256GB - Pink', 'Phones', 'Apple', 999, 899, MP.apple),
    deal('phone-3', 'Samsung Galaxy Z Fold 5 512GB', 'Phones', 'Samsung', 1919, 1499, MP.amazon, { isHot: true, isFeatured: true }),
    deal('phone-4', 'OnePlus 12 256GB - Flowy Emerald', 'Phones', 'OnePlus', 799, 649, MP.amazon),
    deal('phone-5', 'Samsung Galaxy Z Flip 5 256GB', 'Phones', 'Samsung', 999, 799, MP.bestbuy),
    deal('phone-6', 'Google Pixel 8a 128GB - Porcelain', 'Phones', 'Google', 499, 399, MP.target),
    deal('phone-7', 'iPhone SE (3rd Gen) 128GB', 'Phones', 'Apple', 429, 329, MP.walmart),
    deal('phone-8', 'Motorola Edge+ 2024 512GB', 'Phones', 'Motorola', 799, 549, MP.amazon),
    deal('phone-9', 'Nothing Phone (2) 256GB', 'Phones', 'Nothing', 599, 449, MP.amazon),
    deal('phone-10', 'Samsung Galaxy A55 5G 128GB', 'Phones', 'Samsung', 449, 349, MP.target),
    deal('phone-11', 'iPhone 14 128GB - Starlight', 'Phones', 'Apple', 699, 549, MP.amazon),
    deal('phone-12', 'Google Pixel 7a 128GB', 'Phones', 'Google', 449, 329, MP.bestbuy, { isHot: true }),
    deal('phone-13', 'Samsung Galaxy S23 FE 256GB', 'Phones', 'Samsung', 599, 449, MP.amazon),
    deal('phone-14', 'OnePlus Nord N30 5G 128GB', 'Phones', 'OnePlus', 299, 199, MP.walmart),
    deal('phone-15', 'Xiaomi 14 Ultra 512GB', 'Phones', 'Xiaomi', 1299, 999, MP.amazon),

    // GAMING (15 more)
    deal('gaming-1', 'Xbox Series X 1TB Console', 'Gaming', 'Microsoft', 499, 449, MP.target),
    deal('gaming-2', 'Steam Deck OLED 1TB', 'Gaming', 'Valve', 649, 549, MP.amazon, { isHot: true, isFeatured: true }),
    deal('gaming-3', 'ASUS ROG Ally Z1 Extreme', 'Gaming', 'ASUS', 699, 549, MP.bestbuy, { isHot: true }),
    deal('gaming-4', 'Meta Quest 3 512GB VR Headset', 'Gaming', 'Meta', 649, 499, MP.amazon, { isHot: true }),
    deal('gaming-5', 'PlayStation VR2 Headset', 'Gaming', 'Sony', 549, 449, MP.target),
    deal('gaming-6', 'Nintendo Switch Lite - Coral', 'Gaming', 'Nintendo', 199, 169, MP.walmart),
    deal('gaming-7', 'Xbox Elite Controller Series 2', 'Gaming', 'Microsoft', 179, 139, MP.bestbuy),
    deal('gaming-8', 'Sony DualSense Edge Controller', 'Gaming', 'Sony', 199, 159, MP.amazon),
    deal('gaming-9', 'Logitech G Pro X Superlight 2', 'Gaming', 'Logitech', 159, 129, MP.amazon),
    deal('gaming-10', 'Razer BlackWidow V4 Pro Keyboard', 'Gaming', 'Razer', 229, 179, MP.bestbuy),
    deal('gaming-11', 'SteelSeries Arctis Nova Pro Wireless', 'Gaming', 'SteelSeries', 349, 279, MP.amazon, { isHot: true }),
    deal('gaming-12', 'NVIDIA GeForce RTX 4090 Founders', 'Gaming', 'NVIDIA', 1599, 1499, MP.newegg),
    deal('gaming-13', 'AMD Radeon RX 7900 XTX', 'Gaming', 'AMD', 999, 849, MP.microcenter, { isHot: true }),
    deal('gaming-14', 'Elgato Stream Deck MK.2', 'Gaming', 'Elgato', 149, 119, MP.amazon),
    deal('gaming-15', 'Corsair K100 RGB Keyboard', 'Gaming', 'Corsair', 229, 179, MP.bestbuy),

    // AUDIO (15 more)
    deal('audio-1', 'Bose QuietComfort Ultra Headphones', 'Audio', 'Bose', 429, 349, MP.amazon, { isHot: true }),
    deal('audio-2', 'Samsung Galaxy Buds3 Pro', 'Audio', 'Samsung', 249, 189, MP.bestbuy),
    deal('audio-3', 'Sonos Era 300 Speaker', 'Audio', 'Sonos', 449, 379, MP.target),
    deal('audio-4', 'JBL Charge 5 Bluetooth Speaker', 'Audio', 'JBL', 179, 129, MP.amazon),
    deal('audio-5', 'Beats Studio Pro Headphones', 'Audio', 'Beats', 349, 249, MP.apple, { isHot: true }),
    deal('audio-6', 'Sennheiser Momentum 4 Wireless', 'Audio', 'Sennheiser', 379, 299, MP.bh),
    deal('audio-7', 'Bose SoundLink Max Speaker', 'Audio', 'Bose', 399, 329, MP.amazon),
    deal('audio-8', 'Apple HomePod (2nd Gen)', 'Audio', 'Apple', 299, 249, MP.apple),
    deal('audio-9', 'Sony LinkBuds S Earbuds', 'Audio', 'Sony', 199, 128, MP.amazon, { isHot: true }),
    deal('audio-10', 'Jabra Elite 85t True Wireless', 'Audio', 'Jabra', 229, 149, MP.bestbuy),
    deal('audio-11', 'Marshall Emberton II Speaker', 'Audio', 'Marshall', 169, 129, MP.amazon),
    deal('audio-12', 'Bang & Olufsen Beoplay EX', 'Audio', 'B&O', 399, 299, MP.bh),
    deal('audio-13', 'Anker Soundcore Space One', 'Audio', 'Anker', 99, 69, MP.amazon),
    deal('audio-14', 'Shure SE846 Pro Earphones', 'Audio', 'Shure', 999, 749, MP.bh),
    deal('audio-15', 'KEF LSX II Wireless Speakers', 'Audio', 'KEF', 1399, 1099, MP.amazon),

    // TVs (10 more)
    deal('tv-1', 'Samsung 65" Neo QLED 4K QN90C', 'TVs', 'Samsung', 2299, 1599, MP.amazon, { isHot: true, isFeatured: true }),
    deal('tv-2', 'Sony 55" A95L QD-OLED 4K', 'TVs', 'Sony', 2799, 2299, MP.bestbuy),
    deal('tv-3', 'TCL 75" Q6 QLED 4K Smart TV', 'TVs', 'TCL', 899, 599, MP.walmart, { isHot: true }),
    deal('tv-4', 'Hisense 65" U8K Mini-LED', 'TVs', 'Hisense', 1199, 849, MP.amazon),
    deal('tv-5', 'LG 55" B4 Series OLED 4K', 'TVs', 'LG', 1499, 1099, MP.costco),
    deal('tv-6', 'Sony 75" X90L 4K Google TV', 'TVs', 'Sony', 1999, 1499, MP.bestbuy),
    deal('tv-7', 'Samsung 50" Frame TV QLED', 'TVs', 'Samsung', 1299, 999, MP.amazon),
    deal('tv-8', 'Vizio 65" MQX M-Series QLED', 'TVs', 'Vizio', 899, 649, MP.target),
    deal('tv-9', 'LG 77" G4 OLED evo Gallery', 'TVs', 'LG', 3499, 2799, MP.bestbuy, { isFeatured: true }),
    deal('tv-10', 'Samsung 85" QN85D Neo QLED', 'TVs', 'Samsung', 3499, 2699, MP.costco),

    // TABLETS (10 more)
    deal('tablet-1', 'iPad Air M2 11" 256GB', 'Tablets', 'Apple', 699, 599, MP.apple),
    deal('tablet-2', 'Samsung Galaxy Tab S9 Ultra', 'Tablets', 'Samsung', 1199, 899, MP.amazon, { isHot: true }),
    deal('tablet-3', 'Microsoft Surface Pro 10', 'Tablets', 'Microsoft', 1599, 1299, MP.bestbuy),
    deal('tablet-4', 'iPad (10th Gen) 256GB', 'Tablets', 'Apple', 549, 449, MP.target),
    deal('tablet-5', 'Samsung Galaxy Tab S9 FE+', 'Tablets', 'Samsung', 599, 449, MP.amazon),
    deal('tablet-6', 'Lenovo Tab P12 Pro', 'Tablets', 'Lenovo', 679, 499, MP.amazon),
    deal('tablet-7', 'Amazon Fire Max 11 Tablet', 'Tablets', 'Amazon', 279, 199, MP.amazon, { isHot: true }),
    deal('tablet-8', 'OnePlus Pad 128GB', 'Tablets', 'OnePlus', 479, 379, MP.amazon),
    deal('tablet-9', 'Google Pixel Tablet 256GB', 'Tablets', 'Google', 599, 449, MP.bestbuy),
    deal('tablet-10', 'iPad mini (6th Gen) 256GB', 'Tablets', 'Apple', 599, 499, MP.apple),

    // WEARABLES (10 new)
    deal('wear-1', 'Apple Watch Ultra 2 49mm', 'Wearables', 'Apple', 799, 699, MP.apple, { isHot: true }),
    deal('wear-2', 'Samsung Galaxy Watch 6 Classic', 'Wearables', 'Samsung', 429, 329, MP.amazon),
    deal('wear-3', 'Apple Watch Series 9 GPS 45mm', 'Wearables', 'Apple', 429, 349, MP.target),
    deal('wear-4', 'Garmin Fenix 7X Solar', 'Wearables', 'Garmin', 999, 749, MP.amazon, { isHot: true }),
    deal('wear-5', 'Fitbit Sense 2 Health Watch', 'Wearables', 'Fitbit', 299, 199, MP.bestbuy),
    deal('wear-6', 'Oura Ring Gen 3 Heritage', 'Wearables', 'Oura', 349, 299, MP.amazon),
    deal('wear-7', 'Google Pixel Watch 2 LTE', 'Wearables', 'Google', 399, 299, MP.bestbuy),
    deal('wear-8', 'Whoop 4.0 Fitness Band', 'Wearables', 'Whoop', 239, 199, MP.amazon),
    deal('wear-9', 'Amazfit GTR 4 Smartwatch', 'Wearables', 'Amazfit', 199, 149, MP.amazon),
    deal('wear-10', 'Samsung Galaxy Ring', 'Wearables', 'Samsung', 399, 349, MP.bestbuy),

    // CAMERAS (10 new)
    deal('cam-1', 'Sony A7 IV Mirrorless Camera Body', 'Cameras', 'Sony', 2499, 1998, MP.bh, { isHot: true, isFeatured: true }),
    deal('cam-2', 'Canon EOS R6 Mark II Body', 'Cameras', 'Canon', 2499, 2099, MP.amazon),
    deal('cam-3', 'GoPro HERO12 Black', 'Cameras', 'GoPro', 399, 299, MP.bestbuy, { isHot: true }),
    deal('cam-4', 'DJI Osmo Pocket 3', 'Cameras', 'DJI', 519, 449, MP.amazon),
    deal('cam-5', 'Fujifilm X100VI Digital Camera', 'Cameras', 'Fujifilm', 1599, 1399, MP.bh),
    deal('cam-6', 'Sony ZV-E10 II Vlogging Kit', 'Cameras', 'Sony', 899, 749, MP.amazon),
    deal('cam-7', 'Nikon Z8 Mirrorless Body', 'Cameras', 'Nikon', 3999, 3499, MP.bh),
    deal('cam-8', 'DJI Mini 4 Pro Drone', 'Cameras', 'DJI', 759, 649, MP.amazon, { isHot: true }),
    deal('cam-9', 'Insta360 X4 360 Camera', 'Cameras', 'Insta360', 499, 399, MP.amazon),
    deal('cam-10', 'Canon PowerShot V10 Vlog', 'Cameras', 'Canon', 429, 349, MP.bestbuy),

    // HOME TECH (10 new)
    deal('home-1', 'Dyson V15 Detect Absolute', 'Home', 'Dyson', 749, 549, MP.amazon, { isHot: true }),
    deal('home-2', 'iRobot Roomba j9+ Combo', 'Home', 'iRobot', 1399, 999, MP.amazon, { isHot: true }),
    deal('home-3', 'Philips Hue Starter Kit A19', 'Home', 'Philips', 199, 149, MP.bestbuy),
    deal('home-4', 'Ring Video Doorbell Pro 2', 'Home', 'Ring', 249, 179, MP.amazon),
    deal('home-5', 'ecobee Smart Thermostat Premium', 'Home', 'ecobee', 249, 199, MP.target),
    deal('home-6', 'Nest Learning Thermostat 4th Gen', 'Home', 'Google', 279, 219, MP.bestbuy),
    deal('home-7', 'August Smart Lock Pro + Connect', 'Home', 'August', 279, 199, MP.amazon),
    deal('home-8', 'Arlo Pro 5S 2K 3-Camera System', 'Home', 'Arlo', 599, 449, MP.costco),
    deal('home-9', 'Nanoleaf Shapes Hexagon 15-Pack', 'Home', 'Nanoleaf', 299, 229, MP.amazon),
    deal('home-10', 'Shark AI Ultra Robot Vacuum', 'Home', 'Shark', 599, 399, MP.walmart, { isHot: true }),
];

// Total: 12 (original) + 15+15+15+15+10+10+10+10+10 = 112 deals

// Export combined deals
export const ALL_DEALS = EXTENDED_DEALS;

// Category helpers
export const getByCategory = (cat: string, limit = 20) => ALL_DEALS.filter(d => d.category === cat).slice(0, limit);
export const getByBrand = (brand: string, limit = 20) => ALL_DEALS.filter(d => d.brand === brand).slice(0, limit);
export const getFeatured = (limit = 10) => ALL_DEALS.filter(d => d.isFeatured).slice(0, limit);
export const getTrending = (limit = 10) => ALL_DEALS.filter(d => d.isHot).sort((a, b) => b.views - a.views).slice(0, limit);
export const getCategories = () => [...new Set(ALL_DEALS.map(d => d.category))];
export const getBrands = () => [...new Set(ALL_DEALS.map(d => d.brand))];
