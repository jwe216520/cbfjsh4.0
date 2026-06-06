console.log("靠北輔中 4.0 啟動成功");

/* ================================
   DOM 載入完成
================================ */

document.addEventListener("DOMContentLoaded", async () => {

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
