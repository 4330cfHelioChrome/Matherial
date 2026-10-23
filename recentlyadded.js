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

    const container = document.getElementById("recentContainer");
    
    // 설정: 한 번에 보여줄 최대 항목 수
    const ITEMS_PER_PAGE = 5;
    let allRecentWords = [];
    let currentIndex = 0;

    try {
        // 1. 모든 JSON 파일 비동기 로드
        const fetchPromises = files.map(async (fileObj) => {
            try {
                const response = await fetch(`./docs/grammars/base_words/${fileObj.filename}`);
                if (!response.ok) return [];
                const data = await response.json();
                return data.map(item => ({
                    word: item.word || "",
                    definition: item.definition || "",
                    category: fileObj.category,
                    addedDate: item["added-date"] || null
                }));
            } catch (err) {
                console.error(`Failed to load ${fileObj.filename}:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        const allVocabulary = results.flat();

        // 2. 날짜 기준 설정 (현재, 1달 전, 3달 전)
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        // 3. 필터링: 3달 이내 데이터만 추출
        const recentWords = allVocabulary.filter(item => {
            if (!item.addedDate) return false;
            const itemDate = new Date(item.addedDate);
            return itemDate >= threeMonthsAgo && itemDate <= now;
        });

        // 4. 최신순 정렬 (내림차순)
        recentWords.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

        if (recentWords.length === 0) {
            container.innerHTML = `<p class="no-data">No recently added words within the last 3 months.</p>`;
            return;
        }

        allRecentWords = recentWords;
        container.innerHTML = ""; // 로딩 텍스트 제거

        // 5. 초기 렌더링 실행 및 더 보기 버튼 생성
        renderMoreItems();

    } catch (error) {
        console.error("Error loading recent dictionary data:", error);
        container.innerHTML = `<p class="error-text">Failed to load recently added entries.</p>`;
    }

    // 항목을 추가로 렌더링하는 함수 (그룹별 또는 전체 개수 기준 분할)
    function renderMoreItems() {
        const nextIndex = currentIndex + ITEMS_PER_PAGE;
        const currentBatch = allRecentWords.slice(currentIndex, nextIndex);
        currentIndex = nextIndex;

        // 이번에 불러온 항목들을 기간별(일 단위 / 주 단위)로 그룹화
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(new Date().getDate() - 30);

        const groups = {};
        currentBatch.forEach(item => {
            const itemDate = new Date(item.addedDate);
            let groupKey = itemDate >= oneMonthAgo ? item.addedDate : getWeekRangeString(itemDate);

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        // DOM에 추가
        for (const [groupTitle, words] of Object.entries(groups)) {
            // 이미 존재하는 날짜/주차 헤더가 있는지 확인 (중복 방지)
            let sectionHeading = document.getElementById(`group-${groupTitle}`);
            let tableBody;

            if (!sectionHeading) {
                sectionHeading = document.createElement("h2");
                sectionHeading.id = `group-${groupTitle}`;
                sectionHeading.textContent = groupTitle;

                const table = document.createElement("table");
                table.id = `table-${groupTitle}`;
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Word</th>
                            <th>Category</th>
                            <th>Meaning</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                container.appendChild(sectionHeading);
                container.appendChild(table);
            }

            tableBody = document.querySelector(`#table-${groupTitle} tbody`);
            tableBody.innerHTML += words.map(w => `
                <tr>
                    <td><strong>${escapeHtml(w.word)}</strong></td>
                    <td><span class="category-badge">${escapeHtml(w.category)}</span></td>
                    <td>${escapeHtml(w.definition)}</td>
                </tr>
            `).join("");
        }

        // 기존 "Load More" 버튼 제거 (중복 생성 방지)
        const existingBtn = document.getElementById("loadMoreBtn");
        if (existingBtn) existingBtn.remove();

        // 아직 보여줄 데이터가 더 남았다면 "Load More" 버튼 생성
        if (currentIndex < allRecentWords.length) {
            const loadMoreBtn = document.createElement("button");
            loadMoreBtn.id = "loadMoreBtn";
            loadMoreBtn.textContent = "Load More";
            loadMoreBtn.className = "load-more-btn"; // CSS 클래스 활용
        
            loadMoreBtn.addEventListener("click", renderMoreItems);
            container.appendChild(loadMoreBtn);
        }
    }

    // 주간 범위 계산 헬퍼 함수
    function getWeekRangeString(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        
        const monday = new Date(d.setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const formatDate = (dt) => {
            const yy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            return `${yy}-${mm}-${dd}`;
        };

        return `Week of ${formatDate(monday)} ~ ${formatDate(sunday)}`;
    }

    // HTML 특수문자 이스케이프 함수
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
