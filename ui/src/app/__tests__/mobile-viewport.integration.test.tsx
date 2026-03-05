/**
 * Mobile Viewport Integration Tests
 *
 * These tests verify that the Sidebar and FiltersGroup components
 * render correctly across different viewport sizes.
 */

import * as React from 'react';
import '@testing-library/jest-dom';

jest.mock('../shared/services', () => ({
    services: {
        version: {version: jest.fn().mockResolvedValue({Version: '2.9.0'})},
        viewPreferences: {updatePreferences: jest.fn()}
    },
    ViewPreferences: {}
}));

jest.mock('argo-ui', () => ({
    Tooltip: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    useData: (fn: () => Promise<any>) => {
        const [data, setData] = React.useState<any>(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState<any>(null);
        React.useEffect(() => {
            fn()
                .then(result => {
                    setData(result);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err);
                    setLoading(false);
                });
        }, []);
        return [data, loading, error];
    }
}));

jest.mock('argo-ui/v2', () => ({
    Autocomplete: () => null,
    Checkbox: ({value, onChange}: any) => <input type='checkbox' checked={value} onChange={(e: any) => onChange?.(e.target.checked)} />,
    useData: (fn: () => Promise<any>) => {
        const [data, setData] = React.useState<any>(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState<any>(null);
        React.useEffect(() => {
            fn()
                .then(result => {
                    setData(result);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err);
                    setLoading(false);
                });
        }, []);
        return [data, loading, error];
    }
}));

import {renderWithContext, setViewportSize, VIEWPORTS, screen, fireEvent, waitFor} from './test-utils';
import {Sidebar} from '../sidebar/sidebar';
import {FiltersGroup} from '../applications/components/filter/filter';
import {mockNavItems, mockViewPreferences} from './mock-data';

const mobileViewports = Object.entries(VIEWPORTS.MOBILE);
const tabletViewports = Object.entries(VIEWPORTS.TABLET);
const desktopViewports = Object.entries(VIEWPORTS.DESKTOP);

describe('Mobile Viewport Integration Tests', () => {
    beforeEach(() => {
        // Ensure sidebar-tools target exists
        const el = document.createElement('div');
        el.id = 'sidebar-tools';
        document.body.appendChild(el);
    });

    afterEach(() => {
        const el = document.getElementById('sidebar-tools');
        if (el) el.remove();
    });

    describe('Sidebar renders at all mobile viewports', () => {
        it.each(mobileViewports)('%s: shows "Open menu" button and no visible overlay', async (_name, viewport) => {
            setViewportSize(viewport.width, viewport.height);

            renderWithContext(<Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={jest.fn()} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
            });

            // Overlay should exist but not be visible
            const overlay = document.querySelector('.sidebar-overlay');
            expect(overlay).toBeInTheDocument();
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });
    });

    describe('Sidebar menu open/close at all mobile viewports', () => {
        it.each(mobileViewports)('%s: opens and closes mobile menu with overlay toggle', async (_name, viewport) => {
            setViewportSize(viewport.width, viewport.height);

            renderWithContext(<Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={jest.fn()} />);

            // Open the menu
            const openButton = screen.getByLabelText('Open menu');
            fireEvent.click(openButton);

            await waitFor(() => {
                // Overlay becomes visible
                const overlay = document.querySelector('.sidebar-overlay');
                expect(overlay).toHaveClass('sidebar-overlay--visible');
                // Sidebar gets mobile-open class
                const sidebar = document.querySelector('.sidebar');
                expect(sidebar).toHaveClass('sidebar--mobile-open');
            });

            // Close the menu
            const closeButton = screen.getByLabelText('Close menu');
            fireEvent.click(closeButton);

            await waitFor(() => {
                const overlay = document.querySelector('.sidebar-overlay');
                expect(overlay).not.toHaveClass('sidebar-overlay--visible');
                const sidebar = document.querySelector('.sidebar');
                expect(sidebar).not.toHaveClass('sidebar--mobile-open');
            });
        });
    });

    describe('Desktop viewports render without mobile menu', () => {
        it.each(desktopViewports)('%s: renders nav items without mobile-open class', async (_name, viewport) => {
            setViewportSize(viewport.width, viewport.height);

            renderWithContext(<Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={jest.fn()} />);

            // Nav items should be rendered with their titles visible
            await waitFor(() => {
                for (const item of mockNavItems) {
                    expect(screen.getByText(item.title)).toBeInTheDocument();
                }
            });

            // Sidebar should not have mobile-open class
            const sidebar = document.querySelector('.sidebar');
            expect(sidebar).not.toHaveClass('sidebar--mobile-open');
        });
    });

    describe('FiltersGroup mobile toggle', () => {
        it('renders toggle button and toggles mobile-expanded class on click', () => {
            setViewportSize(VIEWPORTS.MOBILE.IPHONE_SE.width, VIEWPORTS.MOBILE.IPHONE_SE.height);

            const {container} = renderWithContext(<FiltersGroup content={<div>Filter content</div>} title='Test Filters' />);

            // Toggle button should exist
            const toggleButton = container.querySelector('.filters-group__mobile-toggle');
            expect(toggleButton).toBeInTheDocument();

            // Initially not expanded
            const filtersGroup = container.querySelector('.filters-group');
            expect(filtersGroup).not.toHaveClass('filters-group--mobile-expanded');

            // Click to expand
            fireEvent.click(toggleButton);
            expect(filtersGroup).toHaveClass('filters-group--mobile-expanded');

            // Click to collapse
            fireEvent.click(toggleButton);
            expect(filtersGroup).not.toHaveClass('filters-group--mobile-expanded');
        });
    });

    describe('Tablet viewports', () => {
        it.each(tabletViewports)('%s: renders Sidebar with nav items visible', async (_name, viewport) => {
            setViewportSize(viewport.width, viewport.height);

            renderWithContext(<Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={jest.fn()} />);

            await waitFor(() => {
                for (const item of mockNavItems) {
                    expect(screen.getByText(item.title)).toBeInTheDocument();
                }
            });
        });
    });
});
