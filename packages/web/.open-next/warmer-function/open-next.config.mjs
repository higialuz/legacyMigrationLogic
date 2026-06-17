import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);import bannerUrl from 'url';const __dirname = bannerUrl.fileURLToPath(new URL('.', import.meta.url));

// open-next.config.ts
var config = {
  default: {
    install: {
      packages: ["react@19.2.4", "react-dom@19.2.4", "scheduler@0.25.0"]
    }
  }
};
var open_next_config_default = config;
export {
  open_next_config_default as default
};
