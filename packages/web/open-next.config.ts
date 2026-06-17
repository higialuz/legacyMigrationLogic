// open-next.config.ts — NOT processed by Next.js tsconfig
// This file is read by OpenNext to configure the server bundle

const config = {
  default: {
    install: {
      packages: ['react@19.2.4', 'react-dom@19.2.4', 'scheduler@0.25.0'],
    },
  },
}

export default config
