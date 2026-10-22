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
});
