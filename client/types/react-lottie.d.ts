declare module "react-lottie" {
  import { Component } from "react";

  interface LottieOptions {
    loop?: boolean;
    autoplay?: boolean;
    animationData: unknown;
    rendererSettings?: {
      preserveAspectRatio?: string;
    };
  }

  interface LottieProps {
    options: LottieOptions;
    height?: number | string;
    width?: number | string;
    isStopped?: boolean;
    isPaused?: boolean;
    speed?: number;
    direction?: number;
    ariaRole?: string;
    ariaLabel?: string;
    title?: string;
    style?: React.CSSProperties;
    eventListeners?: Array<{
      eventName: string;
      callback: () => void;
    }>;
  }

  class Lottie extends Component<LottieProps> {}
  export default Lottie;
}
