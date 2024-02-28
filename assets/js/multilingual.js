async function fetchLanguage(lang) {
    const response = await fetch(`../languages/${lang}.json`);
    const data = await response.json();
    console.log(data)
    updatePageText(data);
}

function updatePageText(data) {
    document.querySelectorAll("[data-key]").forEach(elem => {
        const key = elem.getAttribute("data-key");
        elem.textContent = data[key];
    });
}

document.getElementById("languageSelect").addEventListener("change", function() {
    fetchLanguage(this.value);
});

// Initialize page with default language
window.onload = () => {
    console.log("on loading multilingual")
    fetchLanguage('th');
};
