const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const universityContainer = document.getElementById('universityContainer');
const sortOrder = document.getElementById('sortOrder');

let universityData = [];

async function fetchUniversities() {
    const country = countryInput.value.trim();

    if (!country) {
        alert("Please enter a country name.");
        return;
    }

    universityContainer.innerHTML = '<p class="status-msg">Searching...</p>';

    try {
const response = await fetch(`//universities.hipolabs.com/search?country=${encodeURIComponent(country)}`);

        if (!response.ok) throw new Error('API Error');

        universityData = await response.json();

        if (universityData.length === 0) {
            universityContainer.innerHTML = `<p class="status-msg">No results for "${country}".</p>`;
        } else {
            renderUniversities(universityData);
        }
    } catch (error) {
        universityContainer.innerHTML = `<p class="status-msg">Connection failed. Try again.</p>`;
    }
}

function renderUniversities(data) {
    universityContainer.innerHTML = data.map(uni => `
        <div class="uni-card">
            <h3>${uni.name}</h3>
            <p>${uni['state-province'] || 'N/A'}</p>
            <a href="${uni.web_pages[0]}" target="_blank">Visit Website</a>
        </div>
    `).join('');
}

function handleSort() {
    if (universityData.length === 0) return;

    const order = sortOrder.value;
    const sorted = [...universityData].sort((a, b) => {
        return order === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
    });

    renderUniversities(sorted);
}

searchBtn.addEventListener('click', fetchUniversities);

countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchUniversities();
});

sortOrder.addEventListener('change', handleSort);