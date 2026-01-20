/**
 * Marketplace Service Barrel Export
 */

export * from './types';
export * from './cache';
export * from './normalizer';
export * from './scoring';
export { marketplaceAggregator } from './aggregator';

// Source exports
export { slickdealsFetcher } from './sources/slickdeals';
export { dealNewsFetcher } from './sources/dealnews';
export { ebayFetcher } from './sources/ebay';
export { craigslistFetcher, CraigslistFetcher } from './sources/craigslist';
