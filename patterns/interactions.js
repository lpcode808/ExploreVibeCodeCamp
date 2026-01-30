/**
 * =====================================================
 * JAVASCRIPT INTERACTION PATTERNS
 * =====================================================
 *
 * This file contains reusable JavaScript patterns for
 * common UI interactions. Each pattern is documented
 * with explanations for beginners.
 *
 * PATTERNS INCLUDED:
 * 1. Toggle Classes (Show/Hide)
 * 2. Modal Management
 * 3. Scroll Tracking
 * 4. Search/Filter
 * 5. Keyboard Navigation
 * 6. Progress Tracking
 * 7. Slideshow/Carousel
 *
 * IMPORTANT CONCEPTS:
 * - DOM: Document Object Model - the page structure
 * - Event Listener: Code that runs when something happens
 * - Query Selector: Finding elements in the DOM
 */


// =====================================================
// 1. TOGGLE CLASSES (SHOW/HIDE)
// =====================================================
/**
 * The simplest way to show/hide elements is by toggling
 * CSS classes. The CSS handles the visual changes.
 *
 * classList methods:
 * - add('class')    : Add a class
 * - remove('class') : Remove a class
 * - toggle('class') : Add if missing, remove if present
 * - contains('class'): Check if class exists (returns true/false)
 */

// Toggle sidebar visibility
function toggleSidebar() {
    // body.classList.toggle adds 'toc-hidden' if missing,
    // removes it if present
    document.body.classList.toggle('toc-hidden');
}

// Example: Button click toggles sidebar
document.getElementById('toc-toggle')?.addEventListener('click', toggleSidebar);


// =====================================================
// 2. MODAL MANAGEMENT
// =====================================================
/**
 * Modals have three states:
 * - Hidden (not visible, can't interact)
 * - Visible (shown, can interact)
 * - Animating (transitioning between states)
 *
 * We use CSS classes to control visibility, and
 * CSS transitions handle the animations.
 */

/**
 * Opens a modal by ID
 * @param {string} modalId - The ID of the modal element
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Remove hidden class (if using display:none approach)
    modal.classList.remove('modal-hidden');

    // Add visible class (for opacity/transform animations)
    // Use requestAnimationFrame to ensure the browser has
    // rendered the element before adding the class
    requestAnimationFrame(() => {
        modal.classList.add('visible');
    });

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

/**
 * Closes a modal by ID
 * @param {string} modalId - The ID of the modal element
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Remove visible class (starts close animation)
    modal.classList.remove('visible');

    // Wait for animation, then hide completely
    // 200ms matches the CSS transition duration
    setTimeout(() => {
        modal.classList.add('modal-hidden');
    }, 200);

    // Re-enable body scroll
    document.body.style.overflow = '';
}

/**
 * Close modal when clicking the backdrop
 * The backdrop is the dark overlay behind the modal
 */
function setupModalBackdropClose(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = modal?.querySelector('.modal-backdrop');

    backdrop?.addEventListener('click', () => {
        closeModal(modalId);
    });
}

// Example setup:
// setupModalBackdropClose('search-modal');
// setupModalBackdropClose('reflection-modal');


// =====================================================
// 3. SCROLL TRACKING
// =====================================================
/**
 * Track scroll position to:
 * - Highlight current section in navigation
 * - Update progress indicators
 * - Show/hide elements based on scroll
 */

/**
 * Updates which TOC item is active based on scroll position
 * Called on every scroll event
 */
function updateActiveSection() {
    // Get all sections that can be active
    const sections = document.querySelectorAll('h2[id], .concept-card[id]');
    const tocNav = document.getElementById('toc-nav');
    if (!tocNav) return;

    let currentActiveId = null;

    // Loop through sections to find which one is currently visible
    sections.forEach(section => {
        // getBoundingClientRect() returns position relative to viewport
        const rect = section.getBoundingClientRect();

        // If section is near top of viewport (within 100px), it's "current"
        if (rect.top <= 100) {
            currentActiveId = section.id;
        }
    });

    // Update TOC highlighting
    const tocLinks = tocNav.querySelectorAll('.toc-section a');
    tocLinks.forEach(link => {
        // Remove active from all
        link.classList.remove('active');

        // Add active to current
        if (link.getAttribute('data-id') === currentActiveId) {
            link.classList.add('active');

            // Scroll the active link into view in the TOC
            link.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'  // Only scroll if needed
            });
        }
    });
}

/**
 * Updates reading progress bar width
 */
function updateProgress() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    // Calculate how far user has scrolled
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / docHeight) * 100;

    // Update progress bar width
    progressBar.style.width = progress + '%';
}

