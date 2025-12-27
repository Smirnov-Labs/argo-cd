import * as React from 'react';
import '@testing-library/jest-dom';
import {Sidebar} from './sidebar';
import {Context} from '../shared/context';
import {
    renderWithContext,
    setViewportSize,
    VIEWPORTS,
    screen,
    fireEvent,
    waitFor
} from '../__tests__/test-utils';
import {
    mockRouterContext,
    mockNavItems,
    mockViewPreferences,
    mockVersion
} from '../__tests__/mock-data';

// Mock the services
jest.mock('../shared/services', () => ({
    services: {
        version: {
            version: jest.fn().mockResolvedValue(mockVersion)
        },
        viewPreferences: {
            updatePreferences: jest.fn()
        }
    },
    ViewPreferences: {}
}));

// Mock argo-ui components
jest.mock('argo-ui', () => ({
    Tooltip: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    useData: (fn: () => Promise<any>) => {
        const [data, setData] = React.useState<any>(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState<any>(null);

        React.useEffect(() => {
            fn().then(result => {
                setData(result);
                setLoading(false);
            }).catch(err => {
                setError(err);
                setLoading(false);
            });
        }, []);

        return [data, loading, error];
    }
}));

describe('Sidebar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set desktop viewport by default
        setViewportSize(VIEWPORTS.DESKTOP.HD.width, VIEWPORTS.DESKTOP.HD.height);
    });

    describe('Desktop Behavior', () => {
        test('renders sidebar with navigation items', () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            expect(screen.getByText('Applications')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });

        test('renders version number', async () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            await waitFor(() => {
                expect(screen.getByText(mockVersion.Version)).toBeInTheDocument();
            });
        });

        test('applies collapsed class when hideSidebar is true', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.sidebarCollapsed} onVersionClick={() => {}} />
            );

            const sidebar = container.querySelector('.sidebar');
            expect(sidebar).toHaveClass('sidebar--collapsed');
        });
    });

    describe('Mobile Menu Behavior', () => {
        beforeEach(() => {
            // Set mobile viewport for these tests
            setViewportSize(VIEWPORTS.MOBILE.IPHONE_12.width, VIEWPORTS.MOBILE.IPHONE_12.height);
        });

        test('renders mobile hamburger menu button', () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            expect(hamburgerButton).toBeInTheDocument();
            expect(hamburgerButton).toHaveClass('mobile-menu-button');
        });

        test('toggles mobile menu when hamburger button is clicked', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            const overlay = container.querySelector('.sidebar-overlay');

            // Initially, overlay should not be visible
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');

            // Click to open menu
            fireEvent.click(hamburgerButton);
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Click to close menu
            fireEvent.click(hamburgerButton);
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('closes mobile menu when overlay is clicked', () => {
            const {container} = render(
                <renderWithContext>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(hamburgerButton);
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Click overlay to close
            fireEvent.click(overlay!);
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('closes mobile menu when Escape key is pressed', () => {
            const {container} = render(
                <renderWithContext>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(hamburgerButton);
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Press Escape
            fireEvent.keyDown(window, {key: 'Escape', code: 'Escape'});
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('changes hamburger icon when menu is open', () => {
            render(
                <renderWithContext>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            let icon = hamburgerButton.querySelector('i');

            // Initially shows bars icon
            expect(icon).toHaveClass('fa-bars');

            // Click to open
            fireEvent.click(hamburgerButton);
            icon = hamburgerButton.querySelector('i');
            expect(icon).toHaveClass('fa-times');

            // Click to close
            fireEvent.click(hamburgerButton);
            icon = hamburgerButton.querySelector('i');
            expect(icon).toHaveClass('fa-bars');
        });

        test('mobile menu overrides hideSidebar preference', () => {
            const collapsedPrefs = {...mockViewPreferences.default, hideSidebar: true};
            const {container} = render(
                <renderWithContext>
                    <Sidebar navItems={mockNavItems} pref={collapsedPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            const sidebar = container.querySelector('.sidebar');

            // With hideSidebar true, sidebar should be collapsed
            expect(sidebar).toHaveClass('sidebar--collapsed');

            // Open mobile menu - should remove collapsed class
            fireEvent.click(hamburgerButton);
            expect(sidebar).not.toHaveClass('sidebar--collapsed');

            // Close mobile menu - should add collapsed class back
            fireEvent.click(hamburgerButton);
            expect(sidebar).toHaveClass('sidebar--collapsed');
        });
    });

    describe('Navigation Behavior', () => {
        test('closes mobile menu when navigation occurs', () => {
            const mockRouterContextWithNav = {
                history: {
                    location: {pathname: '/applications'},
                    push: jest.fn()
                }
            };

            const {container, rerender} = render(
                <Context.Provider value={mockRouterContextWithNav as any}>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(hamburgerButton);
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Simulate navigation by changing location
            mockRouterContextWithNav.history.location.pathname = '/settings';
            rerender(
                <Context.Provider value={mockRouterContextWithNav as any}>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            // Menu should auto-close on navigation
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('highlights active navigation item', () => {
            const {container} = render(
                <renderWithContext>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const navItems = container.querySelectorAll('.sidebar__nav-item');
            const applicationsItem = Array.from(navItems).find(item =>
                item.textContent?.includes('Applications')
            );

            expect(applicationsItem).toHaveClass('sidebar__nav-item--active');
        });
    });

    describe('Accessibility', () => {
        test('hamburger button has aria-label', () => {
            render(
                <renderWithContext>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            expect(hamburgerButton).toHaveAttribute('aria-label', 'Toggle menu');
        });

        test('keyboard navigation works with Escape key', () => {
            const {container} = render(
                <renderWithContext>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');

            // Open with click
            fireEvent.click(hamburgerButton);

            // Close with keyboard
            fireEvent.keyDown(window, {key: 'Escape'});

            const overlay = container.querySelector('.sidebar-overlay');
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });
    });
});
