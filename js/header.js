// ========================================================================
// 全站共用的頂部導覽列（含手機版漢堡選單、語言切換鈕）
// 五個頁面（index/gongfa/activities/calendar/faq）都只需要：
//   1. 在原本放 <header> 的地方換成 <div id="site-header"></div>
//   2. 引入這支檔案：<script src="header.js"></script>（要放在 lang.js 之後）
// 之後要改導覽列的任何東西（新增頁面、改文字、改樣式），只要改這支檔案一次，
// 全站五個頁面都會同步更新，不用每個頁面各改一次
// ========================================================================

function renderSiteHeader() {
    const placeholder = document.getElementById('site-header');
    if (!placeholder) return;

    // 依目前網址自動判斷是哪一頁，用來把對應的選單連結標記成「使用中」樣式
    // 之後如果新增頁面，只要在這個對照表多加一行就好
    const PAGE_MAP = {
        'index.html': 'home',
        '': 'home',
        'gongfa.html': 'method',
        'activities.html': 'activities',
        'calendar.html': 'calendar',
        'faq.html': 'faq'
    };
    const fileName = location.pathname.split('/').pop();
    const current = PAGE_MAP[fileName] !== undefined ? PAGE_MAP[fileName] : 'home';

    // 導覽選單的所有連結定義在這個陣列裡：之後新增/刪除頁面、改連結文字，只要改這裡
    const NAV_ITEMS = [
        { key: 'home', href: 'index.html', className: 'nav-link-home', label: '首頁主殿' },
        { key: 'method', href: 'gongfa.html', className: 'nav-link-method', label: '法門深造' },
        { key: 'activities', href: 'activities.html', className: 'nav-link-activities', label: '活動介紹' },
        { key: 'calendar', href: 'calendar.html', className: 'nav-link-calendar', label: '修煉日程' },
        { key: 'faq', href: 'faq.html', className: 'nav-link-faq', label: '常見問題' }
    ];

    const ACTIVE_DESKTOP = 'no-underline text-sm tracking-widest text-bronze-light font-bold';
    const INACTIVE_DESKTOP = 'no-underline text-sm tracking-widest text-cloud/70 hover:text-bronze-light transition-colors duration-300';
    const ACTIVE_MOBILE = 'no-underline text-sm tracking-widest text-bronze-light font-bold w-full text-center block';
    const INACTIVE_MOBILE = 'no-underline text-sm tracking-widest text-cloud hover:text-bronze-light transition-colors w-full text-center block';

    function renderLinks(activeClass, inactiveClass) {
        return NAV_ITEMS.map(item => {
            const cls = (item.key === current) ? activeClass : inactiveClass;
            return `<a href="${item.href}" class="${item.className} ${cls}">${item.label}</a>`;
        }).join('\n                ');
    }

    placeholder.innerHTML = `
    <!-- 手機版漢堡選單按鈕 / 中英文切換按鈕：因部分頁面關閉了 Tailwind 的 preflight，
         瀏覽器預設的按鈕白底樣式會跑出來，這裡統一重置 -->
    <style>
        #mobile-menu-btn {
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
        }
        #lang-toggle-desktop, #lang-toggle-mobile {
            background: none;
            border-style: solid;
            cursor: pointer;
            font-family: inherit;
        }
    </style>

    <header class="sticky top-0 left-0 w-full z-50 bg-ink-deep/90 backdrop-blur-md border-b border-white/5 py-4">
        <div class="max-w-7xl mx-auto px-6 flex justify-between items-center relative">

            <!-- 左側：道場牌匾 + 手機版語言切換鈕（一直顯示，不用點開漢堡選單） -->
            <div class="flex items-center gap-3">
                <a href="index.html" class="text-xl font-bold tracking-widest text-bronze-light flex items-center gap-2 transition-colors duration-300 hover:text-white no-underline">
                    <span id="nav-badge" class="text-xs border border-solid border-bronze px-1.5 py-0.5 rounded whitespace-nowrap">政大</span>
                    <span id="nav-brand" class="whitespace-nowrap">太極社</span> <span id="nav-brand-sub" class="hidden sm:inline font-light text-sm text-cloud/70 whitespace-nowrap">| 隱逸道場</span>
                </a>
                <button id="lang-toggle-mobile" type="button" class="md:hidden text-xs tracking-widest text-bronze-light border border-bronze/50 rounded px-2 py-1 hover:bg-bronze/10 transition-colors">EN</button>
            </div>

            <!-- 右側：電腦版跨頁導覽連結 -->
            <nav class="hidden md:flex gap-8 items-center">
                ${renderLinks(ACTIVE_DESKTOP, INACTIVE_DESKTOP)}
                <button id="lang-toggle-desktop" type="button" class="text-xs tracking-widest text-bronze-light border border-bronze/50 rounded px-2.5 py-1 hover:bg-bronze/10 transition-colors">EN</button>
            </nav>

            <!-- 右側：手機版漢堡選單按鈕 -->
            <button id="mobile-menu-btn" class="md:hidden text-bronze-light hover:text-white focus:outline-none transition-colors">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </div>

        <!-- 手機版下拉選單區塊 -->
        <nav id="mobile-menu" class="hidden md:hidden absolute top-full left-0 w-full bg-ink-deep/95 backdrop-blur-lg border-b border-white/10 flex-col items-center py-6 space-y-6 shadow-2xl transition-all duration-300 z-40">
            ${renderLinks(ACTIVE_MOBILE, INACTIVE_MOBILE)}
        </nav>
    </header>
    `;

    // 綁定手機版選單開關
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
        });
    }

    // 初始化語言切換按鈕（initLangSwitcher 定義在 lang.js，要確保 lang.js 比這支檔案先載入）
    if (typeof initLangSwitcher === 'function') {
        initLangSwitcher('lang-toggle-desktop');
        initLangSwitcher('lang-toggle-mobile');
    }

    // 導覽列文字（品牌名稱、選單文字）改讀取 data/home.json，跟主要內容資料分開抓一次，
    // 這樣每個頁面不用自己再寫一次抓 nav 資料的程式碼
    fetch('data/home.json?v=' + Date.now())
        .then(response => response.json())
        .then(data => {
            if (typeof applyLangToData === 'function') data = applyLangToData(data);
            if (!data.nav) return;
            const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el && value !== undefined && value !== null) el.innerText = value;
            };
            const setTextAll = (className, value) => {
                if (value === undefined || value === null) return;
                document.querySelectorAll('.' + className).forEach(el => el.innerText = value);
            };
            setText('nav-badge', data.nav.badge);
            setText('nav-brand', data.nav.brand);
            if (data.nav.brand_sub) setText('nav-brand-sub', '| ' + data.nav.brand_sub);
            setTextAll('nav-link-home', data.nav.link_home);
            setTextAll('nav-link-method', data.nav.link_method);
            setTextAll('nav-link-activities', data.nav.link_activities);
            setTextAll('nav-link-calendar', data.nav.link_calendar);
            setTextAll('nav-link-faq', data.nav.link_faq);

            // 把這次抓到的「道場開啟中」文字存起來，下一頁（或下次造訪）的遮罩就會顯示這個版本
            if (data.nav.loading_text && typeof setCachedLoadingText === 'function') {
                setCachedLoadingText(data.nav.loading_text);
            }
        })
        .catch(error => console.error('讀取 data/home.json 失敗：', error));
}

renderSiteHeader();
