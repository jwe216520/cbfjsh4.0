console.log("靠北輔中 4.0 啟動成功");

/* ================================
   DOM 載入完成
================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* ================================
       動態載入 Header
    ================================= */

    const headerRes = await fetch("header.html");
    const headerHtml = await headerRes.text();

    document.body.insertAdjacentHTML(
        "afterbegin",
        headerHtml
    );

    /* ================================
       動態載入 Footer
    ================================= */

    const footerRes = await fetch("footer.html");
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

    document.addEventListener("click", (e) => {

        const isInsideNav =
        nav.contains(e.target);

        const isHamburger =
        hamburger.contains(e.target);

        if (!isInsideNav && !isHamburger) {

            nav.classList.remove("active");
        }
    });

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