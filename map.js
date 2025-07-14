// Logika mapy gry
function initMap(playerPosition) {
    const mapContainer = document.getElementById('worldMap');
    if (!mapContainer) return;
    
    // Stwórz kontener mapy
    const mapGrid = document.createElement('div');
    mapGrid.className = 'map-grid';
    mapContainer.appendChild(mapGrid);
    
    // Wymiary mapy
    const mapWidth = 1000;
    const mapHeight = 1000;
    const cellSize = 50; // rozmiar komórki w pikselach
    
    // Ustaw rozmiar mapy
    mapGrid.style.width = `${mapWidth}px`;
    mapGrid.style.height = `${mapHeight}px`;
    
    // Generuj punkty na mapie
    generateMapPoints(mapGrid, playerPosition);
    
    // Obsługa przycisków mapy
    document.getElementById('zoomIn').addEventListener('click', function() {
        // Logika powiększania mapy
        alert('Funkcja powiększania mapy zostanie zaimplementowana w pełnej wersji gry!');
    });
    
    document.getElementById('zoomOut').addEventListener('click', function() {
        // Logika pomniejszania mapy
        alert('Funkcja pomniejszania mapy zostanie zaimplementowana w pełnej wersji gry!');
    });
    
    document.getElementById('centerMap').addEventListener('click', function() {
        // Centrowanie na pozycji gracza
        mapGrid.scrollTo({
            left: playerPosition.x - mapWidth/2,
            top: playerPosition.y - mapHeight/2,
            behavior: 'smooth'
        });
    });
    
    // Obsługa przycisków typu mapy
    const mapTypeButtons = document.querySelectorAll('.map-btn');
    mapTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            mapTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Tutaj można dodać zmianę stylu mapy w zależności od typu
        });
    });
    
    // Wyśrodkuj mapę na pozycji gracza
    mapGrid.scrollTo(playerPosition.x - mapWidth/2, playerPosition.y - mapHeight/2);
}

function generateMapPoints(mapContainer, playerPosition) {
    // Dodaj gracza
    createMapPoint(mapContainer, playerPosition.x, playerPosition.y, 'player', 'Twój Schron', 'fas fa-home');
    
    // Generuj wrogie bazy (5-10)
    const enemyCount = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < enemyCount; i++) {
        const x = Math.floor(Math.random() * 800) + 100;
        const y = Math.floor(Math.random() * 800) + 100;
        // Upewnij się, że bazy nie są zbyt blisko gracza
        if (Math.abs(x - playerPosition.x) > 150 || Math.abs(y - playerPosition.y) > 150) {
            createMapPoint(mapContainer, x, y, 'enemy', `Baza Wroga #${i+1}`, 'fas fa-skull');
        }
    }
    
    // Generuj ruiny (10-20)
    const ruinsCount = Math.floor(Math.random() * 11) + 10;
    for (let i = 0; i < ruinsCount; i++) {
        const x = Math.floor(Math.random() * 900) + 50;
        const y = Math.floor(Math.random() * 900) + 50;
        createMapPoint(mapContainer, x, y, 'ruins', `Ruiny #${i+1}`, 'fas fa-building');
    }
    
    // Generuj źródła zasobów (15-25)
    const resourceCount = Math.floor(Math.random() * 11) + 15;
    for (let i = 0; i < resourceCount; i++) {
        const x = Math.floor(Math.random() * 900) + 50;
        const y = Math.floor(Math.random() * 900) + 50;
        const types = ['food', 'water', 'scrap', 'tech'];
        const type = types[Math.floor(Math.random() * types.length)];
        let icon, name;
        
        switch(type) {
            case 'food':
                icon = 'fas fa-apple-alt';
                name = 'Źródło Żywności';
                break;
            case 'water':
                icon = 'fas fa-tint';
                name = 'Źródło Wody';
                break;
            case 'scrap':
                icon = 'fas fa-cog';
                name = 'Złomowisko';
                break;
            case 'tech':
                icon = 'fas fa-microchip';
                name = 'Technologiczne Ruiny';
                break;
        }
        
        createMapPoint(mapContainer, x, y, 'resource', name, icon);
    }
    
    // Generuj eventy (3-5)
    const eventCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < eventCount; i++) {
        const x = Math.floor(Math.random() * 900) + 50;
        const y = Math.floor(Math.random() * 900) + 50;
        const events = ['burza', 'epidemia', 'bunt', 'atak mutantów', 'odkrycie'];
        const event = events[Math.floor(Math.random() * events.length)];
        let icon, name;
        
        switch(event) {
            case 'burza':
                icon = 'fas fa-wind';
                name = 'Burza Piaskowa';
                break;
            case 'epidemia':
                icon = 'fas fa-virus';
                name = 'Ognisko Epidemii';
                break;
            case 'bunt':
                icon = 'fas fa-fist-raised';
                name = 'Bunt Przeciwko Władzy';
                break;
            case 'atak mutantów':
                icon = 'fas fa-paw';
                name = 'Atak Mutantów';
                break;
            case 'odkrycie':
                icon = 'fas fa-compass';
                name = 'Niezbadane Terytorium';
                break;
        }
        
        createMapPoint(mapContainer, x, y, 'event', name, icon);
    }
}

