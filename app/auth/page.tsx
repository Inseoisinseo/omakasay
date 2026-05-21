'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AuthPage() {
    const { signInWithKakao } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isInAppBrowser, setIsInAppBrowser] = useState(false)

    useEffect(() => {
        const ua = navigator.userAgent
        const inApp = /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|Twitter/i.test(ua)
        setIsInAppBrowser(inApp)
    }, [])

    const handleKakaoLogin = async () => {
        setLoading(true)
        await signInWithKakao()
        setLoading(false)
    }

    const openInExternalBrowser = () => {
        const url = window.location.href
        // iOS KakaoTalk: kakaotalk://web/openExternal
        if (/KAKAOTALK/i.test(navigator.userAgent)) {
            window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`
        } else {
            window.open(url, '_blank')
        }
    }

    return (
        <main
            className="min-h-screen w-full flex flex-col items-center justify-center px-6"
            style={{ backgroundColor: '#fffcef' }}
        >
            {/* 인앱브라우저 감지 배너 */}
            {isInAppBrowser && (
                <div
                    className="fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-[13px] leading-snug"
                    style={{
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        fontFamily: 'var(--font-noto-sans-kr)',
                    }}
                >
                    카카오톡 내부 브라우저에서는 로그인이 제한됩니다.
                    <button
                        onClick={openInExternalBrowser}
                        className="ml-2 underline underline-offset-2 font-medium"
                    >
                        Safari로 열기
                    </button>
                </div>
            )}
            {/* Card */}
            <div
                className="w-full max-w-xs rounded-3xl px-7 py-9 flex flex-col items-center gap-5"
                style={{
                    background: 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 1.5px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.7)',
                }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center gap-1">
                    <span
                        className="text-[28px] tracking-tight"
                        style={{ fontFamily: 'var(--font-pacifico)', color: '#171717' }}
                    >
                        omakasay
                    </span>
                    <p
                        className="text-[13px] text-gray-400 text-center leading-snug"
                        style={{ fontFamily: 'var(--font-noto-sans-kr)' }}
                    >
                        여행지 언어를 내 말처럼
                    </p>
                </div>

                {/* Kakao button */}
                <div className="w-full">
                    <button
                        onClick={handleKakaoLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-medium transition-all duration-150 hover:brightness-95 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: '#FEE500',
                            color: 'rgba(0,0,0,0.85)',
                            fontFamily: 'var(--font-noto-sans-kr)',
                        }}
                    >
                        <KakaoIcon />
                        {loading ? '로그인 중...' : '카카오로 계속하기'}
                    </button>
                </div>

                {/* Footer note */}
                <p
                    className="text-[11px] text-gray-300 text-center leading-relaxed"
                    style={{ fontFamily: 'var(--font-noto-sans-kr)' }}
                >
                    로그인 시 서비스 이용약관 및<br />개인정보처리방침에 동의하게 됩니다.
                </p>
            </div>
        </main>
    )
}

function KakaoIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.378c0 2.07 1.297 3.888 3.264 4.949L3.9 15.21a.187.187 0 0 0 .273.207L8.1 13.04c.294.03.594.046.9.046 4.142 0 7.5-2.634 7.5-5.878C16.5 4.134 13.142 1.5 9 1.5z"
                fill="rgba(0,0,0,0.85)"
            />
        </svg>
    )
}
