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
                    addedDate: item["added-date"] || null // 추가된 날짜 가져오기
                }));
            } catch (err) {
                console.error(`Failed to load ${fileObj.filename}:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        const allVocabulary = results.flat();

        // 2. 날짜 기준 계산 (현재 날짜 기준 정확히 3달 전)
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        // 3. 필터링: added-date가 존재하고, 3달 이내인 데이터만 추출
        const recentWords = allVocabulary.filter(item => {
            if (!item.addedDate) return false;
            const itemDate = new Date(item.addedDate);
            return itemDate >= threeMonthsAgo && itemDate <= now;
        });

        // 4. 최신순 정렬 (내림차순: 최신 날짜가 위로 오도록)
        recentWords.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

        if (recentWords.length === 0) {
            container.innerHTML = `<p class="no-data">No recently added words within the last 3 months.</p>`;
            return;
        }

        // 5. 연도-월(예: October 2026) 단위로 그룹화
        const groupedByMonth = {};
        recentWords.forEach(item => {
            const dateObj = new Date(item.addedDate);
            const monthYearKey = dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long' });
            
            if (!groupedByMonth[monthYearKey]) {
                groupedByMonth[monthYearKey] = [];
            }
            groupedByMonth[monthYearKey].push(item);
        });

        // 6. HTML 동적 생성 및 렌더링
        container.innerHTML = ""; // 로딩 텍스트 제거
        for (const [monthYear, words] of Object.entries(groupedByMonth)) {
            const sectionHeading = document.createElement("h2");
            sectionHeading.textContent = monthYear;

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

    // HTML 특수문자 이스케이프 함수 (dict.js와 동일)
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
