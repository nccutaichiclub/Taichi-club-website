// ========================================================================
// 全站共用的語言切換邏輯（中文／English）
// 四個頁面（index/gongfa/activities/calendar）都會引入這支檔案
//
// 運作方式：
// 1. 語言偏好存在瀏覽器的 localStorage，跨頁面切換時會記住選擇
// 2. 後台每個文字欄位旁邊會多一個「欄位名_en」的英文版欄位
// 3. pickText() 會依目前語言自動挑欄位；英文模式下若該欄位還沒填英文翻譯，
//    會自動 fallback 顯示中文，不會開天窗
// ========================================================================

const SITE_LANG_KEY = 'nccu_taichi_lang';

function getLang() {
    return localStorage.getItem(SITE_LANG_KEY) || 'zh';
}

function setLang(lang) {
    localStorage.setItem(SITE_LANG_KEY, lang);
}

// 依目前語言，從資料物件裡取出對應欄位文字（單一欄位用）
// obj: 資料物件（例如 data.nav）；fieldName: 欄位名稱（例如 'badge'）
// 英文版欄位命名規則固定是「欄位名 + _en」，例如 badge_en
function pickText(obj, fieldName) {
    if (!obj) return '';
    if (getLang() === 'en') {
        const enVal = obj[fieldName + '_en'];
        if (enVal !== undefined && enVal !== null && String(enVal).trim() !== '') {
            return enVal;
        }
    }
    const zhVal = obj[fieldName];
    return (zhVal !== undefined && zhVal !== null) ? zhVal : '';
}

// 整批轉換：遞迴走訪整個 JSON 資料，把每個「欄位_en」的英文版本套用回對應欄位本身
// （只在英文模式、且該筆有填英文翻譯時才替換；沒填就維持中文，不會開天窗）
// 套用這個函式之後，後面所有讀取 data.xxx.yyy 的渲染程式碼完全不用更動，
// 因為欄位裡已經是正確語言的文字了；圖片/檔案欄位因為沒有 "_en" 版本，天生就不會被動到
function applyLangToData(data) {
    if (getLang() !== 'en') return data; // 中文模式不用處理，原始資料本來就是中文
    function walk(node) {
        if (Array.isArray(node)) {
            node.forEach(walk);
            return;
        }
        if (node && typeof node === 'object') {
            Object.keys(node).forEach(key => {
                if (key.endsWith('_en')) return; // 英文欄位本身不用再處理
                const enKey = key + '_en';
                if (Object.prototype.hasOwnProperty.call(node, enKey)) {
                    const enVal = node[enKey];
                    if (typeof enVal === 'string' && enVal.trim() !== '') {
                        node[key] = enVal; // 覆蓋成英文版本
                    }
                }
                walk(node[key]);
            });
        }
    }
    walk(data);
    return data;
}

// 初始化語言切換按鈕：綁定點擊事件、顯示目前應該顯示的按鈕文字
// 點擊後切換語言並重新整理頁面，讓所有內容套用新語言
function initLangSwitcher(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    function render() {
        btn.innerText = getLang() === 'en' ? '中文' : 'EN';
    }
    render();
    btn.addEventListener('click', () => {
        setLang(getLang() === 'en' ? 'zh' : 'en');
        location.reload();
    });
}

// ========================================================================
// 簡易文字標記語法：讓後台可以在白色內文裡標記「加粗」或「金色標註」
// 語法：**文字** 會變成加粗；[[文字]] 會變成金色標註
// 用法：把原本 el.innerText = value 改成 el.innerHTML = parseInlineMarkup(value)
// ========================================================================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseInlineMarkup(text) {
    if (text === undefined || text === null) return '';
    // 先跳脫特殊字元，避免後台萬一打進奇怪符號被誤判成程式碼
    let escaped = escapeHtml(text).replace(/\n/g, '<br>');
    // 金色標註：[[文字]] 是手動輸入的寫法；`文字`（反引號）則對應後台 markdown 欄位裡的
    // 「Code」按鈕（本站借用這顆按鈕做金色標註，不是真的程式碼格式）；兩種寫法都支援
    escaped = escaped.replace(/\[\[(.+?)\]\]/g, '<span class="hl-gold">$1</span>');
    escaped = escaped.replace(/`(.+?)`/g, '<span class="hl-gold">$1</span>');
    // 綠色標註：~~文字~~ 對應後台 markdown 欄位裡的「Strikethrough(刪除線)」按鈕
    // （本站借用這顆按鈕做綠色標註，不是真的刪除線效果）
    escaped = escaped.replace(/~~(.+?)~~/g, '<span class="hl-green">$1</span>');
    // 加粗：**文字**，對應後台 markdown 欄位裡的「Bold」按鈕
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return escaped;
}

