"use client";
import React, {useEffect, useRef, useState} from 'react';
import {Box, Card} from '@mui/material';
import {useHoverAnimation} from '@/lib/hooks/useGSAPAnimations';
import gsap from 'gsap';

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    sx?: any;
    hoverScale?: number;
    animationDelay?: number;

    [key: string]: any;
}

// アニメーション付きカードコンポーネント
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
                                                              children,
                                                              className = '',
                                                              sx = {},
                                                              hoverScale = 1.02,
                                                              animationDelay = 0,
                                                              ...props
                                                          }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // ホバーアニメーション
    useHoverAnimation(cardRef, {scale: hoverScale});


    // 初期アニメーション
    useEffect(() => {
        if (!cardRef.current) return;

        gsap.fromTo(cardRef.current,
            {
                y: 30,
                opacity: 0,
                scale: 0.95
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                delay: animationDelay
            }
        );
    }, [animationDelay]);

    return (
        <Card
            ref={cardRef}
            className={`animated-card ${className}`}
            sx={{
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                },
                ...sx
            }}
            {...props}
        >
            {children}
        </Card>
    );
};

interface AnimatedButtonProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'inherit';
    onClick?: () => void;
    startIcon?: React.ReactNode;
    sx?: any;
    animationType?: 'scale' | 'slide' | 'bounce';

    [key: string]: any;
}

// アニメーション付きボタンコンポーネント
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
                                                                  children,
                                                                  className = '',
                                                                  animationType = 'scale',
                                                                  sx = {},
                                                                  ...props
                                                              }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!buttonRef.current) return;

        const button = buttonRef.current;

        const handleMouseEnter = () => {
            switch (animationType) {
                case 'scale':
                    gsap.to(button, {
                        scale: 1.05,
                        duration: 0.2,
                        ease: "power2.out"
                    });
                    break;
                case 'slide':
                    gsap.to(button, {
                        x: 5,
                        duration: 0.2,
                        ease: "power2.out"
                    });
                    break;
                case 'bounce':
                    gsap.to(button, {
                        y: -3,
                        duration: 0.2,
                        ease: "back.out(1.7)"
                    });
                    break;
            }
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.2,
                ease: "power2.out"
            });
        };

        const handleClick = () => {
            gsap.fromTo(button,
                {scale: 1},
                {scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut"}
            );
        };

        button.addEventListener('mouseenter', handleMouseEnter);
        button.addEventListener('mouseleave', handleMouseLeave);
        button.addEventListener('click', handleClick);

        return () => {
            button.removeEventListener('mouseenter', handleMouseEnter);
            button.removeEventListener('mouseleave', handleMouseLeave);
            button.removeEventListener('click', handleClick);
            gsap.killTweensOf(button);
        };
    }, [animationType]);

    return (
        <button
            ref={buttonRef}
            className={`animated-button ${className}`}
            style={{
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                outline: 'none',
                ...sx
            }}
            {...props}
        >
            {children}
        </button>
    );
};

interface FloatingElementProps {
    children: React.ReactNode;
    floatDirection?: 'up' | 'down' | 'left' | 'right';
    floatDistance?: number;
    duration?: number;
    className?: string;
    sx?: any;
}

// 浮遊アニメーション要素
export const FloatingElement: React.FC<FloatingElementProps> = ({
                                                                    children,
                                                                    floatDirection = 'up',
                                                                    floatDistance = 10,
                                                                    duration = 2,
                                                                    className = '',
                                                                    sx = {}
                                                                }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;
        let animationProps: any = {};

        switch (floatDirection) {
            case 'up':
                animationProps = {y: -floatDistance};
                break;
            case 'down':
                animationProps = {y: floatDistance};
                break;
            case 'left':
                animationProps = {x: -floatDistance};
                break;
            case 'right':
                animationProps = {x: floatDistance};
                break;
        }

        gsap.to(element, {
            ...animationProps,
            duration,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
        });

        return () => {
            gsap.killTweensOf(element);
        };
    }, [floatDirection, floatDistance, duration]);

    return (
        <Box
            ref={elementRef}
            className={`floating-element ${className}`}
            sx={sx}
        >
            {children}
        </Box>
    );
};

