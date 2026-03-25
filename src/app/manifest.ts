import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LexiFlash',
    short_name: 'LexiFlash',
    description: 'Flashcards app for languages and vocabulary',
    start_url: '/',
    display: 'standalone',
    background_color: '#020205',
    theme_color: '#22d3ee',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
