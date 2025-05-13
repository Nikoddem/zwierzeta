document.addEventListener("DOMContentLoaded", function () {
    const navList = document.getElementById("menu");
    const main = document.querySelector("main");
    const reklama = document.getElementById("reklama");
    const toggleBtn = document.getElementById("toggle-darkmode");

    // === Tryb nocny ===
    if (localStorage.getItem("darkmode") === "true") {
        document.body.classList.add("dark");
    }

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("darkmode", document.body.classList.contains("dark"));
    });

    // === Ładowanie XML ===
    function loadXML(callback) {
        fetch("baza.xml")
            .then(res => res.text())
            .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
            .then(data => callback(data))
            .catch(err => console.error("Błąd wczytywania XML:", err));
    }

    function buildMenu(xml) {
        const podstrony = xml.querySelectorAll("podstrona");
        const categories = {};

        podstrony.forEach(p => {
            const title = p.querySelector("tytul").textContent;
            const url = p.querySelector("adres").textContent;
            const [category] = url.split("/");

            if (!categories[category]) {
                categories[category] = [];
            }

            categories[category].push({ title, url });
        });

        Object.entries(categories).forEach(([category, items]) => {
            const categoryLi = document.createElement("li");
            const categoryLink = document.createElement("a");
            categoryLink.href = "#";
            categoryLink.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryLi.appendChild(categoryLink);

            const subUl = document.createElement("ul");
            subUl.style.marginLeft = "15px";
            subUl.style.display = "none";

            items.forEach(({ title, url }) => {
                const itemLi = document.createElement("li");
                const itemA = document.createElement("a");
                itemA.href = "#" + url;
                itemA.textContent = title;
                itemLi.appendChild(itemA);
                subUl.appendChild(itemLi);
            });

            categoryLink.addEventListener("click", (e) => {
                e.preventDefault();
                subUl.style.display = subUl.style.display === "none" ? "block" : "none";
            });

            categoryLi.appendChild(subUl);
            navList.appendChild(categoryLi);
        });
    }

    function showPage(xml, hash) {
        const adres = hash.replace(/^#/, '');
        const p = Array.from(xml.querySelectorAll("podstrona")).find(p =>
            p.querySelector("adres").textContent === adres
        );

        if (p) {
            const tytul = p.querySelector("tytul").textContent;
            const tresc = p.querySelector("tresc").textContent;
            const obraz = p.querySelector("obraz").textContent;

            main.innerHTML = `
                <article>
                    <h2>${tytul}</h2>
                    ${tresc}
                    <img id="dynamic-img" src="${obraz}" alt="${tytul}" style="max-width: 100%; margin-top: 10px; border-radius: 12px;">
                </article>
            `;

            const img = document.getElementById("dynamic-img");

            img.onload = () => {
                const dominantColor = getDominantColor(img);
                reklama.style.backgroundColor = dominantColor;
            };
        } else {
            main.innerHTML = `
                <article>
                    <h2>Nie znaleziono strony</h2>
                    <p>Podana podstrona nie istnieje.</p>
                </article>
            `;
            reklama.style.backgroundColor = "";
        }
    }

    function init(xml) {
        buildMenu(xml);
        if (window.location.hash) {
            showPage(xml, window.location.hash);
        }
        window.addEventListener("hashchange", () => {
            showPage(xml, window.location.hash);
        });
    }

    function getDominantColor(imgElement) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        ctx.drawImage(imgElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const colorCounts = {};
        let maxCount = 0;
        let dominantColor = "#cccccc";

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const key = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;

            if (colorCounts[key] > maxCount) {
                maxCount = colorCounts[key];
                dominantColor = `rgb(${Math.floor(r / 32) * 32}, ${Math.floor(g / 32) * 32}, ${Math.floor(b / 32) * 32})`;
            }
        }

        return dominantColor;
    }
    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("quiz-form");
        const wynik = document.getElementById("wynik");
    
        let odpowiedzi = {
            czas: "",
            przestrzen: "",
            aktywnosc: "",
            czystosc: ""
        };
    
        // Ładowanie XML
        function loadXML(callback) {
            fetch("baza.xml")
                .then(res => res.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(data => callback(data))
                .catch(err => console.error("Błąd wczytywania XML:", err));
        }
    
        // Funkcja obliczająca najlepsze dopasowanie
        function obliczNajlepszyZwierzak(xml, odpowiedzi) {
            const zwierzeta = xml.querySelectorAll("zwierze");
            let najlepiejDopasowane = [];
            let minRoznica = Infinity;
    
            zwierzeta.forEach(zwierze => {
                let roznica = 0;
    
                // Porównanie odpowiedzi użytkownika z wymaganiami zwierzęcia
                roznica += porownajOdpowiedzi(zwierze, "uwaga", odpowiedzi.czas);
                roznica += porownajOdpowiedzi(zwierze, "przestrzen", odpowiedzi.przestrzen);
                roznica += porownajOdpowiedzi(zwierze, "aktywnosc", odpowiedzi.aktywnosc);
                roznica += porownajOdpowiedzi(zwierze, "czystosc", odpowiedzi.czystosc);
    
                if (roznica < minRoznica) {
                    minRoznica = roznica;
                    najlepiejDopasowane = [zwierze];
                } else if (roznica === minRoznica) {
                    najlepiejDopasowane.push(zwierze);
                }
            });
    
            return najlepiejDopasowane;
        }
    
        // Funkcja porównująca odpowiedzi
        function porownajOdpowiedzi(zwierze, wymaganie, odpowiedz) {
            const zwierzeWymaganie = zwierze.querySelector(`wymagania > ${wymaganie}`).textContent;
            if (zwierzeWymaganie === odpowiedz) {
                return 0;
            }
            return 1;
        }
    
        // Obsługa formularza
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            // Pobranie odpowiedzi użytkownika
            odpowiedzi.czas = document.querySelector('input[name="czas"]:checked').value;
            odpowiedzi.przestrzen = document.querySelector('input[name="przestrzen"]:checked').value;
            odpowiedzi.aktywnosc = document.querySelector('input[name="aktywnosc"]:checked').value;
            odpowiedzi.czystosc = document.querySelector('input[name="czystosc"]:checked').value;
    
            // Wybór najlepszego zwierzaka
            loadXML(function (xml) {
                const najlepszeZwierze = obliczNajlepszyZwierzak(xml, odpowiedzi);
                wynik.innerHTML = `
                    <h3>Najlepszy wybór: ${najlepszeZwierze[0].querySelector("nazwa").textContent}</h3>
                    <p>${najlepszeZwierze[0].querySelector("opis").textContent}</p>
                `;
            });
        });
    });
    

    loadXML(init);
});
