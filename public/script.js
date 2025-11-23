// Global state
let allArticles = [];
let currentCategory = 'all';
let searchQuery = '';

// API base URL
const API_URL = '/api';

// DOM Elements
const articlesContainer = document.getElementById('articlesContainer');
const filtersContainer = document.getElementById('filters');
const searchBar = document.getElementById('searchBar');
const navbar = document.getElementById('navbar');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadArticles();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterAndDisplayArticles();
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();

        if (filtersContainer && categories.length > 0) {
            // Add category chips
            categories.forEach(category => {
                const chip = document.createElement('button');
                chip.className = 'chip';
                chip.textContent = category;
                chip.dataset.category = category;
                chip.addEventListener('click', () => selectCategory(category));
                filtersContainer.appendChild(chip);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Select category
function selectCategory(category) {
    currentCategory = category;

    // Update active chip
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.category === category) {
            chip.classList.add('active');
        }
    });

    filterAndDisplayArticles();
}

// Load articles
async function loadArticles() {
    try {
        const response = await fetch(`${API_URL}/articles`);
        allArticles = await response.json();
        filterAndDisplayArticles();
    } catch (error) {
        console.error('Error loading articles:', error);
        if (articlesContainer) {
            articlesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Error al cargar artículos</h3>
                    <p>No se pudieron cargar los artículos. Por favor, intenta de nuevo más tarde.</p>
                </div>
            `;
        }
    }
}

// Filter and display articles
function filterAndDisplayArticles() {
    let filteredArticles = allArticles;

    // Filter by category
    if (currentCategory !== 'all') {
        filteredArticles = filteredArticles.filter(article =>
            article.category === currentCategory
        );
    }

    // Filter by search query
    if (searchQuery) {
        filteredArticles = filteredArticles.filter(article =>
            article.title.toLowerCase().includes(searchQuery) ||
            (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery)) ||
            (article.author && article.author.toLowerCase().includes(searchQuery)) ||
            (article.category && article.category.toLowerCase().includes(searchQuery))
        );
    }

    displayArticles(filteredArticles);
}

// Display articles
function displayArticles(articles) {
    if (!articlesContainer) return;

    if (articles.length === 0) {
        articlesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No se encontraron artículos</h3>
                <p>Intenta con otra búsqueda o categoría.</p>
            </div>
        `;
        return;
    }

    articlesContainer.innerHTML = `
        <div class="articles-grid">
            ${articles.map(article => createArticleCard(article)).join('')}
        </div>
    `;

    // Add click listeners to cards
    document.querySelectorAll('.article-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `/article?slug=${articles[index].slug}`;
        });
    });
}

// Create article card HTML
function createArticleCard(article) {
    const date = new Date(article.date);
    const formattedDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Default image if none provided
    const imageUrl = article.featured_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';

    return `
        <article class="article-card">
            <img src="${imageUrl}" alt="${article.title}" class="article-image" loading="lazy" onerror="this.style.display='none'">
            <div class="article-content">
                ${article.category ? `<span class="article-category">${article.category}</span>` : ''}
                <h3 class="article-title">${article.title}</h3>
                ${article.excerpt ? `<p class="article-excerpt">${article.excerpt}</p>` : ''}
                <div class="article-meta">
                    ${article.author ? `<span class="article-author">${article.author}</span>` : '<span></span>'}
                    <span class="article-date">${formattedDate}</span>
                </div>
            </div>
        </article>
    `;
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export functions for use in other pages if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadArticles,
        displayArticles,
        createArticleCard,
        formatDate
    };
}
