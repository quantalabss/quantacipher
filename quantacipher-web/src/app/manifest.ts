import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QuantaCipher | Post-Quantum Data Security API',
    short_name: 'QuantaCipher',
    description: 'Secure your enterprise data with NIST-standard Kyber-1024 in two lines of code. Zero-trust architecture.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
