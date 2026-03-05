import {setViewportSize, mockMatchMedia, VIEWPORTS} from '../../__tests__/test-utils';

describe('Mobile Responsive Configuration', () => {
    describe('Viewport detection via matchMedia', () => {
        test('mobile viewports match max-width: 639px', () => {
            Object.values(VIEWPORTS.MOBILE).forEach(device => {
                mockMatchMedia(device.width);
                expect(window.matchMedia('(max-width: 639px)').matches).toBe(true);
            });
        });

        test('tablet viewports do not match max-width: 639px', () => {
            Object.values(VIEWPORTS.TABLET).forEach(device => {
                mockMatchMedia(device.width);
                expect(window.matchMedia('(max-width: 639px)').matches).toBe(false);
            });
        });

        test('desktop viewports match min-width: 640px', () => {
            Object.values(VIEWPORTS.DESKTOP).forEach(device => {
                mockMatchMedia(device.width);
                expect(window.matchMedia('(min-width: 640px)').matches).toBe(true);
            });
        });
    });

    describe('Breakpoint boundary at 640px', () => {
        test('639px is mobile', () => {
            mockMatchMedia(639);
            expect(window.matchMedia('(max-width: 639px)').matches).toBe(true);
            expect(window.matchMedia('(min-width: 640px)').matches).toBe(false);
        });

        test('640px is not mobile', () => {
            mockMatchMedia(640);
            expect(window.matchMedia('(max-width: 639px)').matches).toBe(false);
            expect(window.matchMedia('(min-width: 640px)').matches).toBe(true);
        });
    });

    describe('setViewportSize updates window dimensions', () => {
        test('sets innerWidth and innerHeight', () => {
            setViewportSize(375, 667);
            expect(window.innerWidth).toBe(375);
            expect(window.innerHeight).toBe(667);
        });

        test('updates matchMedia to reflect new viewport', () => {
            setViewportSize(375);
            expect(window.matchMedia('(max-width: 639px)').matches).toBe(true);

            setViewportSize(1920);
            expect(window.matchMedia('(max-width: 639px)').matches).toBe(false);
        });
    });
});
