import { useEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// GSAP アニメーション用のカスタムフック
export const useGSAPAnimations = () => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // GSAPプラグインの登録
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      // タイムラインを作成
      timelineRef.current = gsap.timeline();
    }

    return () => {
      // クリーンアップ
      timelineRef.current?.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return timelineRef.current;
};

// フェードインアニメーション
export const useFadeInAnimation = (ref: RefObject<HTMLElement>, options?: {
  delay?: number;
  duration?: number;
  y?: number;
  scrollTrigger?: boolean;
}) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const { delay = 0, duration = 0.8, y = 30, scrollTrigger = false } = options || {};

    const animationProps = {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power2.out"
    };

    if (scrollTrigger) {
      gsap.fromTo(element, 
        { y, opacity: 0 },
        {
          ...animationProps,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    } else {
      gsap.fromTo(element, { y, opacity: 0 }, animationProps);
    }

    return () => {
      gsap.killTweensOf(element);
    };
  }, [ref, options]);
};

// スライドインアニメーション
export const useSlideInAnimation = (ref: RefObject<HTMLElement>, direction: 'left' | 'right' = 'left', options?: {
  delay?: number;
  duration?: number;
  distance?: number;
  scrollTrigger?: boolean;
}) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const { delay = 0, duration = 0.8, distance = 50, scrollTrigger = false } = options || {};
    
    const startX = direction === 'left' ? -distance : distance;

    const animationProps = {
      x: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power2.out"
    };

    if (scrollTrigger) {
      gsap.fromTo(element,
        { x: startX, opacity: 0 },
        {
          ...animationProps,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    } else {
      gsap.fromTo(element, { x: startX, opacity: 0 }, animationProps);
    }

    return () => {
      gsap.killTweensOf(element);
    };
  }, [ref, direction, options]);
};

// スケールアニメーション
export const useScaleAnimation = (ref: RefObject<HTMLElement>, options?: {
  delay?: number;
  duration?: number;
  scale?: number;
  scrollTrigger?: boolean;
}) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const { delay = 0, duration = 0.8, scale = 0.8, scrollTrigger = false } = options || {};

    const animationProps = {
      scale: 1,
      opacity: 1,
      duration,
      delay,
      ease: "back.out(1.7)"
    };

    if (scrollTrigger) {
      gsap.fromTo(element,
        { scale, opacity: 0 },
        {
          ...animationProps,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    } else {
      gsap.fromTo(element, { scale, opacity: 0 }, animationProps);
    }

    return () => {
      gsap.killTweensOf(element);
    };
  }, [ref, options]);
};

// スタッガーアニメーション（複数要素の順次アニメーション）
export const useStaggerAnimation = (ref: RefObject<HTMLElement>, selector: string, options?: {
  delay?: number;
  duration?: number;
  stagger?: number;
  y?: number;
  scrollTrigger?: boolean;
}) => {
  useEffect(() => {
    if (!ref.current) return;

    const elements = ref.current.querySelectorAll(selector);
    if (!elements.length) return;

    const { delay = 0, duration = 0.6, stagger = 0.1, y = 40, scrollTrigger = false } = options || {};

    const animationProps = {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
      stagger
    };

    if (scrollTrigger) {
      gsap.fromTo(elements,
        { y, opacity: 0 },
        {
          ...animationProps,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    } else {
      gsap.fromTo(elements, { y, opacity: 0 }, animationProps);
    }

    return () => {
      gsap.killTweensOf(elements);
    };
  }, [ref, selector, options]);
};

// パララックス効果
export const useParallaxAnimation = (ref: RefObject<HTMLElement>, options?: {
  yPercent?: number;
  speed?: number;
}) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const { yPercent = -50, speed = 1 } = options || {};

    gsap.to(element, {
      yPercent,
      ease: "none",
      scrollTrigger: {
        trigger: element.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: speed
      }
    });

    return () => {
      gsap.killTweensOf(element);
    };
  }, [ref, options]);
};

// ホバーアニメーション
export function useHoverAnimation<T extends HTMLElement>(
    ref: RefObject<T | null>,
    options?: { scale?: number; duration?: number; ease?: string }
) {
    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;
        const { scale = 1.05, duration = 0.3, ease = "power2.out" } = options || {};

        const handleMouseEnter = () => {
            gsap.to(element, { scale, duration, ease });
        };
        const handleMouseLeave = () => {
            gsap.to(element, { scale: 1, duration, ease });
        };

        element.addEventListener("mouseenter", handleMouseEnter);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            element.removeEventListener("mouseenter", handleMouseEnter);
            element.removeEventListener("mouseleave", handleMouseLeave);
            gsap.killTweensOf(element);
        };
    }, [ref, options]);
}

// 数値カウントアップアニメーション
export const useCountUpAnimation = (ref: RefObject<HTMLElement>, targetValue: number, options?: {
  duration?: number;
  scrollTrigger?: boolean;
}) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const { duration = 2, scrollTrigger = false } = options || {};

    const obj = { value: 0 };

    const animationProps = {
      value: targetValue,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (element) {
          element.textContent = Math.round(obj.value).toLocaleString();
        }
      }
    };

    if (scrollTrigger) {
      gsap.to(obj, {
        ...animationProps,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    } else {
      gsap.to(obj, animationProps);
    }

    return () => {
      gsap.killTweensOf(obj);
    };
  }, [ref, targetValue, options]);
};