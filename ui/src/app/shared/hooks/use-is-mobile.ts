import * as React from 'react';

const MOBILE_BREAKPOINT = 640;

export const useIsMobile = () => {
    const getMatches = () => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return false;
        }
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
    };

    const [isMobile, setIsMobile] = React.useState(getMatches);

    React.useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    return isMobile;
};