/**
 * Show/hide back-to-top button based on scroll position
 */
function updateBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    // Show button after scrolling 300px
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

// Attach scroll listeners
// Note: scroll events fire frequently, consider throttling for performance
window.addEventListener('scroll', () => {
    updateActiveSection();
    updateProgress();
    updateBackToTop();
});


// =====================================================
// 4. SEARCH / FILTER
// =====================================================
/**
 * Search functionality involves:
 * - Building a search index (list of searchable content)
 * - Filtering the index based on query
 * - Displaying results
 * - Navigating to selected result
 */

/**
 * Build a search index from page content
 * Call this once when page loads
 * @returns {Array} Array of searchable items
 */
function buildSearchIndex() {
    const index = [];

    // Index speaker cards
    document.querySelectorAll('.speaker-card').forEach(card => {
        const name = card.querySelector('.speaker-name')?.textContent || '';
        const topic = card.querySelector('.speaker-topic')?.textContent || '';
        const highlights = card.querySelector('.speaker-highlights')?.textContent || '';

        index.push({
            id: card.id,
            type: 'speaker',
            title: name,
            content: `${topic} ${highlights}`,
            element: card
        });
    });

    // Index concept cards
    document.querySelectorAll('.concept-card').forEach(card => {
        const title = card.querySelector('.concept-title')?.textContent || '';
        const tldr = card.querySelector('.concept-tldr')?.textContent || '';
        const text = card.querySelector('.concept-text')?.textContent || '';

        index.push({
            id: card.id,
            type: 'concept',
            title: title,
            content: `${tldr} ${text}`,
            element: card
        });
    });

    return index;
}

/**
 * Search the index for matching items
 * @param {Array} index - The search index
 * @param {string} query - Search query
 * @returns {Array} Matching items
 */
function searchIndex(index, query) {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();

    return index.filter(item => {
        const searchText = `${item.title} ${item.content}`.toLowerCase();
        return searchText.includes(lowerQuery);
    });
}

/**
 * Highlight matching text in search results
 * @param {string} text - Original text
 * @param {string} query - Search query to highlight
 * @returns {string} HTML with highlighted matches
 */
function highlightMatch(text, query) {
    if (!query) return text;

    // Create regex that matches query (case insensitive)
    // Escape special regex characters in query
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    // Wrap matches in <mark> tag
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Simple filter for TOC items
 * @param {string} query - Filter query
 */
function filterTOC(query) {
    const items = document.querySelectorAll('.toc-section');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        // Show/hide based on match
        item.style.display = text.includes(lowerQuery) ? 'block' : 'none';
    });
}

// Example: TOC filter input
document.getElementById('toc-filter')?.addEventListener('input', (e) => {
    filterTOC(e.target.value);
});


// =====================================================
// 5. KEYBOARD NAVIGATION
// =====================================================
/**
 * Keyboard shortcuts improve accessibility and power-user experience.
 *
 * Common patterns:
 * - Cmd/Ctrl + K : Open search
 * - Escape : Close modals
 * - Arrow keys : Navigate lists
 * - Enter : Select/confirm
 */

document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in an input
    const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

    // Cmd/Ctrl + K : Open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();  // Prevent browser's default action
        openModal('search-modal');
        // Focus the search input
        document.getElementById('search-input')?.focus();
    }

    // Escape : Close any open modal
    if (e.key === 'Escape') {
        closeModal('search-modal');
        closeModal('reflection-modal');
        closeModal('infographics-modal');
    }

    // T : Toggle sidebar (when not typing)
    if ((e.key === 't' || e.key === 'T') && !isTyping) {
        toggleSidebar();
    }

    // S : Toggle slideshow mode (when not typing)
    if ((e.key === 's' || e.key === 'S') && !isTyping) {
        toggleSlideshowMode();
    }
});

/**
 * Navigate search results with arrow keys
 * @param {HTMLElement} container - Results container
 * @param {string} direction - 'up' or 'down'
 */
function navigateResults(container, direction) {
    const items = container.querySelectorAll('.search-result');
    const active = container.querySelector('.search-result.active');

    let nextIndex = 0;
    if (active) {
        const currentIndex = Array.from(items).indexOf(active);
        nextIndex = direction === 'down'
            ? Math.min(currentIndex + 1, items.length - 1)
            : Math.max(currentIndex - 1, 0);
        active.classList.remove('active');
    }

    items[nextIndex]?.classList.add('active');
    items[nextIndex]?.scrollIntoView({ block: 'nearest' });
}