interface PulsingElementProps {
    children: React.ReactNode;
    pulseScale?: number;
    duration?: number;
    className?: string;
    sx?: any;
}

// パルスアニメーション要素
export const PulsingElement: React.FC<PulsingElementProps> = ({
                                                                  children,
                                                                  pulseScale = 1.05,
                                                                  duration = 1.5,
                                                                  className = '',
                                                                  sx = {}
                                                              }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            scale: pulseScale,
            duration,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
        });

        return () => {
            gsap.killTweensOf(elementRef.current);
        };
    }, [pulseScale, duration]);

    return (
        <Box
            ref={elementRef}
            className={`pulsing-element ${className}`}
            sx={sx}
        >
            {children}
        </Box>
    );
};

interface GlowEffectProps {
    children: React.ReactNode;
    glowColor?: string;
    intensity?: number;
    className?: string;
    sx?: any;
}

// グロー効果コンポーネント
export const GlowEffect: React.FC<GlowEffectProps> = ({
                                                          children,
                                                          glowColor = '#ffffff',
                                                          intensity = 20,
                                                          className = '',
                                                          sx = {}
                                                      }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        const handleMouseEnter = () => {
            gsap.to(element, {
                boxShadow: `0 0 ${intensity}px ${glowColor}`,
                duration: 0.3,
                ease: "power2.out"
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                boxShadow: '0 0 0px transparent',
                duration: 0.3,
                ease: "power2.out"
            });
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
            gsap.killTweensOf(element);
        };
    }, [glowColor, intensity]);

    return (
        <Box
            ref={elementRef}
            className={`glow-effect ${className}`}
            sx={{
                transition: 'box-shadow 0.3s ease',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

// ===== 激しいアニメーション効果 =====

interface ExplodeEffectProps {
    children: React.ReactNode;
    triggerOnHover?: boolean;
    explodeScale?: number;
    duration?: number;
    className?: string;
    sx?: any;
}

// 爆発エフェクト
export const ExplodeEffect: React.FC<ExplodeEffectProps> = ({
                                                                children,
                                                                triggerOnHover = true,
                                                                explodeScale = 1.3,
                                                                duration = 0.6,
                                                                className = '',
                                                                sx = {}
                                                            }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        const explode = () => {
            gsap.to(element, {
                scale: explodeScale,
                duration: duration * 0.3,
                ease: "back.out(4)",
                yoyo: true,
                repeat: 1,
                transformOrigin: "center center"
            });

            // 爆発時の回転
            gsap.to(element, {
                rotation: 360,
                duration: duration,
                ease: "power2.out"
            });

            // 爆発時のグロー
            gsap.to(element, {
                boxShadow: "0 0 40px rgba(255,255,255,0.8)",
                duration: duration * 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.out"
            });
        };

        if (triggerOnHover) {
            element.addEventListener('mouseenter', explode);
            return () => {
                element.removeEventListener('mouseenter', explode);
                gsap.killTweensOf(element);
            };
        }

        // 自動爆発（3秒間隔）
        const interval = setInterval(explode, 3000);
        return () => {
            clearInterval(interval);
            gsap.killTweensOf(element);
        };
    }, [triggerOnHover, explodeScale, duration]);

    return (
        <Box
            ref={elementRef}
            className={`explode-effect ${className}`}
            sx={{
                cursor: triggerOnHover ? 'pointer' : 'default',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

interface Flip3DCardProps {
    frontContent: React.ReactNode;
    backContent: React.ReactNode;
    autoFlip?: boolean;
    flipInterval?: number;
    className?: string;
    sx?: any;
}

// 3Dフリップカード
export const Flip3DCard: React.FC<Flip3DCardProps> = ({
                                                          frontContent,
                                                          backContent,
                                                          autoFlip = false,
                                                          flipInterval = 4000,
                                                          className = '',
                                                          sx = {}
                                                      }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !frontRef.current || !backRef.current) return;

        const container = containerRef.current;
        const front = frontRef.current;
        const back = backRef.current;

        // 初期設定
        gsap.set(container, {perspective: 1000});
        gsap.set([front, back], {transformStyle: "preserve-3d"});
        gsap.set(back, {rotationY: 180});

        const flip = () => {
            const newFlipped = !isFlipped;
            setIsFlipped(newFlipped);

            gsap.to([front, back], {
                duration: 0.8,
                rotationY: newFlipped ? 180 : 0,
                ease: "power2.inOut",
                transformOrigin: "center center"
            });

            // 爆発的なスケール変化
            gsap.fromTo(container,
                {scale: 1},
                {scale: 1.1, duration: 0.4, yoyo: true, repeat: 1, ease: "back.out(3)"}
            );
        };

        if (autoFlip) {
            const interval = setInterval(flip, flipInterval);
            return () => {
                clearInterval(interval);
                gsap.killTweensOf([container, front, back]);
            };
        }

        container.addEventListener('click', flip);
        return () => {
            container.removeEventListener('click', flip);
            gsap.killTweensOf([container, front, back]);
        };
    }, [isFlipped, autoFlip, flipInterval]);

    return (
        <Box
            ref={containerRef}
            className={`flip-3d-card ${className}`}
            sx={{
                position: 'relative',
                cursor: autoFlip ? 'default' : 'pointer',
                ...sx
            }}
        >
            <Box
                ref={frontRef}
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden'
                }}
            >
                {frontContent}
            </Box>
            <Box
                ref={backRef}
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden'
                }}
            >
                {backContent}
            </Box>
        </Box>
    );
};

