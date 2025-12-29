import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './mobile-panel.scss';

export interface MobilePanelProps {
    isShown: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

/**
 * MobilePanel - A full-screen modal panel designed for mobile devices.
 *
 * Features:
 * - Full viewport coverage with white background
 * - Sticky header with title and close button
 * - Scrollable body content
 * - Optional sticky action buttons at bottom
 * - Touch-friendly interactions
 * - Prevents body scroll when open
 */
export const MobilePanel: React.FC<MobilePanelProps> = ({isShown, onClose, title, children, actions}) => {
    // Prevent body scroll when panel is open
    React.useEffect(() => {
        if (isShown) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isShown]);

    // Close on escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isShown) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isShown, onClose]);

    if (!isShown) {
        return null;
    }

    const panel = (
        <div className='mobile-panel'>
            <div className='mobile-panel__backdrop' onClick={onClose} />
            <div className='mobile-panel__container'>
                <div className='mobile-panel__header'>
                    {title && <h2 className='mobile-panel__title'>{title}</h2>}
                    <button type='button' className='mobile-panel__close' onClick={onClose} aria-label='Close'>
                        <i className='fa fa-times' />
                    </button>
                </div>
                <div className='mobile-panel__body'>{children}</div>
                {actions && <div className='mobile-panel__actions'>{actions}</div>}
            </div>
        </div>
    );

    // Render to portal to ensure it's above everything
    return ReactDOM.createPortal(panel, document.body);
};

export default MobilePanel;