function createMapPoint(container, x, y, type, name, icon) {
    const point = document.createElement('div');
    point.className = `map-cell ${type}`;
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    point.dataset.type = type;
    point.dataset.name = name;
    
    point.innerHTML = `<i class="${icon}"></i><div class="map-label">${name}</div>`;
    
    point.addEventListener('click', function() {
        showMapEvent(this);
    });
    
    container.appendChild(point);
    return point;
}

function showMapEvent(point) {
    const type = point.dataset.type;
    const name = point.dataset.name;
    const modal = document.getElementById('eventModal');
    const title = document.getElementById('eventTitle');
    const description = document.getElementById('eventDescription');
    const actions = document.getElementById('eventActions');
    
    title.textContent = name;
    actions.innerHTML = '';
    
    switch(type) {
        case 'player':
            description.innerHTML = '<p>To jest twoja główna baza. Tutaj możesz zarządzać zasobami, budynkami i jednostkami.</p>';
            actions.innerHTML = '<button class="btn">Zarządzaj Bazą</button>';
            break;
            
        case 'enemy':
            description.innerHTML = `
                <p>Wykryto wrogą bazę! Poziom zagrożenia: <strong>${Math.floor(Math.random() * 5) + 1}/5</strong></p>
                <p>Siły wroga: ${Math.floor(Math.random() * 50) + 20} jednostek</p>
                <p>Szacowane zasoby: ${Math.floor(Math.random() * 2000) + 500}</p>
            `;
            actions.innerHTML = `
                <button class="btn" style="background: var(--danger)">Atakuj</button>
                <button class="btn" style="background: var(--warning)">Wyślij Zwiad</button>
                <button class="btn">Negocjuj</button>
            `;
            break;
            
        case 'ruins':
            description.innerHTML = `
                <p>Odnaleziono opuszczone ruiny. Możliwe do znalezienia zasoby: ${Math.floor(Math.random() * 1000) + 200}</p>
                <p>Poziom niebezpieczeństwa: ${Math.floor(Math.random() * 3) + 1}/3</p>
            `;
            actions.innerHTML = `
                <button class="btn" style="background: var(--success)">Eksploruj</button>
                <button class="btn">Zignoruj</button>
            `;
            break;
            
        case 'resource':
            let resourceType = 'Żywność';
            let resourceIcon = 'fa-apple-alt';
            
            if (name.includes('Wody')) {
                resourceType = 'Woda';
                resourceIcon = 'fa-tint';
            } else if (name.includes('Złomowisko')) {
                resourceType = 'Złom';
                resourceIcon = 'fa-cog';
            } else if (name.includes('Technologiczne')) {
                resourceType = 'Technologie';
                resourceIcon = 'fa-microchip';
            }
            
            description.innerHTML = `
                <p>Odnaleziono źródło zasobów: <strong>${resourceType}</strong></p>
                <p>Szacowana ilość: ${Math.floor(Math.random() * 1500) + 500}</p>
                <p>Poziom trudności pozyskania: ${Math.floor(Math.random() * 4) + 1}/4</p>
            `;
            actions.innerHTML = `
                <button class="btn" style="background: var(--success)">
                    <i class="fas ${resourceIcon}"></i> Pozyskaj Zasoby
                </button>
            `;
            break;
            
        case 'event':
            let eventDesc = '';
            
            if (name.includes('Burza')) {
                eventDesc = '<p>Ogromna burza piaskowa przetacza się przez ten region. Ekspedycje w tym rejonie są niemożliwe przez najbliższe 24 godziny.</p>';
            } else if (name.includes('Epidemia')) {
                eventDesc = '<p>Wykryto ognisko nieznanej choroby. Każda jednostka wysłana w ten region może zostać zainfekowana.</p>';
            } else if (name.includes('Bunt')) {
                eventDesc = '<p>Grupa ocalałych zbuntowała się przeciwko lokalnym władzom. Region jest niestabilny i niebezpieczny.</p>';
            } else if (name.includes('Mutantów')) {
                eventDesc = '<p>Obserwowano zwiększoną aktywność mutantów w tym regionie. Niezbędne są dodatkowe siły do eksploracji.</p>';
            } else if (name.includes('Terytorium')) {
                eventDesc = '<p>Odnaleziono niezbadany region. Może zawierać cenne zasoby lub niebezpieczne zagrożenia.</p>';
            }
            
            description.innerHTML = eventDesc;
            actions.innerHTML = `
                <button class="btn" style="background: var(--warning)">Zbadaj</button>
                <button class="btn">Unikaj</button>
            `;
            break;
    }
    
    // Pokaż modal
    modal.style.display = 'flex';
    
    // Zamknij modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
}