interface IntenseBounceProps {
    children: React.ReactNode;
    bounceHeight?: number;
    bounceScale?: number;
    continuous?: boolean;
    className?: string;
    sx?: any;
}

// 激しいバウンスエフェクト
export const IntenseBounce: React.FC<IntenseBounceProps> = ({
                                                                children,
                                                                bounceHeight = 30,
                                                                bounceScale = 1.2,
                                                                continuous = true,
                                                                className = '',
                                                                sx = {}
                                                            }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        const bounce = () => {
            const tl = gsap.timeline();

            tl.to(element, {
                y: -bounceHeight,
                scale: bounceScale,
                duration: 0.3,
                ease: "power2.out"
            })
                .to(element, {
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: "bounce.out"
                })
                .to(element, {
                    y: -bounceHeight * 0.5,
                    scale: bounceScale * 0.8,
                    duration: 0.2,
                    ease: "power2.out"
                })
                .to(element, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "bounce.out"
                });
        };

        if (continuous) {
            const interval = setInterval(bounce, 2000);
            return () => {
                clearInterval(interval);
                gsap.killTweensOf(element);
            };
        }

        element.addEventListener('mouseenter', bounce);
        return () => {
            element.removeEventListener('mouseenter', bounce);
            gsap.killTweensOf(element);
        };
    }, [bounceHeight, bounceScale, continuous]);

    return (
        <Box
            ref={elementRef}
            className={`intense-bounce ${className}`}
            sx={{
                cursor: continuous ? 'default' : 'pointer',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

interface RainbowGlowProps {
    children: React.ReactNode;
    intensity?: number;
    speed?: number;
    className?: string;
    sx?: any;
}

// レインボーグローエフェクト
export const RainbowGlow: React.FC<RainbowGlowProps> = ({
                                                            children,
                                                            intensity = 20,
                                                            speed = 2,
                                                            className = '',
                                                            sx = {}
                                                        }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const colors = [
            '#ff0000', // 赤
            '#ff8000', // オレンジ
            '#ffff00', // 黄
            '#80ff00', // 黄緑
            '#00ff00', // 緑
            '#00ff80', // 青緑
            '#00ffff', // シアン
            '#0080ff', // 青
            '#0000ff', // 青
            '#8000ff', // 紫
            '#ff00ff', // マゼンタ
            '#ff0080'  // ピンク
        ];

        const tl = gsap.timeline({repeat: -1});

        colors.forEach((color, index) => {
            tl.to(elementRef.current, {
                boxShadow: `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}`,
                duration: speed / colors.length,
                ease: "none"
            });
        });

        return () => {
            tl.kill();
        };
    }, [intensity, speed]);

    return (
        <Box
            ref={elementRef}
            className={`rainbow-glow ${className}`}
            sx={{
                borderRadius: '8px',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

interface ParticleExplosionProps {
    children: React.ReactNode;
    particleCount?: number;
    colors?: string[];
    triggerOnClick?: boolean;
    className?: string;
    sx?: any;
}

// パーティクル爆発エフェクト
export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
                                                                        children,
                                                                        particleCount = 20,
                                                                        colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
                                                                        triggerOnClick = true,
                                                                        className = '',
                                                                        sx = {}
                                                                    }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // パーティクルを作成
        const particles = Array.from({length: particleCount}, (_, i) => {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = colors[i % colors.length];
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.top = '50%';
            particle.style.left = '50%';
            particle.style.transform = 'translate(-50%, -50%)';
            particle.style.opacity = '0';
            container.appendChild(particle);
            return particle;
        });

        particlesRef.current = particles;

        const explode = () => {
            particles.forEach((particle, i) => {
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = 100 + Math.random() * 100;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                gsap.fromTo(particle,
                    {
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        y: 0
                    },
                    {
                        x,
                        y,
                        opacity: 0,
                        scale: 0,
                        duration: 1 + Math.random() * 0.5,
                        ease: "power2.out",
                        delay: Math.random() * 0.2
                    }
                );
            });
        };

        if (triggerOnClick) {
            container.addEventListener('click', explode);
            return () => {
                container.removeEventListener('click', explode);
                particles.forEach(p => p.remove());
                gsap.killTweensOf(particles);
            };
        }

        return () => {
            particles.forEach(p => p.remove());
            gsap.killTweensOf(particles);
        };
    }, [particleCount, colors, triggerOnClick]);

    return (
        <Box
            ref={containerRef}
            className={`particle-explosion ${className}`}
            sx={{
                position: 'relative',
                cursor: triggerOnClick ? 'pointer' : 'default',
                overflow: 'visible',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

// ===== 回転ずし風アニメーション =====

interface SushiBeltProps {
    cards: Array<{
        id: string | number;
        content: React.ReactNode;
    }>;
    speed?: number;
    direction?: 'left' | 'right';
    cardWidth?: number;
    className?: string;
    sx?: any;
}

// 回転ずし風カードコンベアーベルト
export const SushiBelt: React.FC<SushiBeltProps> = ({
                                                        cards,
                                                        speed = 60, // 1周あたりの秒数
                                                        direction = 'left',
                                                        cardWidth = 280,
                                                        className = '',
                                                        sx = {}
                                                    }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const containerWidth = container.offsetWidth;
        const totalWidth = cards.length * (cardWidth + 20); // カード間のマージン込み
        const animationDistance = containerWidth + totalWidth;

        tlRef.current = gsap.timeline({repeat: -1, ease: "none"});

        cardRefs.current.forEach((cardEl, index) => {
            if (!cardEl) return;

            // 初期位置設定（画面右端から開始）
            const initialX = containerWidth + (cardWidth + 20) * index;
            gsap.set(cardEl, {x: initialX});

            // 左へ移動するアニメーション
            tlRef.current!.to(cardEl, {
                x: direction === 'left' ? -totalWidth : containerWidth + totalWidth,
                duration: speed,
                ease: "none"
            }, 0);

            // カードの回転とスケール効果
            tlRef.current!.to(cardEl, {
                rotationY: 360,
                scale: 1.05,
                duration: speed / 4,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            }, 0);

            // ホバー時の激しい効果
            const handleMouseEnter = () => {
                gsap.to(cardEl, {
                    scale: 1.15,
                    rotationX: 20,
                    z: 50,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            };

            const handleMouseLeave = () => {
                gsap.to(cardEl, {
                    scale: 1.05,
                    rotationX: 0,
                    z: 0,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    duration: 0.3,
                    ease: "power2.out"
                });
            };

            cardEl.addEventListener('mouseenter', handleMouseEnter);
            cardEl.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            if (tlRef.current) {
                tlRef.current.kill();
            }
            cardRefs.current.forEach(cardEl => {
                if (cardEl) {
                    gsap.killTweensOf(cardEl);
                }
            });
        };
    }, [cards, speed, direction, cardWidth]);

    return (
        <Box
            ref={containerRef}
            className={`sushi-belt ${className}`}
            sx={{
                width: '100%',
                height: '200px',
                overflow: 'hidden',
                position: 'relative',
                perspective: '1000px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.05) 80%, rgba(255,255,255,0) 100%)',
                ...sx
            }}
        >
            {cards.map((card, index) => (
                <Box
                    key={card.id}
                    ref={(el: HTMLDivElement | null) => {
                        cardRefs.current[index] = el;
                    }}
                    sx={{
                        position: 'absolute',
                        width: `${cardWidth}px`,
                        height: '160px',
                        top: '20px',
                        cursor: 'pointer',
                        transformStyle: 'preserve-3d',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {card.content}
                </Box>
            ))}
        </Box>
    );
};

// マトリックス風テキストエフェクト
interface MatrixTextProps {
    text: string;
    speed?: number;
    className?: string;
    sx?: any;
}

export const MatrixText: React.FC<MatrixTextProps> = ({
                                                          text,
                                                          speed = 100,
                                                          className = '',
                                                          sx = {}
                                                      }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (!containerRef.current) return;

        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
        let iteration = 0;

        const interval = setInterval(() => {
            setDisplayText(prevText =>
                text.split('').map((letter, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('')
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <Box
            ref={containerRef}
            className={`matrix-text ${className}`}
            sx={{
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#00ff00',
                textShadow: '0 0 10px #00ff00',
                ...sx
            }}
        >
            {displayText}
        </Box>
    );
};

// スパーク効果
interface SparkleEffectProps {
    children: React.ReactNode;
    sparkleCount?: number;
    colors?: string[];
    className?: string;
    sx?: any;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
                                                                children,
                                                                sparkleCount = 15,
                                                                colors = ['#ffd700', '#ffed4e', '#fff9c4'],
                                                                className = '',
                                                                sx = {}
                                                            }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sparklesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // スパークルを作成
        const sparkles = Array.from({length: sparkleCount}, (_, i) => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.position = 'absolute';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.fontSize = '12px';
            sparkle.style.color = colors[i % colors.length];
            sparkle.style.zIndex = '10';
            container.appendChild(sparkle);
            return sparkle;
        });

        sparklesRef.current = sparkles;

        const animate = () => {
            sparkles.forEach(sparkle => {
                const x = Math.random() * container.offsetWidth;
                const y = Math.random() * container.offsetHeight;

                gsap.set(sparkle, {x, y, scale: 0, opacity: 0});

                gsap.to(sparkle, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                });

                gsap.to(sparkle, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.6,
                    delay: 0.8,
                    ease: "power2.in"
                });

                gsap.to(sparkle, {
                    y: y - 30,
                    duration: 1.4,
                    ease: "power2.out"
                });
            });
        };

        // 定期的にスパークル
        const interval = setInterval(animate, 2000);
        animate(); // 初回実行

        return () => {
            clearInterval(interval);
            sparkles.forEach(s => s.remove());
            gsap.killTweensOf(sparkles);
        };
    }, [sparkleCount, colors]);

    return (
        <Box
            ref={containerRef}
            className={`sparkle-effect ${className}`}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

// 激しいネオングロー効果
interface NeonGlowProps {
    children: React.ReactNode;
    glowColor?: string;
    pulseSpeed?: number;
    intensity?: number;
    className?: string;
    sx?: any;
}

export const NeonGlow: React.FC<NeonGlowProps> = ({
                                                      children,
                                                      glowColor = '#00ffff',
                                                      pulseSpeed = 2,
                                                      intensity = 30,
                                                      className = '',
                                                      sx = {}
                                                  }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            boxShadow: `0 0 ${intensity}px ${glowColor}, 0 0 ${intensity * 2}px ${glowColor}, 0 0 ${intensity * 3}px ${glowColor}`,
            duration: pulseSpeed,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
        });

        return () => {
            gsap.killTweensOf(elementRef.current);
        };
    }, [glowColor, pulseSpeed, intensity]);

    return (
        <Box
            ref={elementRef}
            className={`neon-glow ${className}`}
            sx={{
                border: `2px solid ${glowColor}`,
                borderRadius: '8px',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};