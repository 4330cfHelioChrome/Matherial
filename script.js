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
        duration: 1.2,      // 스크롤 지속 시간 (클수록 부드럽고 느려짐)
        easing: (t) => Math.min(1, 1.001 - Math.MathPow(2, -10 * t)), // 이징 함수
        direction: 'vertical', // 스크롤 방향 ('vertical' 또는 'horizontal')
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,  // 마우스 휠 감도
        smoothTouch: false,  // 모바일 터치 스크롤 부드러움 여부
        touchMultiplier: 2,
        infinite: false,
    });

    // 2. 브라우저 렌더링 프레임에 Lenis 업데이트 연결
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
});
