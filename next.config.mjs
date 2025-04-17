/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    env: {
        JWT_SECRET: "81NwD5pOYZBZmerDi6ZZG7G7VTc72Zb0",
        ORACLE_URL: "http://20.200.186.147"
    }
};

export default nextConfig;
