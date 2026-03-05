import {Tooltip} from 'argo-ui';
import {Boundary, Placement} from 'popper.js';
import {useData} from 'argo-ui/v2';
import * as React from 'react';
import {Context} from '../shared/context';
import {services, ViewPreferences} from '../shared/services';

require('./sidebar.scss');

interface SidebarProps {
    onVersionClick: () => void;
    navItems: {path: string; iconClassName: string; title: string; tooltip?: string}[];
    pref: ViewPreferences;
}

export const SIDEBAR_TOOLS_ID = 'sidebar-tools';

export const useSidebarTarget = () => {
    const sidebarTarget = React.useRef(document.createElement('div'));

    React.useEffect(() => {
        const sidebar = document.getElementById(SIDEBAR_TOOLS_ID);
        sidebar.appendChild(sidebarTarget?.current);
        return () => {
            sidebarTarget.current?.remove();
        };
    }, []);

    return sidebarTarget;
};

export const Sidebar = (props: SidebarProps) => {
    const context = React.useContext(Context);
    const [version, loading, error] = useData(() => services.version.version());
    const locationPath = context.history.location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Close mobile menu when route changes
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [locationPath]);

    // Close mobile menu on escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // On mobile, always show full sidebar when menu is open
    // On desktop, respect the hideSidebar preference
    const showFullSidebar = isMobileMenuOpen || !props.pref.hideSidebar;

    const tooltipProps = {
        placement: 'right' as Placement,
        popperOptions: {
            modifiers: {
                preventOverflow: {
                    boundariesElement: 'window' as Boundary
                }
            }
        }
    };

    return (
        <>
            {/* Mobile hamburger menu button - hidden when sidebar is open */}
            {!isMobileMenuOpen && (
                <button className='mobile-menu-button' onClick={toggleMobileMenu} aria-label='Open menu'>
                    <i className='fas fa-bars' />
                </button>
            )}

            {/* Mobile overlay backdrop */}
            <div className={`sidebar-overlay ${isMobileMenuOpen ? 'sidebar-overlay--visible' : ''}`} onClick={toggleMobileMenu} />

            <div className={`sidebar ${props.pref.hideSidebar && !isMobileMenuOpen ? 'sidebar--collapsed' : ''} ${isMobileMenuOpen ? 'sidebar--mobile-open' : ''}`}>
                <div className='sidebar__container'>
                    {/* Mobile close button */}
                    <button className='sidebar__mobile-close' onClick={toggleMobileMenu} aria-label='Close menu'>
                        <i className='fas fa-times' />
                    </button>
                    <div className='sidebar__logo'>
                        <div onClick={() => services.viewPreferences.updatePreferences({...props.pref, hideSidebar: !props.pref.hideSidebar})} className='sidebar__collapse-button'>
                            <i className={`fas fa-arrow-${props.pref.hideSidebar ? 'right' : 'left'}`} />
                        </div>
                        {showFullSidebar && (
                            <div className='sidebar__logo-container'>
                                <img
                                    onClick={() => context.history.push('/')}
                                    title={'Go to start page'}
                                    src='assets/images/argologo.svg'
                                    alt='Argo'
                                    className='sidebar__logo__text-logo'
                                />
                                <div className='sidebar__version' onClick={props.onVersionClick}>
                                    {loading ? 'Loading...' : error?.state ? 'Unknown' : version?.Version || 'Unknown'}
                                </div>
                            </div>
                        )}
                        <img onClick={() => context.history.push('/')} title={'Go to start page'} src='assets/images/logo.png' alt='Argo' className='sidebar__logo__character' />{' '}
                    </div>

                    {(props.navItems || []).map(item => (
                        <Tooltip key={item.path} content={<div className='sidebar__tooltip'>{item?.tooltip || item.title}</div>} {...tooltipProps}>
                            <div
                                key={item.title}
                                className={`sidebar__nav-item ${locationPath === item.path || locationPath.startsWith(`${item.path}/`) ? 'sidebar__nav-item--active' : ''}`}
                                onClick={() => context.history.push(item.path)}>
                                <div>
                                    <i className={item?.iconClassName || ''} />
                                    {showFullSidebar && item.title}
                                </div>
                            </div>
                        </Tooltip>
                    ))}

                    {!showFullSidebar && (
                        <Tooltip content='Show Filters' {...tooltipProps}>
                            <div
                                onClick={() => services.viewPreferences.updatePreferences({...props.pref, hideSidebar: !props.pref.hideSidebar})}
                                className='sidebar__nav-item sidebar__filter-button'>
                                <div>
                                    <i className={`fas fa-filter`} />
                                </div>
                            </div>
                        </Tooltip>
                    )}
                </div>
                <div id={SIDEBAR_TOOLS_ID} />
            </div>
        </>
    );
};