// =====================================================
// 6. PROGRESS TRACKING
// =====================================================
/**
 * Track user progress through content.
 * Can be used for reading progress, course completion, etc.
 */

/**
 * Calculate scroll progress as percentage
 * @returns {number} Progress from 0 to 100
 */
function getScrollProgress() {
    const docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    // Total scrollable distance
    const scrollableHeight = docHeight - viewportHeight;

    // Current progress
    return (scrollTop / scrollableHeight) * 100;
}

/**
 * Find which section the user is currently viewing
 * @param {NodeList} sections - List of section elements
 * @returns {Element|null} Current section element
 */
function getCurrentSection(sections) {
    let current = null;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // Section is "current" if its top is above middle of viewport
        if (rect.top <= window.innerHeight / 2) {
            current = section;
        }
    });

    return current;
}


// =====================================================
// 7. SLIDESHOW / CAROUSEL
// =====================================================
/**
 * Slideshow patterns for navigating through content.
 * Can be used for image galleries, presentations, etc.
 */

// State management for slideshow
const slideshowState = {
    slides: [],
    currentIndex: 0,
    isActive: false
};

/**
 * Initialize slideshow with sections
 */
function initSlideshow() {
    // Get all h2 elements as "slides"
    slideshowState.slides = Array.from(document.querySelectorAll('h2[id]'));
    slideshowState.currentIndex = 0;
}

/**
 * Toggle slideshow mode on/off
 */
function toggleSlideshowMode() {
    slideshowState.isActive = !slideshowState.isActive;
    document.body.classList.toggle('slideshow-mode');

    if (slideshowState.isActive) {
        // Find current slide based on scroll position
        const current = getCurrentSection(slideshowState.slides);
        if (current) {
            slideshowState.currentIndex = slideshowState.slides.indexOf(current);
        }
        updateSlideshow();
    }
}

/**
 * Navigate to specific slide
 * @param {number} index - Slide index
 */
function goToSlide(index) {
    // Clamp index to valid range
    index = Math.max(0, Math.min(index, slideshowState.slides.length - 1));
    slideshowState.currentIndex = index;

    const slide = slideshowState.slides[index];
    if (slide) {
        slide.scrollIntoView({ behavior: 'smooth' });
    }

    updateSlideshow();
}

/**
 * Go to next slide
 */
function nextSlide() {
    goToSlide(slideshowState.currentIndex + 1);
}

/**
 * Go to previous slide
 */
function prevSlide() {
    goToSlide(slideshowState.currentIndex - 1);
}

/**
 * Update slideshow UI (counter, dots, etc.)
 */
function updateSlideshow() {
    // Update counter
    const counter = document.getElementById('slide-counter');
    if (counter) {
        counter.textContent = `${slideshowState.currentIndex + 1} / ${slideshowState.slides.length}`;
    }

    // Update navigation dots
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === slideshowState.currentIndex);
    });
}

/**
 * Handle slideshow keyboard navigation
 */
function handleSlideshowKeydown(e) {
    if (!slideshowState.isActive) return;

    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            prevSlide();
            break;
        case 'Escape':
            toggleSlideshowMode();
            break;
    }
}

document.addEventListener('keydown', handleSlideshowKeydown);


// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Debounce function - limits how often a function can fire
 * Useful for scroll/resize handlers
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - ensures function runs at most once per interval
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum milliseconds between calls
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Example: Throttled scroll handler
// window.addEventListener('scroll', throttle(updateActiveSection, 100));


/**
 * Smooth scroll to element
 * @param {string} selector - CSS selector for target element
 */
function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}


// =====================================================
// INITIALIZATION
// =====================================================
/**
 * Run setup code when DOM is ready
 * DOMContentLoaded fires when HTML is parsed (before images load)
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready - initializing interactions');

    // Initialize components
    initSlideshow();

    // Build search index
    const searchIndex = buildSearchIndex();
    console.log(`Search index built with ${searchIndex.length} items`);

    // Setup modal backdrop close handlers
    setupModalBackdropClose('search-modal');
    setupModalBackdropClose('reflection-modal');

    // Initial scroll tracking
    updateActiveSection();
    updateProgress();
});


// =====================================================
// EXPORT FOR MODULE USE (optional)
// =====================================================
// If using ES modules, uncomment these exports:
/*
export {
    toggleSidebar,
    openModal,
    closeModal,
    buildSearchIndex,
    searchIndex,
    highlightMatch,
    goToSlide,
    nextSlide,
    prevSlide,
    debounce,
    throttle
};
*/
