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
    let filteredVocabulary = [];
    let displayedCount = 0;
    const ITEMS_PER_PAGE = 5; // 한 번에 보여줄 개수

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
        
        // 초기에는 전체 데이터가 필터링된 데이터가 됨
        filteredVocabulary = [...allVocabulary];
        resetAndRender();

    } catch (error) {
        console.error("Error loading dictionary data:", error);
        tableBody.innerHTML = `<tr class="loading-row"><td colspan="3">Failed to load vocabulary database.</td></tr>`;
    }

    // 목록을 처음부터 다시 렌더링하는 함수 (검색/필터 변경 시 호출)
    function resetAndRender() {
        displayedCount = 0;
        tableBody.innerHTML = ""; // 기존 내용 초기화
        
        // 기존에 있던 Load More 버튼 제거
        const oldBtn = document.getElementById("dictLoadMoreBtn");
        if (oldBtn) oldBtn.remove();

        renderMoreItems();
    }

    // 데이터를 추가로 잘라서 렌더링하고 Load More 버튼을 관리하는 함수
    function renderMoreItems() {
        const nextCount = displayedCount + ITEMS_PER_PAGE;
        const currentBatch = filteredVocabulary.slice(displayedCount, nextCount);
        displayedCount = nextCount;

        if (allVocabulary.length > 0 && filteredVocabulary.length === 0) {
            tableBody.innerHTML = `<tr class="loading-row"><td colspan="3">No matching vocabulary found.</td></tr>`;
            return;
        }

        // 기존 "No matching" 메시지가 있다면 제거 후 행 추가
        if (displayedCount === ITEMS_PER_PAGE && currentBatch.length > 0) {
            tableBody.innerHTML = "";
        }

        const rowsHtml = currentBatch.map(item => `
            <tr>
                <td><strong>${escapeHtml(item.word)}</strong></td>
                <td><span class="category-badge">${escapeHtml(item.category)}</span></td>
                <td>${escapeHtml(item.definition)}</td>
            </tr>
        `).join("");

        tableBody.innerHTML += rowsHtml;

        // 기존 Load More 버튼 제거
        const existingBtn = document.getElementById("dictLoadMoreBtn");
        if (existingBtn) existingBtn.remove();

        // 아직 보여줄 데이터가 남았다면 버튼 생성
        if (displayedCount < filteredVocabulary.length) {
            const loadMoreBtn = document.createElement("button");
            loadMoreBtn.id = "dictLoadMoreBtn";
            loadMoreBtn.textContent = "Load More";
            loadMoreBtn.style.display = "block";
            loadMoreBtn.style.margin = "20px auto";
            loadMoreBtn.style.padding = "10px 20px";
            loadMoreBtn.style.cursor = "pointer";

            loadMoreBtn.addEventListener("click", renderMoreItems);
            
            // 테이블 바로 아래에 버튼 추가
            tableBody.closest("table").after(loadMoreBtn);
        }
    }

    // Filter logic based on search input, search field type, and category selector
    function filterData() {
        const query = searchInput.value.toLowerCase().trim();
        const type = searchType.value;
        const cat = categoryFilter.value;

        filteredVocabulary = allVocabulary.filter(item => {
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

        resetAndRender();
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
