// ========================================================================
// 四個子頁（gongfa/activities/calendar/faq）共用的 Tailwind 設定
// 要放在 Tailwind CDN <script> 之後、其他頁面內容之前載入
// ========================================================================
tailwind.config = {
    // 關閉 preflight（Tailwind 的預設樣式重置），避免影響子頁原本手寫的 CSS
    corePlugins: { preflight: false },
    theme: {
        extend: {
            colors: {
                ink: { deep: '#08090A', dark: '#111315', card: '#181B1E' },
                cloud: '#8E95A0',
                pine: { light: '#427A5B', DEFAULT: '#1E3D2F', dark: '#0F2118' },
                bronze: { light: '#D9C39E', DEFAULT: '#B89742', dark: '#8C6C30' }
            },
            fontFamily: { serif: ['Noto Serif TC', 'serif'] }
        }
    }
}
