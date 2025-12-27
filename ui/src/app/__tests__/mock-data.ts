/**
 * Mock Data Factory for ArgoCD Applications
 *
 * This file provides realistic mock data for testing the ArgoCD UI,
 * especially for mobile responsive design testing.
 *
 * Based on existing test fixtures from server/application/application_test.go
 * and test/e2e/fixture patterns.
 */

import * as models from '../shared/models';

export const mockApplications = {
    /**
     * Create a mock application with customizable properties
     */
    createApplication(overrides?: Partial<models.Application>): models.Application {
        const defaultApp: models.Application = {
            metadata: {
                name: 'guestbook',
                namespace: 'argocd',
                creationTimestamp: '2023-01-15T10:30:00Z',
                labels: {
                    'app.kubernetes.io/instance': 'guestbook'
                },
                annotations: {}
            },
            spec: {
                project: 'default',
                source: {
                    repoURL: 'https://github.com/argoproj/argocd-example-apps',
                    path: 'guestbook',
                    targetRevision: 'HEAD'
                },
                destination: {
                    server: 'https://kubernetes.default.svc',
                    namespace: 'default'
                },
                syncPolicy: {
                    automated: {
                        prune: false,
                        selfHeal: false
                    }
                }
            },
            status: {
                sync: {
                    status: 'Synced',
                    revision: 'abc123'
                },
                health: {
                    status: 'Healthy'
                },
                operationState: undefined,
                resources: [],
                summary: {}
            }
        } as models.Application;

        return {...defaultApp, ...overrides} as models.Application;
    },

    /**
     * Create a list of mock applications with various states
     */
    createApplicationList(count: number = 10): models.Application[] {
        const healthStatuses = ['Healthy', 'Progressing', 'Degraded', 'Suspended', 'Missing', 'Unknown'];
        const syncStatuses = ['Synced', 'OutOfSync'];
        const apps: models.Application[] = [];

        for (let i = 0; i < count; i++) {
            const healthStatus = healthStatuses[i % healthStatuses.length];
            const syncStatus = syncStatuses[i % syncStatuses.length];

            apps.push(this.createApplication({
                metadata: {
                    name: `app-${i + 1}`,
                    namespace: 'argocd',
                    creationTimestamp: new Date(Date.now() - i * 86400000).toISOString(),
                    labels: {
                        'app.kubernetes.io/instance': `app-${i + 1}`,
                        'env': i % 2 === 0 ? 'production' : 'staging'
                    },
                    annotations: {}
                },
                spec: {
                    project: i % 3 === 0 ? 'default' : 'team-alpha',
                    source: {
                        repoURL: `https://github.com/example/app-${i + 1}`,
                        path: i % 2 === 0 ? 'helm' : 'kustomize',
                        targetRevision: 'main'
                    },
                    destination: {
                        server: 'https://kubernetes.default.svc',
                        namespace: `namespace-${i + 1}`
                    },
                    syncPolicy: {
                        automated: i % 2 === 0 ? {
                            prune: true,
                            selfHeal: true
                        } : undefined
                    }
                },
                status: {
                    sync: {
                        status: syncStatus as any,
                        revision: `revision-${i}`
                    },
                    health: {
                        status: healthStatus as any
                    },
                    operationState: undefined,
                    resources: [],
                    summary: {}
                }
            } as any));
        }

        return apps;
    },

    /**
     * Create mock application for specific health status
     */
    createHealthyApplication(name: string = 'healthy-app'): models.Application {
        return this.createApplication({
            metadata: {
                name,
                namespace: 'argocd',
                creationTimestamp: new Date().toISOString(),
                labels: {},
                annotations: {}
            },
            status: {
                health: {status: 'Healthy'},
                sync: {status: 'Synced', revision: 'abc123'},
                resources: [],
                summary: {}
            }
        } as any);
    },

    createDegradedApplication(name: string = 'degraded-app'): models.Application {
        return this.createApplication({
            metadata: {
                name,
                namespace: 'argocd',
                creationTimestamp: new Date().toISOString(),
                labels: {},
                annotations: {}
            },
            status: {
                health: {status: 'Degraded'},
                sync: {status: 'OutOfSync', revision: 'abc123'},
                resources: [],
                summary: {}
            }
        } as any);
    },

    createProgressingApplication(name: string = 'progressing-app'): models.Application {
        return this.createApplication({
            metadata: {
                name,
                namespace: 'argocd',
                creationTimestamp: new Date().toISOString(),
                labels: {},
                annotations: {}
            },
            status: {
                health: {status: 'Progressing'},
                sync: {status: 'Synced', revision: 'abc123'},
                resources: [],
                summary: {}
            }
        } as any);
    }
};

/**
 * Mock navigation items
 */
export const mockNavItems = [
    {
        path: '/applications',
        iconClassName: 'fa fa-th',
        title: 'Applications',
        tooltip: 'Manage your applications, and diagnose health problems.'
    },
    {
        path: '/settings',
        iconClassName: 'fa fa-cog',
        title: 'Settings',
        tooltip: 'Manage your repositories, projects, and settings.'
    },
    {
        path: '/help',
        iconClassName: 'fa fa-question-circle',
        title: 'Help',
        tooltip: 'Get help and documentation.'
    }
];

/**
 * Mock view preferences
 */
export const mockViewPreferences = {
    default: {
        hideSidebar: false,
        theme: 'light',
        appList: {
            view: 'tiles' as const,
            projectsFilter: [],
            clustersFilter: [],
            namespacesFilter: [],
            labelsFilter: [],
            sync: [],
            health: []
        }
    },
    sidebarCollapsed: {
        hideSidebar: true,
        theme: 'light',
        appList: {
            view: 'tiles' as const,
            projectsFilter: [],
            clustersFilter: [],
            namespacesFilter: [],
            labelsFilter: [],
            sync: [],
            health: []
        }
    },
    darkMode: {
        hideSidebar: false,
        theme: 'dark',
        appList: {
            view: 'tiles' as const,
            projectsFilter: [],
            clustersFilter: [],
            namespacesFilter: [],
            labelsFilter: [],
            sync: [],
            health: []
        }
    }
};

/**
 * Mock version info
 */
export const mockVersion = {
    Version: '2.9.0',
    BuildDate: '2023-11-15T12:00:00Z',
    GitCommit: 'abc123def456',
    GoVersion: 'go1.21.0',
    Compiler: 'gc',
    Platform: 'linux/amd64'
};

/**
 * Mock React Router context
 */
export const mockRouterContext = {
    history: {
        location: {
            pathname: '/applications',
            search: '',
            hash: '',
            state: undefined
        },
        push: jest.fn(),
        replace: jest.fn(),
        go: jest.fn(),
        goBack: jest.fn(),
        goForward: jest.fn(),
        listen: jest.fn(),
        block: jest.fn(),
        createHref: jest.fn()
    },
    location: {
        pathname: '/applications',
        search: '',
        hash: '',
        state: undefined
    },
    match: {
        params: {},
        isExact: true,
        path: '/applications',
        url: '/applications'
    }
};

/**
 * Helper to create a mock context with custom pathname
 */
export const createMockContext = (pathname: string = '/applications') => ({
    ...mockRouterContext,
    history: {
        ...mockRouterContext.history,
        location: {
            ...mockRouterContext.history.location,
            pathname
        }
    },
    location: {
        ...mockRouterContext.location,
        pathname
    }
});
