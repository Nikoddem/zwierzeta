document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("quiz-form");
    const wynikDiv = document.getElementById("wynik");

    // Wczytaj XML
    function loadXML(callback) {
        fetch("baza.xml")
            .then(res => res.text())
            .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
            .then(data => callback(data))
            .catch(err => console.error("Błąd wczytywania XML:", err));
    }

    // Funkcja do znalezienia najlepiej pasującego zwierzęcia
    function findBestMatch(userAnswers, xml) {
        const zwierzeta = xml.querySelectorAll("zwierze");
        let bestMatches = [];
        let maxScore = -1;

        zwierzeta.forEach(z => {
            const nazwa = z.querySelector("nazwa").textContent;
            const uwaga = z.querySelector("uwaga").textContent;
            const miejsce = z.querySelector("miejsce").textContent;
            const ruch = z.querySelector("ruch").textContent;
            const kontakt = z.querySelector("kontakt").textContent;

            let score = 0;
            if (userAnswers.uwaga === uwaga) score++;
            if (userAnswers.miejsce === miejsce) score++;
            if (userAnswers.ruch === ruch) score++;
            if (userAnswers.kontakt === kontakt) score++;

            if (score > maxScore) {
                bestMatches = [nazwa];
                maxScore = score;
            } else if (score === maxScore) {
                bestMatches.push(nazwa);
            }
        });

        return bestMatches;
    }

    // Obsługa formularza
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const userAnswers = {
            uwaga: form.elements["uwaga"].value,
            miejsce: form.elements["miejsce"].value,
            ruch: form.elements["ruch"].value,
            kontakt: form.elements["kontakt"].value
        };

        loadXML(function (xml) {
            const matches = findBestMatch(userAnswers, xml);
            if (matches.length > 0) {
                wynikDiv.innerHTML = `<h3>Najlepszy wybór:</h3><p>${matches.join(", ")}</p>`;
            } else {
                wynikDiv.innerHTML = "<p>Nie znaleziono odpowiedniego zwierzaka.</p>";
            }
            
        });
        
        
    });
});
