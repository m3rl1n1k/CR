const isDebugMode = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('debugMode') === 'true';
    }
    return false;
}

const log = (...args: any[]) => {
    if (isDebugMode()) {
        console.log('[DEBUG]', ...args);
    }
};

const warn = (...args: any[]) => {
    if (isDebugMode()) {
        console.warn('[DEBUG]', ...args);
    }
};

const error = (...args: any[]) => {
    if (isDebugMode()) {
        console.error('[DEBUG]', ...args);
    }
};

export const logger = {
    log,
    warn,
    error,
};
