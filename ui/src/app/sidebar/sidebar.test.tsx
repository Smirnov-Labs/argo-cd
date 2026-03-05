import * as React from 'react';
import '@testing-library/jest-dom';
import {Sidebar} from './sidebar';
import {Context} from '../shared/context';
import {render} from '@testing-library/react';
import {renderWithContext, setViewportSize, VIEWPORTS, screen, fireEvent, waitFor} from '../__tests__/test-utils';
import {mockNavItems, mockViewPreferences, mockVersion} from '../__tests__/mock-data';

// Mock services (inline version value to avoid hoisting issues with mockVersion)
jest.mock('../shared/services', () => ({
    services: {
        version: {
            version: jest.fn().mockResolvedValue({
                Version: '2.9.0',
                BuildDate: '2023-11-15T12:00:00Z',
                GitCommit: 'abc123def456',
                GoVersion: 'go1.21.0',
                Compiler: 'gc',
                Platform: 'linux/amd64'
            })
        },
        viewPreferences: {
            updatePreferences: jest.fn()
        }
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
            fn().then(result => { setData(result); setLoading(false); })
              .catch(err => { setError(err); setLoading(false); });
        }, []);
        return [data, loading, error];
    }
}));

describe('Sidebar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setViewportSize(VIEWPORTS.DESKTOP.HD.width, VIEWPORTS.DESKTOP.HD.height);
    });

    describe('Desktop Behavior', () => {
        test('renders sidebar with navigation items', () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            expect(screen.getByText('Applications')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Help')).toBeInTheDocument();
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
            setViewportSize(VIEWPORTS.MOBILE.IPHONE_12.width, VIEWPORTS.MOBILE.IPHONE_12.height);
        });

        test('renders mobile open menu button', () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const openButton = screen.getByLabelText('Open menu');
            expect(openButton).toBeInTheDocument();
            expect(openButton).toHaveClass('mobile-menu-button');
        });

        test('opens menu when open button is clicked', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const overlay = container.querySelector('.sidebar-overlay');
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');

            fireEvent.click(screen.getByLabelText('Open menu'));
            expect(overlay).toHaveClass('sidebar-overlay--visible');
        });

        test('closes menu via close button', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(screen.getByLabelText('Open menu'));
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Close menu via close button
            fireEvent.click(screen.getByLabelText('Close menu'));
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('closes mobile menu when overlay is clicked', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(screen.getByLabelText('Open menu'));
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Click overlay to close
            fireEvent.click(overlay!);
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('closes mobile menu when Escape key is pressed', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(screen.getByLabelText('Open menu'));
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Press Escape
            fireEvent.keyDown(window, {key: 'Escape', code: 'Escape'});
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('hides open button when menu is open and shows close button', () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            // Initially: open button visible, no close button query (it exists but menu closed)
            expect(screen.getByLabelText('Open menu')).toBeInTheDocument();

            // Open the menu
            fireEvent.click(screen.getByLabelText('Open menu'));

            // Now: open button should be gone, close button should be present
            expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
            expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
        });

        test('adds mobile-open class when menu is open', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const sidebar = container.querySelector('.sidebar');
            expect(sidebar).not.toHaveClass('sidebar--mobile-open');

            fireEvent.click(screen.getByLabelText('Open menu'));
            expect(sidebar).toHaveClass('sidebar--mobile-open');
        });

        test('mobile menu overrides hideSidebar preference', () => {
            const collapsedPrefs = {...mockViewPreferences.default, hideSidebar: true};
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={collapsedPrefs} onVersionClick={() => {}} />
            );

            const sidebar = container.querySelector('.sidebar');

            // With hideSidebar true, sidebar should be collapsed
            expect(sidebar).toHaveClass('sidebar--collapsed');

            // Open mobile menu - should remove collapsed class
            fireEvent.click(screen.getByLabelText('Open menu'));
            expect(sidebar).not.toHaveClass('sidebar--collapsed');

            // Close mobile menu - should add collapsed class back
            fireEvent.click(screen.getByLabelText('Close menu'));
            expect(sidebar).toHaveClass('sidebar--collapsed');
        });
    });

    describe('Navigation Behavior', () => {
        test('closes mobile menu when navigation occurs', () => {
            setViewportSize(VIEWPORTS.MOBILE.IPHONE_12.width, VIEWPORTS.MOBILE.IPHONE_12.height);

            const mockContext = {
                history: {
                    location: {pathname: '/applications'},
                    push: jest.fn()
                }
            };

            // Use render directly (not renderWithContext) so rerender does not re-apply a wrapper
            const {container, rerender} = render(
                <Context.Provider value={mockContext as any}>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            const overlay = container.querySelector('.sidebar-overlay');

            // Open menu
            fireEvent.click(screen.getByLabelText('Open menu'));
            expect(overlay).toHaveClass('sidebar-overlay--visible');

            // Simulate navigation by changing location and re-rendering with new context object
            const updatedContext = {
                history: {
                    location: {pathname: '/settings'},
                    push: jest.fn()
                }
            };
            rerender(
                <Context.Provider value={updatedContext as any}>
                    <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
                </Context.Provider>
            );

            // Menu should auto-close on navigation
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });

        test('highlights active navigation item', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const navItems = container.querySelectorAll('.sidebar__nav-item');
            const applicationsItem = Array.from(navItems).find(item =>
                item.textContent?.includes('Applications')
            );

            expect(applicationsItem).toHaveClass('sidebar__nav-item--active');
        });
    });

    describe('Accessibility', () => {
        test('open menu button has correct aria-label', () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            const openButton = screen.getByLabelText('Open menu');
            expect(openButton).toHaveAttribute('aria-label', 'Open menu');
        });

        test('close menu button has correct aria-label', () => {
            renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            // Open menu first to make close button the primary action
            fireEvent.click(screen.getByLabelText('Open menu'));

            const closeButton = screen.getByLabelText('Close menu');
            expect(closeButton).toHaveAttribute('aria-label', 'Close menu');
        });

        test('keyboard navigation works with Escape key', () => {
            const {container} = renderWithContext(
                <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} onVersionClick={() => {}} />
            );

            // Open with click
            fireEvent.click(screen.getByLabelText('Open menu'));

            // Close with keyboard
            fireEvent.keyDown(window, {key: 'Escape'});

            const overlay = container.querySelector('.sidebar-overlay');
            expect(overlay).not.toHaveClass('sidebar-overlay--visible');
        });
    });
});
