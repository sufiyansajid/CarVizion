export type AnimationVariant = "circle" | "circle-blur" | "polygon" | "gif";
export type AnimationStart =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

interface Animation {
  name: string;
  css: string;
}

const getPositionCoords = (position: AnimationStart) => {
  switch (position) {
    case "top-left":
      return { cx: "0", cy: "0" };
    case "top-right":
      return { cx: "40", cy: "0" };
    case "bottom-left":
      return { cx: "0", cy: "40" };
    case "bottom-right":
      return { cx: "40", cy: "40" };
  }
};

const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
  if (start === "center") return;

  const positionCoords = getPositionCoords(start);
  if (!positionCoords) {
    throw new Error(`Invalid start position: ${start}`);
  }
  const { cx, cy } = positionCoords;

  if (variant === "circle") {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
  }

  if (variant === "circle-blur") {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
  }

  return "";
};

const getTransformOrigin = (start: AnimationStart) => {
  switch (start) {
    case "top-left":
      return "top left";
    case "top-right":
      return "top right";
    case "bottom-left":
      return "bottom left";
    case "bottom-right":
      return "bottom right";
  }
};

export const createAnimation = (
  variant: AnimationVariant,
  start: AnimationStart,
  url?: string
): Animation => {
  const svg = generateSVG(variant, start);
  const transformOrigin = getTransformOrigin(start);

  if (variant === "polygon") {
    return {
      name: `${variant}-${start}`,
      css: `
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light;
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        transform: translateZ(1px) !important;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark;
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }

      @keyframes reveal-dark {
        from {
          clip-path: polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%);
        }
        to {
          clip-path: polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%);
        }
      }

      @keyframes reveal-light {
        from {
          clip-path: polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%);
        }
        to {
          clip-path: polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%);
        }
      }
      `,
    };
  }
  if (variant === "circle" && start == "center") {
    return {
      name: `${variant}-${start}`,
      css: `
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light;
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        transform: translateZ(1px) !important;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark;
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }

      @keyframes reveal-dark {
        from {
          clip-path: circle(0% at 50% 50%);
        }
        to {
          clip-path: circle(100.0% at 50% 50%);
        }
      }

      @keyframes reveal-light {
        from {
           clip-path: circle(0% at 50% 50%);
        }
        to {
          clip-path: circle(100.0% at 50% 50%);
        }
      }
      `,
    };
  }
  if (variant === "gif") {
    return {
      name: `${variant}-${start}`,
      css: `
      ::view-transition-group(root) {
  animation-timing-function: var(--expo-in);
  z-index: 2147483647 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  contain: layout style paint !important;
  transform: translateZ(1px) !important;
}

::view-transition-new(root) {
 mask: url('${url}') center / 0 no-repeat;
 animation: scale 3s;
 z-index: 2147483647 !important;
 position: fixed !important;
 top: 0 !important;
 left: 0 !important;
 right: 0 !important;
 bottom: 0 !important;
 width: 100vw !important;
 height: 100vh !important;
 contain: layout style paint !important;
 transform: translateZ(1px) !important;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
 animation: scale 3s;
 z-index: 2147483647 !important;
 position: fixed !important;
 top: 0 !important;
 left: 0 !important;
 right: 0 !important;
 bottom: 0 !important;
 width: 100vw !important;
 height: 100vh !important;
 contain: layout style paint !important;
 transform: translateZ(1px) !important;
}

@keyframes scale {
  0% {
    mask-size: 0;
  }
  10% {
    mask-size: 50vmax;
  }
  90% {
    mask-size: 50vmax;
  }
  100% {
    mask-size: 2000vmax;
  }
}`,
    };
  }

  return {
    name: `${variant}-${start}`,
    css: `
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-out);
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }
      ::view-transition-new(root) {
        mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale-${start} 1s;
        transform-origin: ${transformOrigin};
        z-index: 2147483647 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale-${start} 1s;
        transform-origin: ${transformOrigin};
        z-index: -1 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        contain: layout style paint !important;
        transform: translateZ(1px) !important;
      }
      @keyframes scale-${start} {
        to {
          mask-size: 350vmax;
        }
      }
    `,
  };
};
