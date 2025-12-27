/**
 * Test Utilities for Mobile Responsive Tests
 *
 * Provides helpers for setting up test environments, mocking services,
 * and simulating different viewport sizes.
 */

import * as React from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {Context} from '../shared/context';
import {mockRouterContext, mockVersion} from './mock-data';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithContext(
    ui: React.ReactElement,
    {
        context = mockRouterContext,
        ...renderOptions
    }: {context?: any} & Omit<RenderOptions, 'wrapper'> = {}
) {
    const Wrapper = ({children}: {children: React.ReactNode}) => (
        <Context.Provider value={context}>{children}</Context.Provider>
    );

    return render(ui, {wrapper: Wrapper, ...renderOptions});
}

/**
 * Mock window.matchMedia for viewport testing
 */
export function mockMatchMedia(width: number) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
            matches: evaluateMediaQuery(query, width),
            media: query,
            onchange: null,
            addListener: jest.fn(), // Deprecated
            removeListener: jest.fn(), // Deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }))
    });
}

/**
 * Evaluate media query against a viewport width
 */
function evaluateMediaQuery(query: string, width: number): boolean {
    // Extract max-width or min-width from query
    const maxWidthMatch = query.match(/max-width:\s*(\d+)px/);
    const minWidthMatch = query.match(/min-width:\s*(\d+)px/);

    if (maxWidthMatch) {
        const maxWidth = parseInt(maxWidthMatch[1], 10);
        return width <= maxWidth;
    }

    if (minWidthMatch) {
        const minWidth = parseInt(minWidthMatch[1], 10);
        return width >= minWidth;
    }

    return false;
}

/**
 * Set viewport size for testing
 */
export function setViewportSize(width: number, height: number = 800) {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width
    });

    Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height
    });

    // Update matchMedia to reflect new viewport
    mockMatchMedia(width);

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
}

/**
 * Common viewport sizes for testing
 */
export const VIEWPORTS = {
    MOBILE: {
        IPHONE_SE: {width: 375, height: 667, name: 'iPhone SE'},
        IPHONE_12: {width: 390, height: 844, name: 'iPhone 12'},
        IPHONE_12_PRO_MAX: {width: 428, height: 926, name: 'iPhone 12 Pro Max'},
        GALAXY_S21: {width: 360, height: 800, name: 'Samsung Galaxy S21'},
        PIXEL_5: {width: 393, height: 851, name: 'Google Pixel 5'}
    },
    TABLET: {
        IPAD_MINI: {width: 768, height: 1024, name: 'iPad Mini'},
        IPAD_AIR: {width: 820, height: 1180, name: 'iPad Air'},
        IPAD_PRO_11: {width: 834, height: 1194, name: 'iPad Pro 11"'}
    },
    DESKTOP: {
        HD: {width: 1920, height: 1080, name: '1920x1080 (HD)'},
        QHD: {width: 2560, height: 1440, name: '2560x1440 (QHD)'},
        UHD: {width: 3840, height: 2160, name: '3840x2160 (4K)'}
    }
};

/**
 * Mock services used by ArgoCD UI
 */
export function createMockServices() {
    return {
        version: {
            version: jest.fn().mockResolvedValue(mockVersion)
        },
        viewPreferences: {
            updatePreferences: jest.fn(),
            getPreferences: jest.fn()
        },
        applications: {
            list: jest.fn().mockResolvedValue({items: []}),
            get: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            sync: jest.fn(),
            watch: jest.fn()
        }
    };
}

/**
 * Wait for async updates (replaces act() in most cases)
 */
export function waitForAsync() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Simulate touch event
 */
export function simulateTouch(element: Element, type: 'touchstart' | 'touchend' | 'touchmove') {
    const touchEvent = new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        touches: [{
            identifier: Date.now(),
            target: element,
            clientX: 0,
            clientY: 0,
            screenX: 0,
            screenY: 0,
            pageX: 0,
            pageY: 0,
            radiusX: 0,
            radiusY: 0,
            rotationAngle: 0,
            force: 1
        }] as any
    });

    element.dispatchEvent(touchEvent);
}

/**
 * Check if element meets touch target size requirements (44px minimum)
 */
export function isTouchFriendly(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const MIN_TOUCH_TARGET = 44;

    return rect.width >= MIN_TOUCH_TARGET && rect.height >= MIN_TOUCH_TARGET;
}

/**
 * Viewport test helper - runs test at specific viewport
 */
export function testAtViewport(
    viewportName: string,
    viewport: {width: number; height: number},
    testFn: () => void | Promise<void>
) {
    return () => {
        setViewportSize(viewport.width, viewport.height);
        return testFn();
    };
}

/**
 * Re-export commonly used testing utilities
 */
export {screen, fireEvent, waitFor} from '@testing-library/react';
export {default as userEvent} from '@testing-library/user-event';
