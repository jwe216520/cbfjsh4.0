console.log("靠北輔中 4.0 啟動成功");

/* ================================
   DOM 載入完成
================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* ================================
       動態載入 Header
    ================================= */

    const headerRes = await fetch("components/header.html");
    const headerHtml = await headerRes.text();

    document.body.insertAdjacentHTML(
        "afterbegin",
        headerHtml
    );

    /* ================================
       動態載入 Footer
    ================================= */

    const footerRes = await fetch("components/footer.html");
    const footerHtml = await footerRes.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        footerHtml
    );

    /* ================================
       漢堡選單
    ================================= */

    const hamburger =
    document.getElementById("hamburger-btn");

    const nav =
    document.getElementById("main-nav");

    /* ✔ 點漢堡開關選單 */

    if (hamburger && nav) {

        hamburger.addEventListener("click", () => {

            nav.classList.toggle("active");
        });
    }

    /* ================================
       手機版 Dropdown
    ================================= */

    const dropdowns =
    document.querySelectorAll(".dropdown");

    dropdowns.forEach((dropdown) => {

        const button =
        dropdown.querySelector(".dropbtn");

        if (!button) return;

        button.addEventListener("click", () => {

            /* 只有手機 / 平板啟用 */
            if (window.innerWidth <= 1024) {

                dropdown.classList.toggle("open");
            }
        });
    });

    /* ================================
       點外部自動關閉選單
    ================================= */

    if (nav) {

        document.addEventListener("click", (e) => {

            const isInsideNav =
            nav.contains(e.target);

            const isHamburger =
            hamburger?.contains(e.target);

            if (!isInsideNav && !isHamburger) {

                nav.classList.remove("active");
            }
        });
    }

    /* ================================
       初始化滾動動畫
    ================================= */

    initScrollAnimation();

});

/* ================================
   滾動動畫
================================ */

function initScrollAnimation() {

    const cards =
    document.querySelectorAll(".glass-card");

    /* 初始狀態 */

    cards.forEach((card) => {

        card.style.opacity = "0";

        card.style.transform =
        "translateY(40px)";

        card.style.transition =
        "0.6s ease";
    });

    /* 顯示動畫 */

    function showCards() {

        cards.forEach((card) => {

            const top =
            card.getBoundingClientRect().top;

            if (top < window.innerHeight - 100) {

                card.style.opacity = "1";

                card.style.transform =
                "translateY(0px)";
            }
        });
    }

    window.addEventListener(
        "scroll",
        showCards
    );

    showCards();
}

/* ================================
   投稿頁 - checkbox 控制按鈕
   （只在 submit_gate.html 生效）
================================ */

document.addEventListener("DOMContentLoaded", () => {

    const checkbox =
    document.getElementById("agree-check");

    const button =
    document.getElementById("enter-submit");

    /* ✔ 如果不是投稿頁就直接跳過 */

    if (!checkbox || !button) return;

    /* ================================
       checkbox 控制按鈕
    ================================= */

    function updateState() {

        button.disabled =
        !checkbox.checked;
    }

    checkbox.addEventListener(
        "change",
        updateState
    );

    updateState();

    /* ================================
       投稿按鈕跳轉
    ================================= */

    button.addEventListener("click", () => {

        /* ✔ 沒勾選直接阻止 */

/*         if (button.disabled) return;

        const url =
        "submit.html"; */
        window.location.href = "submit.html";

        /* ✔ 新分頁開啟 */

        const newWindow =
        window.open(url, "_blank");

        /* ✔ 如果被瀏覽器阻擋 */

        if (!newWindow) {

            window.location.href =
            url;
        }
    });
});

/* ================================================
   submit.js
   靠北輔中 4.0 — 投稿頁專屬互動邏輯

   功能清單：
   1. 字數即時計數（含顏色警示）
   2. 多圖上傳（最多 5 張、每張 ≤ 10 MB）
   3. 拖曳上傳（Drag & Drop）
   4. 圖片預覽 + 個別刪除
   5. 模擬上傳進度條
   6. 表單驗證 + 錯誤提示
   7. 提交後顯示成功畫面與回憶代碼
   8. 「再次投稿」重置表單
================================================ */

