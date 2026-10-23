document.addEventListener("DOMContentLoaded", () => {
    console.log("Matheriel frontend engine initialized successfully [2026 Edition].");

    // Add subtle hover tracking / dynamic effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 12px 35px var(--accent-glow)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
        });
    });

    // 1. Lenis 초기화
    const lenis = new Lenis({
        duration: 1.2,      // 스크롤 지속 시간
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Math.MathPow -> Math.pow 로 수정
        direction: 'vertical',
        smooth: true,
    });

    // 2. 애니메이션 프레임 연결
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
});
