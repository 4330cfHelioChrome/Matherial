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
        oneMonthAgo.setDate(now.getDate() - 30); // 약 1달 (30일) 기준

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3); // 3달 기준

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

        // 5. 기간별 그룹화 로직 (1달 이내: 일 단위 / 1달~3달: 주 단위)
        const groups = {};

        recentWords.forEach(item => {
            const itemDate = new Date(item.addedDate);
            let groupKey = "";

            if (itemDate >= oneMonthAgo) {
                // 1달 이내: 정확한 날짜별로 그룹화 (예: "2026-10-23")
                groupKey = item.addedDate; 
            } else {
                // 1달 이상 ~ 3달 이내: 일주일(주차) 단위로 그룹화
                groupKey = getWeekRangeString(itemDate);
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        // 6. HTML 동적 생성 및 렌더링
        container.innerHTML = ""; // 로딩 텍스트 제거
        for (const [groupTitle, words] of Object.entries(groups)) {
            const sectionHeading = document.createElement("h2");
            sectionHeading.textContent = groupTitle;

            const table = document.createElement("table");
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Word</th>
                        <th>Category</th>
                        <th>Meaning</th>
                    </tr>
                </thead>
                <tbody>
                    ${words.map(w => `
                        <tr>
                            <td><strong>${escapeHtml(w.word)}</strong></td>
                            <td><span class="category-badge">${escapeHtml(w.category)}</span></td>
                            <td>${escapeHtml(w.definition)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            `;

            container.appendChild(sectionHeading);
            container.appendChild(table);
        }

    } catch (error) {
        console.error("Error loading recent dictionary data:", error);
        container.innerHTML = `<p class="error-text">Failed to load recently added entries.</p>`;
    }

    // 날짜를 받아 해당 주의 월요일~일요일(또는 시작일~종료일) 문자열을 만들어주는 헬퍼 함수
    function getWeekRangeString(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 해당 주의 월요일 계산
        
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
