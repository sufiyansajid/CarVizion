export {};
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        "camera-controls"?: boolean | string;
        "auto-rotate"?: boolean | string;
        exposure?: string | number;
        "shadow-intensity"?: string | number;
        poster?: string;
        ar?: boolean | string;
        "ar-modes"?: string;
        "camera-orbit"?: string;
        "field-of-view"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "interaction-prompt"?: string;
        style?: React.CSSProperties;
      };
    }
  }
}
