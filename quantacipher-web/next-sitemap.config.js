/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://quantacipher.com',
  generateRobotsTxt: true, // Generate robots.txt file
  exclude: ['/dashboard', '/dashboard/*'], // Exclude authenticated routes
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard'],
      },
    ],
  },
}
