"use client";
import {Box, Button, Card, Chip, Container, Divider, Paper, Stack, Typography, Modal} from '@mui/material';
import {AutoAwesome, BarChart, Shield, Speed} from '@mui/icons-material';
import React, {useEffect, useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import Header from "@/app/_components/Header";
import CloseIcon from '@mui/icons-material/Close';
import { RiNextjsLine,RiSupabaseLine } from "react-icons/ri";
import { SiTypescript,SiKubernetes,SiGin,SiEnvoyproxy } from "react-icons/si";
import { FaGolang,FaPython } from "react-icons/fa6";
import { TbSql } from "react-icons/tb";
import { DiRedis } from "react-icons/di";
export default function Home() {
    // モーダル用のstate
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalContent, setModalContent] = React.useState({
        title: '',
        description: '',
        more: '',
        icon: null as React.ReactNode | null,
    });

    // アニメーション用のrefs
    const heroRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const testimonialRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // GSAPプラグインの登録
        if (typeof window !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            // ヒーローセクションのアニメーション
            const tl = gsap.timeline();

            if (heroRef.current) {
                const heroChip = heroRef.current.querySelector('.hero-chip');
                const heroTitle = heroRef.current.querySelector('.hero-title');
                const heroDescription = heroRef.current.querySelector('.hero-description');
                const heroButtons = heroRef.current.querySelectorAll('.hero-button');

                if (heroChip) {
                    tl.fromTo(heroChip,
                        {y: 30, opacity: 0},
                        {y: 0, opacity: 1, duration: 0.8, ease: "power2.out"}
                    );
                }

                if (heroTitle) {
                    tl.fromTo(heroTitle,
                        {y: 50, opacity: 0},
                        {y: 0, opacity: 1, duration: 1, ease: "power2.out"}, "-=0.5"
                    );
                }

                if (heroDescription) {
                    tl.fromTo(heroDescription,
                        {y: 30, opacity: 0},
                        {y: 0, opacity: 1, duration: 0.8, ease: "power2.out"}, "-=0.3"
                    );
                }

                if (heroButtons.length > 0) {
                    tl.fromTo(heroButtons,
                        {y: 30, opacity: 0, scale: 0.95},
                        {y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.1}, "-=0.2"
                    );
                }
            }

            // 機能セクションのアニメーション
            if (featuresRef.current) {
                const featureCards = featuresRef.current.querySelectorAll('.feature-card');
                if (featureCards.length > 0) {
                    gsap.fromTo(featureCards,
                        {y: 60, opacity: 0, scale: 0.9},
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.8,
                            ease: "power2.out",
                            stagger: 0.2,
                            scrollTrigger: {
                                trigger: featuresRef.current,
                                start: "top 80%",
                                end: "bottom 20%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                }
            }

            // 統計セクションのアニメーション
            if (statsRef.current) {
                const statItems = statsRef.current.querySelectorAll('.stat-item');
                if (statItems.length > 0) {
                    gsap.fromTo(statItems,
                        {y: 40, opacity: 0},
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            ease: "power2.out",
                            stagger: 0.1,
                            scrollTrigger: {
                                trigger: statsRef.current,
                                start: "top 85%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                }
            }

            // 証言セクションのアニメーション
            if (testimonialRef.current) {
                const testimonialCards = testimonialRef.current.querySelectorAll('.testimonial-card');
                if (testimonialCards.length > 0) {
                    gsap.fromTo(testimonialCards,
                        {x: -50, opacity: 0},
                        {
                            x: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.out",
                            stagger: 0.15,
                            scrollTrigger: {
                                trigger: testimonialRef.current,
                                start: "top 75%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                }
            }

            // CTAセクションのアニメーション
            if (ctaRef.current) {
                gsap.fromTo(ctaRef.current,
                    {y: 50, opacity: 0, scale: 0.95},
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: ctaRef.current,
                            start: "top 80%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }

            // パララックス効果
            const parallaxBg = document.querySelector('.parallax-bg');
            const parallaxSection = document.querySelector('.parallax-section');
            if (parallaxBg && parallaxSection) {
                gsap.to(parallaxBg, {
                    yPercent: -50,
                    ease: "none",
                    scrollTrigger: {
                        trigger: parallaxSection,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }

            return () => {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            };
        }
    }, []);

    const features = [
        {
            icon: <AutoAwesome sx={{fontSize: 32, color: '#000'}}/>,
            title: 'AI自動生成',
            description: '質問内容を入力するだけで、AIが最適なフォーム構成を瞬時に生成。平均10秒ほどで本格的なフォーム作成を実現できます。'
        },
        {
            icon: <Speed sx={{fontSize: 32, color: '#000'}}/>,
            title: 'リアルタイム回答',
            description: '質問ごとに回答を即座に送信することで、回答率の向上とUXの最適化を実現。'
        },
        {
            icon: <BarChart sx={{fontSize: 32, color: '#000'}}/>,
            title: '回答分析',
            description: '回答データを即座に可視化し、洞察を得られるダッシュボード。AIによる統計を基にした分析メッセージ出力も搭載。' 
        },
        {
            icon: <Shield sx={{fontSize: 32, color: '#000'}}/>,
            title: 'セキュア',
            description: 'プロキシとWAFを用いたセキュリティによるデータ保護を実現。'
        }
    ];

    const stacks = [
        {
            icon: <RiNextjsLine />,
            label: 'Next.js',
            description: 'フロントエンド',
            more: 'Webページをすばやく表示したり、ページの切り替えをスムーズにするためのフレームワークです。'
        },
        {
            icon: <RiSupabaseLine />,
            label: 'Supabase',
            description: 'データベース',
            more: 'アプリの中で使うデータを保存したり、あとから取り出すことができるクラウド型のデータベースサービスです。'
        },
        {
            icon: <SiKubernetes />,
            label: 'Kubernetes',
            description: 'コンテナオーケストレーション',
            more: 'マイクロサービスを自動で管理し、効率よく動かすための仕組みです。大規模なサービスに使われます。'
        },
        {
            icon: <SiGin />,
            label: 'Gin',
            description: 'AI用バックエンド',
            more: 'Go言語で書かれた、軽くて速いWebアプリケーションを作るためのフレームワークです。API開発によく使われます。'
        },
        {
            icon: <SiEnvoyproxy />,
            label: 'Envoy',
            description: 'プロキシ',
            more: 'ネットの通信をうまく振り分けて、サーバーにかかる負荷を減らす役割を持つソフトウェアです。'
        },
        {
            icon: <DiRedis />,
            label: 'Redis',
            description: 'インメモリデータストア',
            more: '一時的にデータを高速で保存・読み込みするための仕組みで、ゲームやチャットなどリアルタイム性が必要な場面で使われます。'
        },
    ];

    const languages = [
        {
            icon: <SiTypescript />,
            label: 'TypeScript',
            description: 'フロントエンド/バックエンド',
            more: 'JavaScriptに型のルールを加えることで、バグを見つけやすくし、より安全なプログラムを書くための言語です。'
        },
        {
            icon: <FaGolang />,
            label: 'Go',
            description: 'バックエンド/API',
            more: 'シンプルで読みやすく、しかも動作が速いため、サーバーやAPIの開発に多く使われるプログラミング言語です。'
        },
        {
            icon: <FaPython />,
            label: 'Python',
            description: 'AI/データ処理',
            more: 'コードがわかりやすく、AIやデータ分析、機械学習など幅広い分野で使われている人気の言語です。'
        },
        {
            icon: <TbSql />,
            label: 'SQL',
            description: 'データ操作/分析',
            more: 'データベースから必要な情報を取り出したり、集計や分析をするための専門的な言語です。'
        },
    ];


    const testimonials = [
        {
            name: 'M　Rさん',
            company: 'フロントエンドを担当',
            comment: '　私は非常に遠方から登校をしていますが、三年間毎日通い続けることができています。登下校時の電車内では勉強をしたり、読書をしたり時間の有効活用をすることで、成績を高めることができています。',
        },
        {
            name: 'T　Yさん',
            company: 'バックエンドを担当',
            comment: '科技高とかＪ科を死亡した理由とか。',
        },
        {
            name: 'U　Iさん',
            company: 'AI作成を担当',
            comment: 'なんか中学生に対してメッセージを考えて。',
        },
        {
            name: 'A　Kさん',
            company: 'フレキシブル',
            comment: '　情報系を学びたいと思うのであれば選ぶ学校、学科はここしかないと思います。他校よりも充実した学びの環境が整っており、自身のスキルアップに繋げることができます。また、進路についても幅広い選択肢があり、それぞれに合った進路に進むことができます。',
        },
    ]

    return (
        <Box sx={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
            <Header showBackButton={false} showNavigation={true}/>

            {/* ヒーローセクション */}
            <Box ref={heroRef} sx={{pt: 12, pb: 8, backgroundColor: '#000', color: '#fff'}}
                 className="parallax-section">
                <Box className="parallax-bg" sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '120%',
                    backgroundColor: 'linear-gradient(45deg, #000 0%, #333 100%)',
                    zIndex: -1
                }}/>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 4,
                        minHeight: '70vh'
                    }}>
                        <Box sx={{flex: {xs: '1 1 100%', md: '1 1 60%'}}}>
                            <Stack spacing={4}>
                                <Chip
                                    className="hero-chip"
                                    label="✨ AI-Powered Form Builder"
                                    sx={{
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#fff',
                                        color: '#000',
                                        fontWeight: 600,
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <Typography
                                    className="hero-title"
                                    variant="h1"
                                    component="h1"
                                    sx={{
                                        fontWeight: 900,
                                        fontSize: {xs: '3rem', md: '4.5rem'},
                                        lineHeight: 1.1,
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    <span style={{color: '#ff5555ff'}}>リアルタイム</span>と
                                    <span style={{color: '#00d9ff'}}>AI</span>を用いた
                                    <br/>
                                    <Box component="span" sx={{color: '#fff', textDecoration: 'underline'}}>
                                        アンケート
                                    </Box>
                                    <br/>
                                    <Box component="span" sx={{color: '#fff',fontSize: '2em'}}>
                                        FEEDO
                                    </Box>
                                </Typography>
                                <Typography
                                    className="hero-description"
                                    variant="h5"
                                    sx={{
                                        opacity: 0.8,
                                        fontWeight: 300,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    AIがあなたの質問を理解し、最適なフォームを瞬時に生成。
                                    <br/>
                                    データ収集から分析まで、すべてをシンプルに。
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{
                            flex: {xs: '1 1 100%', md: '1 1 40%'},
                            textAlign: 'center'
                        }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    borderRadius: 3,
                                    border: '2px solid #e0e0e0'
                                }}
                            >
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 3}}>
                                    従来のアンケートにはこんな問題があります
                                </Typography>
                                <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                                    回答者の問題
                                </Typography>
                                <Stack spacing={2}>
                                    {['質問数が多くて回答するのが面倒', '質問内容が理解できない', '回答に時間がかかる'].map((question, index) => (
                                        <Box key={index} sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: 2,
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            <CloseIcon sx={{fontSize: 18, color: '#000'}}/>
                                            <Typography variant="body2">{question}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Divider sx={{my: 4}}/>
                                <Typography variant="body1" sx={{fontWeight: 600, m: 2}}>
                                    集計者の問題
                                </Typography>
                                <Stack spacing={2}>
                                    {['アンケートの回答率が非常に低い', 'アンケートの作成に時間がかかる', '集計結果を分析・活用できていない'].map((question, index) => (
                                        <Box key={index} sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: 2,
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            <CloseIcon sx={{fontSize: 18, color: '#000'}}/>
                                            <Typography variant="body2">{question}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Divider sx={{my: 4}}/>
                                <Typography variant="caption" sx={{mt: 2, opacity: 0.6, display: 'block'}}>
                                    これらの問題は、宿泊業界の方々や宿泊者にヒアリングをして得られた結果です。
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* 使用しているスタックセクション */}
            <Box ref={statsRef} sx={{
                py: 6,
                backgroundColor: '#f8f8f8',
                borderTop: '1px solid #e0e0e0',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{textAlign: 'center', mb: 4}}>
                        <Typography variant="h4" sx={{fontWeight: 900, color: '#000'}}>
                            スタック一覧
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#000'}}>
                            Feedoは以下の技術スタックで構築されています
                        </Typography>
                        <Typography variant="body2" sx={{fontWeight: 500, textAlign: 'center'}}>
                            各スタックの詳細については、クリックしてご覧ください。
                        </Typography> 
                    </Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(3, 1fr)',
                                md: 'repeat(4, 1fr)'
                            },
                            gap: 4,
                            textAlign: 'center'
                        }}
                    >
                        {stacks.map((stack, index) => (
                            <Box
                                key={index}
                                className="stat-item"
                                sx={{
                                    p: 2,
                                    cursor: stack.more ? 'pointer' : 'default',
                                    borderRadius: 2,
                                    transition: 'background 0.2s, box-shadow 0.2s',
                                    '&:hover': stack.more ? {
                                        backgroundColor: '#ccccccff',
                                        boxShadow: 2,
                                    } : {},
                                    '&:active': stack.more ? {
                                        backgroundColor: '#5c5c5cff',
                                    } : {},
                                }}
                                onClick={() => {
                                    if (stack.more) {
                                        setModalContent({
                                            title: stack.label,
                                            description: stack.description,
                                            more: stack.more,
                                            icon: stack.icon
                                        });
                                        setModalOpen(true);
                                    }
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 900,
                                        color: '#000',
                                        fontSize: {xs: '2rem', md: '3rem'}
                                    }}
                                >
                                    {stack.icon}
                                </Typography>
                                <Typography variant="body1" sx={{opacity: 0.7, fontWeight: 500}}>
                                    {stack.label}
                                </Typography>
                                <Typography variant="body2" sx={{opacity: 0.6}}>
                                    {stack.description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>
            {/*使用している言語セクション*/}
            <Box ref={statsRef} sx={{
                py: 6,
                backgroundColor: '#f8f8f8',
                borderTop: '1px solid #e0e0e0',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{textAlign: 'center', mb: 4}}>
                        <Typography variant="h4" sx={{fontWeight: 900, color: '#000'}}>
                            使用言語一覧
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#000'}}>
                            Feedoは以下の言語で構築されています
                        </Typography>
                        <Typography variant="body2" sx={{fontWeight: 500, textAlign: 'center'}}>
                            各言語の詳細については、クリックしてご覧ください。
                        </Typography> 
                    </Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(3, 1fr)',
                                md: 'repeat(4, 1fr)'
                            },
                            gap: 4,
                            textAlign: 'center'
                        }}
                    >
                        {languages.map((language, index) => (
                            <Box
                                key={index}
                                className="stat-item"
                                sx={{
                                    p: 2,
                                    cursor: language.more ? 'pointer' : 'default',
                                    borderRadius: 2,
                                    transition: 'background 0.2s, box-shadow 0.2s',
                                    '&:hover': language.more ? {
                                        backgroundColor: '#ccccccff',
                                        boxShadow: 2,
                                    } : {},
                                    '&:active': language.more ? {
                                        backgroundColor: '#5c5c5cff',
                                    } : {},
                                }}
                                onClick={() => {
                                    if (language.more) {
                                        setModalContent({
                                            title: language.label,
                                            description: language.description,
                                            more: language.more,
                                            icon: language.icon
                                        });
                                        setModalOpen(true);
                                    }
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 900,
                                        color: '#000',
                                        fontSize: {xs: '2rem', md: '3rem'}
                                    }}
                                >
                                    {language.icon}
                                </Typography>
                                <Typography variant="body1" sx={{opacity: 0.7, fontWeight: 500}}>
                                    {language.label}
                                </Typography>
                                <Typography variant="body2" sx={{opacity: 0.6}}>
                                    {language.description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>
            {/* 詳細モーダル */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 3,
                    minWidth: 320,
                    maxWidth: 400,
                    outline: 'none'
                }}>
                    <Box sx={{textAlign: 'center', mb: 2}}>
                        <Typography variant="h3" sx={{fontWeight: 900, mb: 1}}>
                            {modalContent.icon}
                        </Typography>
                        <Typography id="modal-title" variant="h5" sx={{fontWeight: 700}}>
                            {modalContent.title}
                        </Typography>
                        <Typography variant="body2" sx={{opacity: 0.7, mb: 2}}>
                            {modalContent.description}
                        </Typography>
                        <Divider sx={{my: 2}} />
                        <Typography
                            id="modal-description"
                            variant="body1"
                            sx={{fontWeight: 500, textAlign: 'left'}}
                        >
                            {modalContent.more}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => setModalOpen(false)}
                    >
                        閉じる
                    </Button>
                </Box>
            </Modal>
            {/* 機能紹介セクション */}
            <Container ref={featuresRef} maxWidth="lg" sx={{py: 10}}>
                <Box className="features-header" sx={{textAlign: 'center', mb: 8}}>
                    <Typography
                        variant="h2"
                        component="h2"
                        sx={{
                            fontWeight: 900,
                            mb: 3,
                            fontSize: {xs: '2.5rem', md: '3.5rem'},
                            color: '#000'
                        }}
                    >
                        Feedoの主な機能
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    justifyContent: 'center'
                }}>
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="feature-card"
                            elevation={0}
                            sx={{
                                flex: {xs: '1 1 100%', md: '1 1 calc(50% - 16px)'},
                                maxWidth: 500,
                                border: '1px solid #e0e0e0',
                                borderRadius: 3,
                                p: 3,
                                '&:hover': {
                                    borderColor: '#000',
                                    transform: 'translateY(-4px)',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            <Stack spacing={3} alignItems="flex-start">
                                <Box
                                    sx={{
                                        p: 2,
                                        backgroundColor: '#f8f8f8',
                                        borderRadius: 2,
                                        border: '1px solid #e0e0e0'
                                    }}
                                >
                                    {feature.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h5" component="h3"
                                                sx={{fontWeight: 700, mb: 2, color: '#000'}}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{lineHeight: 1.7}}>
                                        {feature.description}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    ))}
                </Box>
            </Container>

            {/* メッセージセクション */}
            <Box ref={testimonialRef} sx={{py: 10, backgroundColor: '#000', color: '#fff'}}>
                <Container maxWidth="lg">
                    <Box className="testimonials-header" sx={{textAlign: 'center', mb: 8}}>
                        <Typography
                            variant="h2"
                            component="h2"
                            sx={{
                                fontWeight: 900,
                                mb: 3,
                                fontSize: {xs: '2.5rem', md: '3.5rem'}
                            }}
                        >
                            開発者からのメッセージ
                        </Typography>
                        <Typography variant="h6" sx={{opacity: 0.8, maxWidth: 600, mx: 'auto'}}>
                            FEEDOを開発したメンバーから<br/>科学技術高校や情報システム科を<br/>志望する中学生の皆さんへメッセージです。
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        justifyContent: 'center'
                    }}>
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="testimonial-card"
                                elevation={0}
                                sx={{
                                    flex: {xs: '1 1 100%', md: '1 1 calc(50% - 16px)'},
                                    maxWidth: 500,
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    borderRadius: 3,
                                    p: 4
                                }}
                            >
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                            {testimonial.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {testimonial.company}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{lineHeight: 1.8,}}>
                                        {testimonial.comment.split('\n').map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                {line}
                                                {idx < testimonial.comment.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </Typography>

                                </Stack>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* CTAセクション */}
            <Container ref={ctaRef} maxWidth="md" sx={{py: 12, textAlign: 'center'}}>
                <Stack spacing={4}>
                    <Typography
                        className="cta-title"
                        variant="h2"
                        sx={{
                            fontWeight: 900,
                            fontSize: {xs: '2.5rem', md: '3.5rem'},
                            color: '#000'
                        }}
                    >
                        詳しくは、J科展へ
                    </Typography>
                    <Typography className="cta-description" variant="h6" sx={{opacity: 0.7, mx: 'auto'}}>
                        実習棟東側3階にて、FEEDOの展示を行っています。
                        <br/>
                        詳しい説明やアンケート制作画面などをご覧いただけます。
                    </Typography>
                </Stack>
            </Container>

            {/* フッター */}
            <Box sx={{backgroundColor: '#f8f8f8', borderTop: '1px solid #e0e0e0', py: 6}}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{flex: {xs: '1 1 100%', md: '1 1 50%'}}}>
                            <Typography variant="h4" sx={{fontWeight: 900, mb: 2, color: '#000'}}>
                                FEEDO
                            </Typography>
                            <Typography variant="body1" sx={{opacity: 0.7}}>
                                AIの力でフォーム作成をDXする次世代フォーム作成アプリ。
                                <br />
                                データ収集から分析まで、すべてをシンプルに。
                            </Typography>
                        </Box>
                    </Box>
                    <Divider sx={{my: 4}}/>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Typography variant="body2" sx={{opacity: 0.6, textAlign: 'center'}}>
                            © 2025 FEEDO. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}