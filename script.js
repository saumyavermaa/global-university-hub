//This script handles the university search logic: it fetches a global list from an API, 
//    filters it by country, and displays the top 30 results. It also includes "fallback" 
//    logic for offline use and a custom interactive cursor effect for the UI.


const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const cornerButton = document.getElementById('cornerButton');
const universityContainer = document.getElementById('universityContainer');

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    cornerButton.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
}

cornerButton.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
});

// Main search function --> // Get the value from the input and clean it up (lowercase and no extra spaces)
async function fetchUniversities() {
    const country = countryInput.value.trim().toLowerCase();

    if (!country) {
        alert("Enter a country name first!");
        return;
    }

    // Simple loading state
    universityContainer.innerHTML = `
        <div class="loader-box">
            <div class="loader"></div>
            <p>Searching for universities in ${country}...</p>
        </div>
    `;

    try {
        const response = await fetch("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
        const allData = await response.json();

        // Filter based on input
        let results = allData.filter(item => 
            item.country.toLowerCase().includes(country)
        );

        // If API doesn't find anything, try the fallback variable
        if (results.length === 0 && typeof fallbackData !== 'undefined') {
            results = fallbackData.filter(item => 
                item.country.toLowerCase().includes(country)
            );
        }

        // Handle no results
        if (results.length === 0) {
            universityContainer.innerHTML = "<p>No results found. Please try another country.</p>";
            return;
        }

        // Limit to 30 results so the browser doesn't lag
        const displayList = results.slice(0, 30);
        
        let htmlContent = "";
        displayList.forEach(uni => {
            // Check if it's the main API format or fallback format
            const link = uni.web_pages ? uni.web_pages[0] : uni.web;
            
            htmlContent += `
                <div class="uni-card">
                    <h3>${uni.name}</h3>
                    <p>${uni.country}</p>
                    <a href="${link}" target="_blank">Visit Site</a>
                </div>
            `;
        });

        universityContainer.innerHTML = htmlContent;

        // Smooth scroll to results
        universityContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error("Error fetching data:", error);
        
        // Final attempt with fallback if network fails
        if (typeof fallbackData !== 'undefined') {
            const fallbackResults = fallbackData.filter(item => item.country.toLowerCase().includes(country));
            if (fallbackResults.length > 0) {
                universityContainer.innerHTML = fallbackResults.map(u => `
                    <div class="uni-card">
                        <h3>${u.name}</h3>
                        <p>${u.country}</p>
                        <a href="${u.web}" target="_blank">Visit</a>
                    </div>
                `).join("");
                universityContainer.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        universityContainer.innerHTML = "<p>Error loading data. Check your connection.</p>";
    }
}

// Event Listeners
searchBtn.addEventListener("click", fetchUniversities);

countryInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") fetchUniversities();
});

loadTheme();

// Cursor Tracking Logic
const cursorGlow = document.querySelector('.cursor-glow');
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
    // Update dot
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';

    // Update glow (centered)
    cursorGlow.style.left = (e.clientX - 150) + 'px';
    cursorGlow.style.top = (e.clientY - 150) + 'px';
});

// Hover effects for the cursor
const interactive = document.querySelectorAll('button, input, select, .suggestion-card, .trend-card, .uni-card, .history-chip');

interactive.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorGlow.style.transform = 'scale(1.5)';
        cursorDot.style.transform = 'scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
        cursorGlow.style.transform = 'scale(1)';
        cursorDot.style.transform = 'scale(1)';
    });
});

// Suggestion Cards functionality
document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
        const countryName = card.getAttribute('data-country');
        if (countryName) {
            countryInput.value = countryName;
            fetchUniversities();
            
            // Visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => { card.style.transform = ''; }, 150);
        }
    });
});
