with open("next.config.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_images = """  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },"""

new_images = """  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },"""

content = content.replace(old_images, new_images)

with open("next.config.ts", "w", encoding="utf-8") as f:
    f.write(content)
