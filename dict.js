document.addEventListener("DOMContentLoaded", async () => {
    const files = [
        { filename: "ADJECTIVE_STEM.json", category: "Adjective Stem" },
        { filename: "ADVERB.json", category: "Adverb" },
        { filename: "AUXILIARY_VERB.json", category: "Auxiliary Verb" },
        { filename: "DETEMINER.json", category: "Determiner" },
        { filename: "ENDING_SUFFIX.json", category: "Ending Suffix" },
        { filename: "INTERJECTION.json", category: "Interjection" },
        { filename: "INTERROGATIVE.json", category: "Interrogative" },
        { filename: "NOUN.json", category: "Noun" },
        { filename: "PRONOUN.json", category: "Pronoun" },
        { filename: "TENSE.json", category: "Tense" },
        { filename: "UNIT_SYMBOLS.json", category: "Unit Symbols" },
        { filename: "VERB_STEM.json", category: "Verb Stem" }
    ];

    let allVocabulary = [];
    const tableBody = document.getElementById("dictTableBody");
    const searchInput = document.getElementById("searchInput");
    const searchType = document.getElementById("searchType");
    const categoryFilter = document.getElementById("categoryFilter");

    // Populate category filter dropdown options
    files.forEach(f => {
        const option = document.createElement("option");
        option.value = f.category;
        option.textContent = f.category;
        categoryFilter.appendChild(option);
    });

    // Fetch all JSON files concurrently from ./docs/grammars/base_words/
    try {
        const fetchPromises = files.map(async (fileObj) => {
            try {
                const response = await fetch(`./docs/grammars/base_words/${fileObj.filename}`);
                if (!response.ok) return [];
                const data = await response.json();
                return data.map(item => ({
                    word: item.word || "",
                    definition: item.definition || "",
                    category: fileObj.category
                }));
            } catch (err) {
                console.error(`Failed to load ${fileObj.filename}:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        allVocabulary = results.flat();
        
        renderTable(allVocabulary);
    } catch (error) {
        console.error("Error loading dictionary data:", error);
        tableBody.innerHTML = `<tr class="loading-row"><td colspan="3">Failed to load vocabulary database.</td></tr>`;
    }

    // Render data into the table
    function renderTable(data) {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr class="loading-row"><td colspan="3">No matching vocabulary found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(item => `
            <tr>
                <td><strong>${escapeHtml(item.word)}</strong></td>
                <td><span class="category-badge">${escapeHtml(item.category)}</span></td>
                <td>${escapeHtml(item.definition)}</td>
            </tr>
        `).join("");
    }

    // Filter logic based on search input, search field type, and category selector
    function filterData() {
        const query = searchInput.value.toLowerCase().trim();
        const type = searchType.value;
        const cat = categoryFilter.value;

        const filtered = allVocabulary.filter(item => {
            if (cat !== "all" && item.category !== cat) {
                return false;
            }

            if (!query) return true;

            const wordMatch = item.word.toLowerCase().includes(query);
            const defMatch = item.definition.toLowerCase().includes(query);

            if (type === "word") return wordMatch;
            if (type === "definition") return defMatch;
            return wordMatch || defMatch;
        });

        renderTable(filtered);
    }

    searchInput.addEventListener("input", filterData);
    searchType.addEventListener("change", filterData);
    categoryFilter.addEventListener("change", filterData);

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
