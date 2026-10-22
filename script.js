document.addEventListener("DOMContentLoaded", () => {
    console.log("Matheriel frontend engine initialized successfully [2026 Edition].");

    // Interactive symbol simulator simulation effect
    const symbolInput = document.getElementById("symbolInput");
    const symbolOutput = document.getElementById("symbolOutput");

    if (symbolInput && symbolOutput) {
        symbolInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            if (val.length === 0) {
                symbolOutput.textContent = "Logical Validation: Empty Expression";
                symbolOutput.style.color = "#ff5555";
            } else {
                // Simulate syntax parsing or logical validation response
                symbolOutput.textContent = `Parsed Node: [ ${val} ] — Status: Universal Equilibrium Validated`;
                symbolOutput.style.color = "var(--accent-color)";
            }
        });
    }

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
