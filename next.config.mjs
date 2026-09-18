import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

// Keep the live development server from overwriting production build output.
export default function nextConfig(phase) {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
