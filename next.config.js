/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  output: 'standalone',
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
  ],
  compiler: {
    styledComponents: true,
  }
};