// ========================================================================
// 原本每個頁面各自重複定義的共用小工具，統一搬到這裡，五個頁面共用同一份
// ========================================================================

// 圖片路徑防呆：本網站放在 .../Taichi-club-website/ 這個子路徑下，
// 如果圖片路徑意外帶了開頭的 "/"，這裡統一拿掉，改成正確的相對路徑
function resolveImagePath(path) {
    if (!path) return '';
    return path.replace(/^\/+/, '');
}

// 設定純文字內容（不支援標記語法，用於標題/標籤等短文字）
function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.innerText = value;
}

// 設定同一 class 底下所有元素的純文字內容（用於導覽列等重複出現的文字）
function setTextAll(className, value) {
    if (value === undefined || value === null) return;
    document.querySelectorAll('.' + className).forEach(el => el.innerText = value);
}

// 設定支援標記語法（**加粗**、[[金色標註]]）的內文內容
function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.innerHTML = parseInlineMarkup(value);
}

// 把後台填的「純文字」自動轉成一段一段的 <p>：空一行 = 分段；段落內單純換行 = 換行(<br>)
// 同時支援標記語法：**文字** 加粗、[[文字]] 金色標註
function paragraphize(text) {
    if (!text) return '';
    return text
        .split(/\n\s*\n/)
        .map(p => `<p>${parseInlineMarkup(p.trim())}</p>`)
        .join('');
}

// 網頁最上層的語言標示（對 SEO、螢幕報讀器、瀏覽器內建翻譯功能都有幫助）
document.documentElement.lang = (getLang() === 'en') ? 'en' : 'zh-TW';

// ========================================================================
// 頁面載入遮罩：在資料還沒從 data/*.json 抓回來、內容還是預留文字的這段期間，
// 用一層全螢幕遮罩蓋住畫面，避免訪客先看到預留文字、資料抓回來才「跳成」正確內容的閃爍感。
// 每個頁面的資料抓取完成後（不管成功或失敗）都要呼叫這個函式把遮罩淡出移除。
// ========================================================================
function hidePageLoadingOverlay() {
    const el = document.getElementById('page-loading-overlay');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
}

// 「道場開啟中...」這段遮罩文字：因為遮罩本來就是在資料抓回來「之前」顯示的，
// 沒辦法讓它在第一次顯示的當下就抓到後台文字（資料還在路上），所以改用瀏覽器儲存空間
// 快取上一次成功抓到的文字，這樣訪客逛到下一頁（或下次造訪）時就會顯示後台設定的版本。
const LOADING_TEXT_CACHE_KEY = 'nccu_taichi_loading_text';

function getCachedLoadingText() {
    try {
        return localStorage.getItem(LOADING_TEXT_CACHE_KEY);
    } catch (e) {
        return null;
    }
}

function setCachedLoadingText(text) {
    if (!text) return;
    try {
        localStorage.setItem(LOADING_TEXT_CACHE_KEY, text);
    } catch (e) {
        // 瀏覽器擋掉儲存功能時就放棄快取，不影響其他功能
    }
}

// 在 <body> 加上語言標記 class，讓 CSS 可以針對「手機版 + 英文模式」單獨調整標題字級/行距，
// 不會影響電腦版跟中文模式
if (document.body) {
    document.body.classList.toggle('lang-en', getLang() === 'en');
}
