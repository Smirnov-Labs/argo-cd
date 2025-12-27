import * as React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Sidebar} from './sidebar';
import {Context} from '../shared/context';
import {ViewPreferences} from '../shared/services';

// Mock the services
jest.mock('../shared/services', () => ({
    services: {
        version: {
            version: jest.fn().mockResolvedValue({Version: '2.0.0'})
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

const mockContext = {
    history: {
        location: {pathname: '/applications'},
        push: jest.fn()
    }
};

const mockNavItems = [
    {path: '/applications', iconClassName: 'fa fa-th', title: 'Applications'},
    {path: '/settings', iconClassName: 'fa fa-cog', title: 'Settings'}
];

const defaultPrefs: ViewPreferences = {
    hideSidebar: false,
    theme: 'light'
} as ViewPreferences;

describe('Sidebar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Desktop Behavior', () => {
        test('renders sidebar with navigation items', () => {
            render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            expect(screen.getByText('Applications')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });

        test('renders version number', async () => {
            render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            await waitFor(() => {
                expect(screen.getByText('2.0.0')).toBeInTheDocument();
            });
        });

        test('applies collapsed class when hideSidebar is true', () => {
            const collapsedPrefs = {...defaultPrefs, hideSidebar: true};
            const {container} = render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={collapsedPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const sidebar = container.querySelector('.sidebar');
            expect(sidebar).toHaveClass('sidebar--collapsed');
        });
    });

    describe('Mobile Menu Behavior', () => {
        test('renders mobile hamburger menu button', () => {
            render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            expect(hamburgerButton).toBeInTheDocument();
            expect(hamburgerButton).toHaveClass('mobile-menu-button');
        });

        test('toggles mobile menu when hamburger button is clicked', () => {
            const {container} = render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
                </Context.Provider>
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
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
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
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
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
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
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
            const collapsedPrefs = {...defaultPrefs, hideSidebar: true};
            const {container} = render(
                <Context.Provider value={mockContext as any}>
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
            const mockContextWithNav = {
                history: {
                    location: {pathname: '/applications'},
                    push: jest.fn()
                }
            };

            const {container, rerender} = render(
                <Context.Provider value={mockContextWithNav as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(hamburgerButton);
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Simulate navigation by changing location
            mockContextWithNav.history.location.pathname = '/settings';
            rerender(
                <Context.Provider value={mockContextWithNav as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            // Menu should auto-close on navigation
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('highlights active navigation item', () => {
            const {container} = render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
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
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const hamburgerButton = screen.getByLabelText('Toggle menu');
            expect(hamburgerButton).toHaveAttribute('aria-label', 'Toggle menu');
        });

        test('keyboard navigation works with Escape key', () => {
            const {container} = render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={defaultPrefs} onVersionClick={() => {}} />
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
