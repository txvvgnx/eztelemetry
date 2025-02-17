interface Window {
    env: {
        getEnv: (key: string) => Promise<string | undefined>;
    },
}