/**
 * Design System - Main Export
 * Centralized export for all design system functionality
 */

// Core
export * from './core/types';
export * from './core/tokens';

// Adapters
export { muiAdapter } from './adapters/mui';
export { higAdapter } from './adapters/hig';
export { fluentAdapter } from './adapters/fluent';
export { shadcnAdapter } from './adapters/shadcn';

// Persistence
export * from './persistence';

// Provider
export { DesignSystemProvider, useDesignSystem } from './provider';