/* ------------------------------------------------
   等待 DOM 完全載入再執行
------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

    /* ============================================
       取得 DOM 元素
    ============================================ */

    /* 文字輸入框 */
    const textarea     = document.getElementById("post-content");

    /* 字數顯示 */
    const charNow      = document.getElementById("char-now");
    const charCounter  = textarea
                            ? textarea.closest(".form-group")
                                      .querySelector(".char-counter")
                            : null;

    /* 圖片 input */
    const fileInput    = document.getElementById("post-image");

    /* 拖曳上傳區 */
    const dropzone     = document.getElementById("upload-dropzone");

    /* 預覽清單容器 */
    const previewList  = document.getElementById("image-preview-list");

    /* 進度條相關 */
    const progressWrap = document.getElementById("upload-progress-wrap");
    const progressBar  = document.getElementById("upload-progress-bar");
    const progressFile = document.getElementById("upload-progress-filename");
    const progressPct  = document.getElementById("upload-progress-pct");

    /* 錯誤訊息區 */
    const formError    = document.getElementById("form-error");

    /* 表單 */
    const form         = document.getElementById("submit-form");

    /* 提交按鈕 */
    const submitBtn    = document.getElementById("submit-btn");

    /* 成功提示 */
    const successBox   = document.getElementById("submit-success");

    /* 再次投稿按鈕 */
    const againBtn     = document.getElementById("submit-again-btn");

    /* 回憶代碼顯示 */
    const recallCode   = document.getElementById("recall-code");

    /* ============================================
       狀態管理
       selectedFiles：目前已選定的圖片 File 陣列
    ============================================ */
    let selectedFiles = []; /* File 物件陣列，最多 5 個 */

    /* ============================================
       1. 字數即時計數
    ============================================ */

    if (textarea && charNow && charCounter) {

        textarea.addEventListener("input", () => {
            updateCharCount();
        });

        /**
         * 更新字數顯示，並在接近上限時切換警示樣式。
         */
        function updateCharCount() {

            const len = textarea.value.length;

            /* 更新數字 */
            charNow.textContent = len.toLocaleString(); /* 千分位格式 */

            /* 移除舊狀態 */
            charCounter.classList.remove("warn", "limit");

            if (len >= 10000) {
                /* 達到上限 → 紅色 */
                charCounter.classList.add("limit");

            } else if (len >= 9000) {
                /* 接近上限 → 橘色警示 */
                charCounter.classList.add("warn");
            }
        }
    }

    /* ============================================
       2. 圖片上傳核心邏輯
    ============================================ */

    /**
     * 驗證並加入新圖片。
     * @param {FileList|File[]} files  - 來自 input 或 drag 的檔案清單
     */
    function handleFilesAdded(files) {

        clearError(); /* 清除舊錯誤 */

        const MAX_COUNT     = 5;
        const MAX_SIZE_MB   = 10;
        const MAX_SIZE_BYTE = MAX_SIZE_MB * 1024 * 1024;
        const VALID_TYPES   = ["image/jpeg", "image/png", "image/gif", "image/webp"];

        /* 可以再加幾張 */
        const remaining = MAX_COUNT - selectedFiles.length;

        if (remaining <= 0) {
            showError(`最多只能附加 ${MAX_COUNT} 張圖片。`);
            return;
        }

        /* 轉成陣列方便操作 */
        const incoming = Array.from(files).slice(0, remaining);

        let errorMessages = [];

        incoming.forEach((file) => {

            /* 檢查格式 */
            if (!VALID_TYPES.includes(file.type)) {
                errorMessages.push(`「${file.name}」格式不支援，請上傳 JPG / PNG / GIF / WebP。`);
                return; /* 跳過此檔 */
            }

            /* 檢查大小 */
            if (file.size > MAX_SIZE_BYTE) {
                errorMessages.push(`「${file.name}」超過 ${MAX_SIZE_MB} MB 限制。`);
                return; /* 跳過此檔 */
            }

            /* 加入陣列 */
            selectedFiles.push(file);
        });

        if (errorMessages.length > 0) {
            showError(errorMessages.join("<br>"));
        }

        /* 依序模擬上傳（每次一張） */
        simulateUploadsSequentially(incoming.filter((f) => {
            /* 只模擬通過驗證的檔案 */
            return VALID_TYPES.includes(f.type) && f.size <= MAX_SIZE_BYTE;
        }));

        /* 更新預覽 UI */
        refreshPreview();

        /* 更新 dropzone 狀態（滿了就 disable） */
        updateDropzoneState();

        /* 重置 file input，讓同一檔案可再次選取 */
        if (fileInput) fileInput.value = "";
    }

    /* ============================================
       3. 拖曳上傳（Drag & Drop）
    ============================================ */

    if (dropzone) {

        /* 防止瀏覽器預設開啟圖片 */
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        /* 拖曳進入：高亮邊框 */
        dropzone.addEventListener("dragenter", () => {
            dropzone.classList.add("dragover");
        });

        dropzone.addEventListener("dragover", () => {
            dropzone.classList.add("dragover");
        });

        /* 拖曳離開：移除高亮 */
        dropzone.addEventListener("dragleave", (e) => {
            /* 只有真正離開 dropzone 才移除（避免子元素觸發） */
            if (!dropzone.contains(e.relatedTarget)) {
                dropzone.classList.remove("dragover");
            }
        });

        /* 放下檔案 */
        dropzone.addEventListener("drop", (e) => {
            dropzone.classList.remove("dragover");
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles && droppedFiles.length > 0) {
                handleFilesAdded(droppedFiles);
            }
        });
    }

    /* file input 選檔 */
    if (fileInput) {
        fileInput.addEventListener("change", () => {
            if (fileInput.files && fileInput.files.length > 0) {
                handleFilesAdded(fileInput.files);
            }
        });
    }

    /* ============================================
       4. 圖片預覽 + 個別刪除
    ============================================ */

    /**
     * 根據 selectedFiles 陣列，重新渲染預覽清單。
     */
    function refreshPreview() {

        if (!previewList) return;

        /* 清空舊的預覽 */
        previewList.innerHTML = "";

        selectedFiles.forEach((file, index) => {

            /* 建立預覽項目 */
            const item = document.createElement("div");
            item.className = "preview-item";
            item.dataset.index = index;

            /* 圖片元素 */
            const img = document.createElement("img");
            img.alt = `預覽圖 ${index + 1}`;

            /* 使用 FileReader 讀取本地圖片 */
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);

            /* 刪除按鈕（× 符號） */
            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "preview-remove-btn";
            removeBtn.textContent = "×";
            removeBtn.setAttribute("aria-label", `移除第 ${index + 1} 張圖片`);

            /* 刪除事件 */
            removeBtn.addEventListener("click", () => {
                removeImage(index);
            });

            /* 序號標籤 */
            const badge = document.createElement("span");
            badge.className = "preview-index";
            badge.textContent = `${index + 1} / 5`;

            /* 組裝 */
            item.appendChild(img);
            item.appendChild(removeBtn);
            item.appendChild(badge);
            previewList.appendChild(item);
        });
    }

    /**
     * 移除指定索引的圖片，並重新渲染預覽。
     * @param {number} index - selectedFiles 中的索引
     */
    function removeImage(index) {

        /* 取得對應的 DOM 元素 */
        const items = previewList.querySelectorAll(".preview-item");
        const target = items[index];

        if (target) {
            /* 加上退場動畫 class */
            target.classList.add("removing");

            /* 動畫結束後才從 DOM 移除，並更新資料 */
            target.addEventListener("animationend", () => {

                /* 從陣列中移除 */
                selectedFiles.splice(index, 1);

                /* 重新渲染（會重建全部 DOM） */
                refreshPreview();

                /* 更新 dropzone 狀態 */
                updateDropzoneState();

            }, { once: true }); /* once: true 確保只執行一次 */

        } else {
            /* 若找不到 DOM（防禦性處理） */
            selectedFiles.splice(index, 1);
            refreshPreview();
            updateDropzoneState();
        }
    }

    /**
     * 根據已選圖片數量，切換 dropzone 的可用狀態。
     */
    function updateDropzoneState() {

        if (!dropzone) return;

        if (selectedFiles.length >= 5) {
            dropzone.classList.add("disabled");
        } else {
            dropzone.classList.remove("disabled");
        }
    }

    /* ============================================
       5. 模擬上傳進度條
       （實際後台串接時，改成真實 XMLHttpRequest
         或 fetch + ReadableStream 即可）
    ============================================ */

    /**
     * 依序模擬多張圖片的上傳進度。
     * @param {File[]} files - 要模擬上傳的 File 陣列
     */
    function simulateUploadsSequentially(files) {

        if (!files || files.length === 0) return;

        /* 使用遞迴讓每張圖片依序模擬 */
        let idx = 0;

        function uploadNext() {

            if (idx >= files.length) {
                /* 全部完成，隱藏進度條 */
                hideProgress();
                return;
            }

            simulateSingleUpload(files[idx], () => {
                /* 此張完成後，繼續下一張 */
                idx++;
                uploadNext();
            });
        }

        uploadNext();
    }

    /**
     * 模擬單張圖片的上傳動畫（0% → 100%）。
     * @param {File}     file     - 要上傳的檔案
     * @param {Function} onDone   - 完成後的回呼
     */
    function simulateSingleUpload(file, onDone) {

        if (!progressWrap) {
            /* 沒有進度條 DOM 也要呼叫 onDone，避免流程卡住 */
            onDone && onDone();
            return;
        }

        /* 顯示進度條 */
        showProgress(file.name, 0);

        let pct = 0;

        /* 每 30ms 增加一次進度，模擬上傳感 */
        const interval = setInterval(() => {

            /* 隨機增量（10~25%），讓動畫感覺更自然 */
            pct += Math.floor(Math.random() * 16) + 10;

            if (pct >= 100) {
                pct = 100;
                clearInterval(interval);

                /* 更新至 100% */
                updateProgress(100);

                /* 短暫停留 400ms 後呼叫 onDone */
                setTimeout(() => {
                    onDone && onDone();
                }, 400);

            } else {
                updateProgress(pct);
            }

        }, 80); /* 每 80ms 更新一次 */
    }

    /** 顯示進度條並設定初始值 */
    function showProgress(filename, pct) {
        if (!progressWrap) return;
        progressWrap.classList.add("active");
        if (progressFile) progressFile.textContent = filename;
        updateProgress(pct);
    }

    /** 更新進度條數值 */
    function updateProgress(pct) {
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressPct) progressPct.textContent  = `${pct}%`;
    }

    /** 隱藏進度條 */
    function hideProgress() {
        if (!progressWrap) return;
        /* 延遲 300ms 後才隱藏，讓使用者看到 100% 完成 */
        setTimeout(() => {
            progressWrap.classList.remove("active");
            updateProgress(0);
        }, 300);
    }

    /* ============================================
       6. 錯誤訊息顯示 / 清除
    ============================================ */

    /**
     * 顯示錯誤訊息（支援 HTML 字串）。
     * @param {string} message - 要顯示的訊息
     */
    function showError(message) {
        if (!formError) return;
        formError.innerHTML = message;
        formError.classList.add("active");
        /* 自動捲動到錯誤訊息 */
        formError.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    /** 清除錯誤訊息 */
    function clearError() {
        if (!formError) return;
        formError.innerHTML = "";
        formError.classList.remove("active");
    }

    /* ============================================
       7. 表單提交驗證與送出
    ============================================ */

    if (form && submitBtn) {

        form.addEventListener("submit", (e) => {

            /* 永遠阻止表單預設的頁面跳轉 */
            e.preventDefault();

            clearError();

            /* ── 驗證：投稿內容不可為空 ── */
            const content = textarea ? textarea.value.trim() : "";

            if (!content) {
                showError("請填寫投稿內容，欄位不可空白。");
                textarea && textarea.focus();
                return;
            }

            /* ── 驗證：字數上限再次確認 ── */
            if (content.length > 10000) {
                showError("投稿內容超過 10,000 字上限，請縮短後再送出。");
                textarea && textarea.focus();
                return;
            }

            /* ── 開始送出（模擬非同步） ── */
            setLoadingState(true);

            /*
             * ★ 實際後台串接請在此處改成真實 API 呼叫，例如：
             *
             *   const formData = new FormData();
             *   formData.append("content", content);
             *   selectedFiles.forEach((f) => formData.append("images", f));
             *
             *   fetch("/api/submit", { method: "POST", body: formData })
             *     .then((res) => res.json())
             *     .then((data) => {
             *         showSuccessState(data.recallCode);
             *     })
             *     .catch(() => {
             *         showError("送出失敗，請稍後再試。");
             *         setLoadingState(false);
             *     });
             *
             * 目前為前端展示，用 setTimeout 模擬 1.5 秒的網路延遲。
             */
            setTimeout(() => {

                /* 模擬隨機產生 8 位回憶代碼（英數混合） */
                const code = generateRecallCode();

                /* 顯示成功畫面 */
                showSuccessState(code);

                /* 取消 loading 狀態 */
                setLoadingState(false);

            }, 1500);
        });
    }

    /**
     * 切換按鈕的 loading 狀態。
     * @param {boolean} isLoading
     */
    function setLoadingState(isLoading) {
        if (!submitBtn) return;
        if (isLoading) {
            submitBtn.classList.add("loading");
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
        }
    }

    /**
     * 顯示送出成功畫面，隱藏表單主體。
     * @param {string} code - 回憶代碼
     */
    function showSuccessState(code) {

        if (!successBox || !form) return;

        /* 顯示回憶代碼 */
        if (recallCode) recallCode.textContent = code;

        /* 隱藏表單欄位（保留 submit-rules-hint，只隱藏 form 本體） */
        form.style.display = "none";

        /* 顯示成功區塊 */
        successBox.classList.add("active");

        /* 捲動至成功提示 */
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    /* ============================================
       8. 「再次投稿」— 重置所有狀態
    ============================================ */

    if (againBtn) {

        againBtn.addEventListener("click", () => {

            /* 清空文字 */
            if (textarea) {
                textarea.value = "";
                /* 同步字數顯示 */
                if (charNow) charNow.textContent = "0";
                if (charCounter) charCounter.classList.remove("warn", "limit");
            }

            /* 清空圖片 */
            selectedFiles = [];
            refreshPreview();
            updateDropzoneState();
            hideProgress();

            /* 清除錯誤 */
            clearError();

            /* 隱藏成功區塊 */
            if (successBox) successBox.classList.remove("active");

            /* 重新顯示表單 */
            if (form) form.style.display = "";

            /* 捲動回投稿區頂部 */
            const submitSection = document.getElementById("submit-section");
            if (submitSection) {
                submitSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    /* ============================================
       工具函式
    ============================================ */

    /**
     * 產生隨機 8 位英數回憶代碼（僅作前端展示用）。
     * @returns {string}
     */
    function generateRecallCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; /* 去掉易混淆的 O/0/I/1 */
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

}); /* end DOMContentLoaded */

const attachBtn = document.getElementById("attach-image-btn");
const fileInput = document.getElementById("post-image");
if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => {
        fileInput.click();
    });
}