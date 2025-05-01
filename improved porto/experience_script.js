// Main script for the experience page with solar system visualization

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    let lastScrollTop = 0;
    let isScrolling;
    
    // Theme management
    function setThemeClass() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        navbar.classList.remove(isDark ? 'navbar-light' : 'navbar-dark');
        navbar.classList.add(isDark ? 'navbar-dark' : 'navbar-light');
        themeIcon.className = isDark ? 'bi bi-moon-fill' : 'bi bi-brightness-high-fill';
    }
    
    // Function to set the theme
    function setTheme(isDark) {
        console.log("Setting theme to:", isDark ? "dark" : "light");
        
        // Update data-theme attribute
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Set theme classes
        setThemeClass();
        
        // Update hamburger menu
        const hamburgerLines = document.querySelectorAll('.hamburger-icon span');
        hamburgerLines.forEach(line => {
            line.style.backgroundColor = isDark ? '#ffffff' : '#000000';
        });
        
        // Update solar system if available
        if (window.updateSolarSystemTheme) {
            try {
                window.updateSolarSystemTheme(isDark);
            } catch (e) {
                console.error("Error updating solar system theme:", e);
            }
        }
        
        // Store preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    setTheme(initialDarkMode);
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newDarkMode = currentTheme !== 'dark';
        setTheme(newDarkMode);
    });
    
    // Ensure solar system is visible
    function checkSolarSystem() {
        const canvas = document.getElementById('solarSystemCanvas');
        if (canvas) {
            canvas.style.display = 'block';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '-1';
            canvas.style.pointerEvents = 'none';
        }
    }
    
    // Run canvas check
    setTimeout(checkSolarSystem, 200);
    
    // Scroll behavior for navbar
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class when page is scrolled
        if(scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide navbar when scrolling down
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        
        // Show navbar when user stops scrolling
        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            navbar.classList.remove('hidden');
        }, 1500);
    });
    
    // Add staggered animation to nav items
    navLinks.forEach((link, index) => {
        link.style.opacity = "0";
        link.style.transform = "translateY(-10px)";
        link.style.transition = `all 0.3s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            link.style.opacity = "1";
            link.style.transform = "translateY(0)";
        }, 100);
    });
    
    // Animate navbar on page load
    navbar.style.opacity = "0";
    navbar.style.transform = "translateY(-10px)";
    
    setTimeout(() => {
        navbar.style.transition = "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        navbar.style.opacity = "1";
        navbar.style.transform = "translateY(0)";
    }, 200);
    
    // Add wobble animation to theme toggle on hover
    themeToggle.addEventListener('mouseenter', () => {
        themeToggle.classList.add('wobble');
        setTimeout(() => {
            themeToggle.classList.remove('wobble');
        }, 1000);
    });
    
    // Check for system theme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only if user hasn't manually set a preference
            setTheme(e.matches);
        }
    });
});
