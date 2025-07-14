// Główna logika gry
document.addEventListener('DOMContentLoaded', function() {
    // Sprawdź, czy użytkownik jest zalogowany
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.includes('game.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    if (!currentUser) return;
    
    // Wczytaj dane użytkownika
    const users = JSON.parse(localStorage.getItem('users'));
    const userData = users[currentUser].gameData;
    
    // Aktualizuj interfejs użytkownika
    document.getElementById('playerName').textContent = currentUser;
    document.getElementById('playerRank').textContent = userData.rank;
    
    // Aktualizuj zasoby
    updateResourcesDisplay(userData.resources);
    
    // Ustaw zegar
    updateGameClock();
    setInterval(updateGameClock, 1000);
    
    // Uruchom timer budowania
    startBuildTimer();
    
    // Aktualizuj zasoby co minutę
    setInterval(() => {
        // Produkcja zasobów
        userData.resources.food += 10;
        userData.resources.water += 8;
        userData.resources.energy += 5;
        
        // Dodaj sprawdzenie czy złomowisko istnieje
        if (userData.buildings.scrapyard) {
            userData.resources.scrap += 3 * userData.buildings.scrapyard.level;
        } else {
            userData.resources.scrap += 3; // Domyślna wartość
        }
        
        userData.resources.tech += 1;
        
        // Zapisz dane
        users[currentUser].gameData = userData;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Aktualizuj UI
        updateResourcesDisplay(userData.resources);
    }, 60000);
    
    // Renderuj domyślną sekcję (schron)
    renderShelter(userData);
    
    // Uruchom timer aktualizacji kolejki
    startQueueUpdateTimer();
    
    // Obsługa nawigacji
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section') + 'Section';
            
            // Usuń aktywną klasę
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.game-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Dodaj aktywną klasę
            this.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
            
            // Renderuj zawartość sekcji
            switch(this.getAttribute('data-section')) {
                case 'shelter':
                    renderShelter(userData);
                    break;
                case 'buildings':
                    renderBuildings(userData);
                    break;
                case 'production':
                    renderProduction(userData);
                    break;
                case 'research':
                    renderResearch(userData);
                    break;
                case 'map':
                    if (typeof initMap === 'function') {
                        initMap(userData.position);
                    }
                    break;
                case 'shop':
                    renderShop(userData);
                    break;
            }
        });
    });
    
    // Funkcja aktualizująca wyświetlanie zasobów
    function updateResourcesDisplay(resources) {
        document.getElementById('foodCount').textContent = resources.food;
        document.getElementById('waterCount').textContent = resources.water;
        document.getElementById('energyCount').textContent = resources.energy;
        document.getElementById('scrapCount').textContent = resources.scrap;
        document.getElementById('techCount').textContent = resources.tech;
        document.getElementById('goldCount').textContent = resources.gold || 0;
    }
    
    // Funkcja aktualizująca zegar gry
    function updateGameClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pl-PL');
        document.getElementById('currentTime').textContent = timeString;
        
        // Aktualizuj datę gry
        document.getElementById('gameDate').textContent = `${userData.daysSurvived} dzień po Apokalipsie`;
    }
    
    // Funkcja uruchamiająca timer budowania
    function startBuildTimer() {
        setInterval(() => {
            processBuildQueue();
        }, 1000);
    }
    
    // Funkcja uruchamiająca timer aktualizacji kolejki
    function startQueueUpdateTimer() {
        setInterval(() => {
            updateQueueDisplay();
        }, 1000);
    }
    
    // Funkcja aktualizująca wyświetlanie kolejki
    function updateQueueDisplay() {
        const queueList = document.getElementById('buildQueueList');
        if (queueList && userData.buildQueue) {
            queueList.innerHTML = renderBuildQueue(userData.buildQueue);
        }
    }
    
    // Funkcja przetwarzająca kolejkę budowania
    function processBuildQueue() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const userData = users[currentUser].gameData;
        const now = Date.now();
        let updated = false;
        
        // Sprawdź czy kolejka istnieje
        if (!userData.buildQueue) userData.buildQueue = [];
        
        // Przetwarzaj zadania w kolejce
        userData.buildQueue = userData.buildQueue.filter(job => {
            if (job.completionTime <= now) {
                // Zadanie zakończone
                if (job.type === 'building') {
                    // Sprawdź czy budynek istnieje
                    if (userData.buildings[job.building]) {
                        userData.buildings[job.building].level += 1;
                        alert(`Ulepszono ${job.building} do poziomu ${userData.buildings[job.building].level}!`);
                    }
                } else if (job.type === 'unit') {
                    userData.units[job.unit] += job.quantity;
                    alert(`Zrekrutowano ${job.quantity} ${job.unit}!`);
                } else if (job.type === 'production') {
                    // Dodaj wytworzone przedmioty
                    if (!userData.inventory[job.itemId]) {
                        userData.inventory[job.itemId] = job.item;
                        userData.inventory[job.itemId].quantity = job.quantity;
                    } else {
                        userData.inventory[job.itemId].quantity += job.quantity;
                    }
                    alert(`Wyprodukowano ${job.quantity}x ${job.item.name}!`);
                } else if (job.type === 'research') {
                    // Odblokuj technologię
                    userData.research[job.techId] = {
                        ...job.tech,
                        unlocked: true
                    };
                    alert(`Odblokowano technologię: ${job.tech.name}!`);
                }
                updated = true;
                return false;
            }
            return true;
        });
        
        if (updated) {
            // Zapisz zmiany
            users[currentUser].gameData = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Odśwież UI
            renderShelter(userData);
            
            if (document.getElementById('buildingsSection').classList.contains('active')) {
                renderBuildings(userData);
            }
        }
    }
    
    // Funkcje renderujące
    function renderShelter(userData) {
        const content = document.getElementById('shelterContent');
        if (!content) return;
        
        // Oblicz statystyki schronu
        const capacity = 500 + userData.level * 300;
        const maxCapacity = 1000 + userData.level * 200;
        const defense = userData.buildings.defenseTower ? userData.buildings.defenseTower.level * 10 : 0;
        const happiness = userData.buildings.hydroponics ? userData.buildings.hydroponics.level * 15 : 0;
        const energyProduction = userData.buildings.solarPanels ? userData.buildings.solarPanels.level * 10 : 0;
        
        // Generuj HTML dla złomowiska tylko jeśli istnieje
        const scrapyardHTML = userData.buildings.scrapyard ? `
            <div class="building">
                <div class="building-header">
                    <div class="building-icon">
                        <i class="fas fa-recycle"></i>
                    </div>
                    <div>
                        <div class="building-name">Złomowisko</div>
                        <div class="building-level">Poziom ${userData.buildings.scrapyard.level}</div>
                    </div>
                </div>
                <div class="building-stats">
                    <div>+${userData.buildings.scrapyard.level * 15} złomu/h</div>
                    <div>Zużycie energii: ${userData.buildings.scrapyard.level * 5}/h</div>
                </div>
                <button class="upgrade-btn" data-building="scrapyard">Ulepsz</button>
            </div>
        ` : '';
        
        // Koszt rekrutacji
        const costs = {
            scouts: { food: 50, scrap: 20 },
            hunters: { food: 80, scrap: 40 },
            guards: { food: 60, scrap: 60 },
            transporters: { food: 100, scrap: 150 }
        };
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Schron Główny</h2>
                    <div class="card-badge">Poziom ${userData.level}</div>
                </div>
                <div class="card-content">
                    <div class="base-info">
                        <div class="base-icon">
                            <i class="fas fa-igloo"></i>
                        </div>
                        <div>
                            <h3>Twierdza Ocalałych</h3>
                            <p>Pozycja: Sektor 7-G</p>
                        </div>
                    </div>
                    
                    <div class="base-stats">
                        <div class="stat">
                            <div>Pojemność schronu</div>
                            <div class="stat-value">${capacity}/${maxCapacity}</div>
                        </div>
                        <div class="stat">
                            <div>Obrona</div>
                            <div class="stat-value">${defense}%</div>
                        </div>
                        <div class="stat">
                            <div>Zadowolenie</div>
                            <div class="stat-value">${happiness}%</div>
                        </div>
                        <div class="stat">
                            <div>Energia</div>
                            <div class="stat-value">+${energyProduction}/h</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Infrastruktura</h2>
                </div>
                <div class="card-content">
                    <div class="buildings-list">
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-tint"></i>
                                </div>
                                <div>
                                    <div class="building-name">Ujęcie wody</div>
                                    <div class="building-level">Poziom ${userData.buildings.waterIntake.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>+${userData.buildings.waterIntake.level * 25} wody/h</div>
                                <div>Zużycie energii: ${userData.buildings.waterIntake.level * 5}/h</div>
                            </div>
                            <button class="upgrade-btn" data-building="waterIntake">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-seedling"></i>
                                </div>
                                <div>
                                    <div class="building-name">Hydroponika</div>
                                    <div class="building-level">Poziom ${userData.buildings.hydroponics.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>+${userData.buildings.hydroponics.level * 30} żywności/h</div>
                                <div>Zużycie wody: ${userData.buildings.hydroponics.level * 10}/h</div>
                            </div>
                            <button class="upgrade-btn" data-building="hydroponics">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-solar-panel"></i>
                                </div>
                                <div>
                                    <div class="building-name">Panele słoneczne</div>
                                    <div class="building-level">Poziom ${userData.buildings.solarPanels.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>+${userData.buildings.solarPanels.level * 50} energii/h</div>
                                <div>Wymaga światła</div>
                            </div>
                            <button class="upgrade-btn" data-building="solarPanels">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-shield-alt"></i>
                                </div>
                                <div>
                                    <div class="building-name">Wieża obronna</div>
                                    <div class="building-level">Poziom ${userData.buildings.defenseTower?.level || 0}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Siła obrony: ${(userData.buildings.defenseTower?.level || 0) * 120}</div>
                                <div>Zużycie energii: ${(userData.buildings.defenseTower?.level || 0) * 15}/h</div>
                            </div>
                            <button class="upgrade-btn" data-building="defenseTower">Ulepsz</button>
                        </div>
                        
                        ${scrapyardHTML}
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Twoje siły</h2>
                </div>
                <div class="card-content">
                    <div class="units-grid">
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="unit-name">Zwiadowcy</div>
                            <div class="unit-count">${userData.units.scouts}</div>
                            <div class="unit-cost">
                                <i class="fas fa-apple-alt"></i> ${costs.scouts.food} 
                                <i class="fas fa-cog"></i> ${costs.scouts.scrap}
                            </div>
                            <button class="upgrade-btn" data-unit="scouts">Rekrutuj</button>
                        </div>
                        
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-fist-raised"></i>
                            </div>
                            <div class="unit-name">Łowcy</div>
                            <div class="unit-count">${userData.units.hunters}</div>
                            <div class="unit-cost">
                                <i class="fas fa-apple-alt"></i> ${costs.hunters.food} 
                                <i class="fas fa-cog"></i> ${costs.hunters.scrap}
                            </div>
                            <button class="upgrade-btn" data-unit="hunters">Rekrutuj</button>
                        </div>
                        
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="unit-name">Strażnicy</div>
                            <div class="unit-count">${userData.units.guards}</div>
                            <div class="unit-cost">
                                <i class="fas fa-apple-alt"></i> ${costs.guards.food} 
                                <i class="fas fa-cog"></i> ${costs.guards.scrap}
                            </div>
                            <button class="upgrade-btn" data-unit="guards">Rekrutuj</button>
                        </div>
                        
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-truck"></i>
                            </div>
                            <div class="unit-name">Transportery</div>
                            <div class="unit-count">${userData.units.transporters}</div>
                            <div class="unit-cost">
                                <i class="fas fa-apple-alt"></i> ${costs.transporters.food} 
                                <i class="fas fa-cog"></i> ${costs.transporters.scrap}
                            </div>
                            <button class="upgrade-btn" data-unit="transporters">Buduj</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Aktualne zadania</h2>
                </div>
                <div class="card-content">
                    <div class="events-list" id="buildQueueList">
                        ${renderBuildQueue(userData.buildQueue || [])}
                    </div>
                </div>
            </div>
        `;
        
        // Dodaj obsługę przycisków
        attachBuildingButtons();
    }
    
    // Funkcja renderująca kolejkę budowania z paskiem postępu
    function renderBuildQueue(queue) {
        if (!queue || queue.length === 0) {
            return '<div class="event">Brak aktywnych zadań</div>';
        }
        
        const now = Date.now();
        return queue.map(job => {
            const totalTime = job.completionTime - job.startTime;
            const elapsed = now - job.startTime;
            const progress = Math.min(100, (elapsed / totalTime) * 100);
            let jobName = '';
            let jobIcon = 'fas fa-hourglass-half';
            
            if (job.type === 'building') {
                jobName = `Ulepszanie: ${job.building} (poziom ${job.level + 1})`;
                jobIcon = 'fas fa-hard-hat';
            } else if (job.type === 'unit') {
                jobName = `Rekrutacja: ${job.quantity}x ${job.unit}`;
                jobIcon = 'fas fa-users';
            } else if (job.type === 'production') {
                jobName = `Produkcja: ${job.quantity}x ${job.item.name}`;
                jobIcon = 'fas fa-tools';
            } else if (job.type === 'research') {
                jobName = `Badania: ${job.tech.name}`;
                jobIcon = 'fas fa-flask';
            }
            
            return `
                <div class="event">
                    <div class="event-header">
                        <i class="${jobIcon}"></i>
                        <div>${jobName}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <div class="time-remaining">
                        Pozostało: ${Math.ceil((job.completionTime - now) / 1000)}s
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function renderBuildings(userData) {
        const content = document.getElementById('buildingsContent');
        if (!content) return;
        
        // Generuj HTML dla złomowiska tylko jeśli istnieje
        const scrapyardHTML = userData.buildings.scrapyard ? `
            <div class="building">
                <div class="building-header">
                    <div class="building-icon">
                        <i class="fas fa-recycle"></i>
                    </div>
                    <div>
                        <div class="building-name">Złomowisko</div>
                        <div class="building-level">Poziom ${userData.buildings.scrapyard.level}</div>
                    </div>
                </div>
                <div class="building-stats">
                    <div>Zwiększa produkcję złomu</div>
                    <div>Koszt ulepszenia: ${80 * (userData.buildings.scrapyard.level + 1)} złomu</div>
                    <div>Czas budowy: ${userData.buildings.scrapyard.level * 10}s</div>
                </div>
                <button class="upgrade-btn" data-building="scrapyard">Ulepsz</button>
            </div>
        ` : '';
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Rozbudowa Schronu</h2>
                </div>
                <div class="card-content">
                    <p>Wybierz budynek do rozbudowy:</p>
                    
                    <div class="buildings-list">
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-tint"></i>
                                </div>
                                <div>
                                    <div class="building-name">Ujęcie wody</div>
                                    <div class="building-level">Poziom ${userData.buildings.waterIntake.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa produkcję wody</div>
                                <div>Koszt ulepszenia: ${100 * (userData.buildings.waterIntake.level + 1)} złomu</div>
                                <div>Czas budowy: ${userData.buildings.waterIntake.level * 10}s</div>
                            </div>
                            <button class="upgrade-btn" data-building="waterIntake">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-seedling"></i>
                                </div>
                                <div>
                                    <div class="building-name">Hydroponika</div>
                                    <div class="building-level">Poziom ${userData.buildings.hydroponics.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa produkcję żywności</div>
                                <div>Koszt ulepszenia: ${120 * (userData.buildings.hydroponics.level + 1)} złomu</div>
                                <div>Czas budowy: ${userData.buildings.hydroponics.level * 10}s</div>
                            </div>
                            <button class="upgrade-btn" data-building="hydroponics">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-solar-panel"></i>
                                </div>
                                <div>
                                    <div class="building-name">Panele słoneczne</div>
                                    <div class="building-level">Poziom ${userData.buildings.solarPanels.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa produkcję energii</div>
                                <div>Koszt ulepszenia: ${150 * (userData.buildings.solarPanels.level + 1)} złomu</div>
                                <div>Czas budowy: ${userData.buildings.solarPanels.level * 10}s</div>
                            </div>
                            <button class="upgrade-btn" data-building="solarPanels">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-shield-alt"></i>
                                </div>
                                <div>
                                    <div class="building-name">Wieża obronna</div>
                                    <div class="building-level">Poziom ${userData.buildings.defenseTower?.level || 0}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa obronę schronu</div>
                                <div>Koszt ulepszenia: ${200 * ((userData.buildings.defenseTower?.level || 0) + 1)} złomu</div>
                                <div>Czas budowy: ${(userData.buildings.defenseTower?.level || 0) * 10}s</div>
                            </div>
                            <button class="upgrade-btn" data-building="defenseTower">Ulepsz</button>
                        </div>
                        
                        ${scrapyardHTML}
                    </div>
                </div>
            </div>
        `;
        
        attachBuildingButtons();
    }
    
    // Funkcja renderująca zakładkę produkcji
    function renderProduction(userData) {
        const content = document.getElementById('productionContent');
        if (!content) return;
        
        // Dostępne przedmioty do produkcji
        const productionItems = {
            ammo: {
                id: 'ammo',
                name: 'Amunicja',
                icon: 'fas fa-bullseye',
                description: 'Podstawowa amunicja do broni palnej',
                cost: { scrap: 50, tech: 10 },
                time: 30000, // 30 sekund
                quantity: 10
            },
            medkit: {
                id: 'medkit',
                name: 'Apteczka',
                icon: 'fas fa-first-aid',
                description: 'Leczy rany i przywraca zdrowie',
                cost: { scrap: 30, tech: 15 },
                time: 45000, // 45 sekund
                quantity: 1
            },
            grenade: {
                id: 'grenade',
                name: 'Granat',
                icon: 'fas fa-bomb',
                description: 'Wybuchowy pocisk ręczny',
                cost: { scrap: 70, tech: 25 },
                time: 60000, // 60 sekund
                quantity: 3
            }
        };
        
        let itemsHTML = '';
        for (const [id, item] of Object.entries(productionItems)) {
            const costHTML = Object.entries(item.cost)
                .map(([resource, amount]) => 
                    `<span><i class="fas fa-${getResourceIcon(resource)}"></i> ${amount}</span>`
                )
                .join(' ');
                
            itemsHTML += `
                <div class="production-item">
                    <div class="item-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="item-cost">
                            Koszt: ${costHTML}
                        </div>
                        <div class="item-time">
                            <i class="fas fa-clock"></i> ${item.time/1000} sekund
                        </div>
                    </div>
                    <button class="produce-btn" data-item="${id}">Produkuj</button>
                </div>
            `;
        }
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Produkcja</h2>
                    <p>Wytwarzaj przedmioty niezbędne do przetrwania</p>
                </div>
                <div class="card-content">
                    <div class="production-list">
                        ${itemsHTML}
                    </div>
                </div>
            </div>
        `;
        
        // Dodaj obsługę przycisków produkcji
        document.querySelectorAll('.produce-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.item;
                startProduction(itemId, productionItems[itemId], currentUser);
            });
        });
    }
    
    // Funkcja renderująca zakładkę badań
    function renderResearch(userData) {
        const content = document.getElementById('researchContent');
        if (!content) return;
        
        // Dostępne technologie
        const technologies = {
            hydroponics: {
                id: 'hydroponics',
                name: 'Zaawansowana Hydroponika',
                icon: 'fas fa-seedling',
                description: 'Zwiększa produkcję żywności o 20%',
                cost: { scrap: 200, tech: 100 },
                time: 120000, // 2 minuty
                unlocked: userData.research?.hydroponics?.unlocked || false
            },
            solar: {
                id: 'solar',
                name: 'Efektywne Panele Słoneczne',
                icon: 'fas fa-solar-panel',
                description: 'Zwiększa produkcję energii o 30%',
                cost: { scrap: 300, tech: 150 },
                time: 180000, // 3 minuty
                unlocked: userData.research?.solar?.unlocked || false
            },
            defense: {
                id: 'defense',
                name: 'Ulepszone Systemy Obronne',
                icon: 'fas fa-shield-alt',
                description: 'Zwiększa obronę schronu o 25%',
                cost: { scrap: 400, tech: 200 },
                time: 240000, // 4 minuty
                unlocked: userData.research?.defense?.unlocked || false
            }
        };
        
        let techHTML = '';
        for (const [id, tech] of Object.entries(technologies)) {
            const costHTML = Object.entries(tech.cost)
                .map(([resource, amount]) => 
                    `<div class="resource-cost">
                        <i class="fas fa-${getResourceIcon(resource)}"></i> ${amount}
                    </div>`
                )
                .join('');
                
            const status = tech.unlocked ? 
                '<div class="tech-status unlocked"><i class="fas fa-check"></i> Odblokowane</div>' :
                `<button class="research-btn" data-tech="${id}">Badaj</button>`;
                
            techHTML += `
                <div class="tech-item ${tech.unlocked ? 'unlocked' : ''}">
                    <div class="tech-icon">
                        <i class="${tech.icon}"></i>
                    </div>
                    <div class="tech-details">
                        <h3>${tech.name}</h3>
                        <p>${tech.description}</p>
                        <div class="tech-cost">
                            <div class="cost-label">Koszt:</div>
                            ${costHTML}
                        </div>
                        <div class="tech-time">
                            <i class="fas fa-clock"></i> Czas: ${tech.time/1000} sekund
                        </div>
                    </div>
                    <div class="tech-status">
                        ${status}
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Badania</h2>
                    <p>Rozwijaj technologie dla lepszego przetrwania</p>
                </div>
                <div class="card-content">
                    <div class="research-list">
                        ${techHTML}
                    </div>
                </div>
            </div>
        `;
        
        // Dodaj obsługę przycisków badań
        document.querySelectorAll('.research-btn').forEach(button => {
            button.addEventListener('click', function() {
                const techId = this.dataset.tech;
                startResearch(techId, technologies[techId], currentUser);
            });
        });
    }
    
    function attachBuildingButtons() {
        // Obsługa przycisków budynków
        document.querySelectorAll('.upgrade-btn[data-building]').forEach(button => {
            button.addEventListener('click', function() {
                const building = this.dataset.building;
                upgradeBuilding(building, currentUser);
            });
        });
        
        // Obsługa przycisków jednostek
        document.querySelectorAll('.upgrade-btn[data-unit]').forEach(button => {
            button.addEventListener('click', function() {
                const unit = this.dataset.unit;
                recruitUnit(unit, currentUser);
            });
        });
    }
    
    function upgradeBuilding(building, username) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userData = users[username].gameData;
        
        // Sprawdź czy budynek istnieje
        if (!userData.buildings[building]) {
            alert('Ten budynek nie istnieje!');
            return;
        }
        
        // Koszt ulepszenia
        let cost;
        if (building === 'scrapyard') {
            cost = 80 * (userData.buildings[building].level + 1);
        } else {
            cost = 100 * (userData.buildings[building].level + 1);
        }
        const buildTime = (userData.buildings[building].level + 1) * 10000;
        
        if (userData.resources.scrap >= cost) {
            userData.resources.scrap -= cost;
            
            // Dodaj zadanie do kolejki
            if (!userData.buildQueue) userData.buildQueue = [];
            
            userData.buildQueue.push({
                type: 'building',
                building: building,
                level: userData.buildings[building].level,
                startTime: Date.now(),
                completionTime: Date.now() + buildTime
            });
            
            // Zapisz zmiany
            users[username].gameData = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Odśwież UI
            renderShelter(userData);
            renderBuildings(userData);
            
            alert(`Rozpoczęto ulepszanie ${building}!`);
        } else {
            alert('Nie masz wystarczająco złomu!');
        }
    }
    
    function recruitUnit(unit, username) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userData = users[username].gameData;
        
        // Koszt rekrutacji
        const costs = {
            scouts: { food: 50, scrap: 20 },
            hunters: { food: 80, scrap: 40 },
            guards: { food: 60, scrap: 60 },
            transporters: { food: 100, scrap: 150 }
        };
        const recruitTime = 10000;
        
        if (userData.resources.food >= costs[unit].food && 
            userData.resources.scrap >= costs[unit].scrap) {
            userData.resources.food -= costs[unit].food;
            userData.resources.scrap -= costs[unit].scrap;
            
            // Dodaj zadanie do kolejki
            if (!userData.buildQueue) userData.buildQueue = [];
            
            userData.buildQueue.push({
                type: 'unit',
                unit: unit,
                quantity: 1,
                startTime: Date.now(),
                completionTime: Date.now() + recruitTime
            });
            
            // Zapisz zmiany
            users[username].gameData = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Odśwież UI
            renderShelter(userData);
            
            alert(`Rozpoczęto rekrutację 1 ${unit}!`);
        } else {
            alert('Nie masz wystarczających zasobów!');
        }
    }
    
    // Funkcja rozpoczynająca produkcję
    function startProduction(itemId, item, username) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userData = users[username].gameData;
        
        // Sprawdź czy stać użytkownika
        let canAfford = true;
        for (const [resource, amount] of Object.entries(item.cost)) {
            if (userData.resources[resource] < amount) {
                canAfford = false;
                break;
            }
        }
        
        if (canAfford) {
            // Odejmij koszty
            for (const [resource, amount] of Object.entries(item.cost)) {
                userData.resources[resource] -= amount;
            }
            
            // Dodaj zadanie do kolejki
            if (!userData.buildQueue) userData.buildQueue = [];
            
            userData.buildQueue.push({
                type: 'production',
                itemId: item.id,
                item: item,
                quantity: item.quantity,
                startTime: Date.now(),
                completionTime: Date.now() + item.time
            });
            
            // Zapisz zmiany
            users[username].gameData = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Odśwież UI
            updateResourcesDisplay(userData.resources);
            alert(`Rozpoczęto produkcję ${item.quantity}x ${item.name}!`);
        } else {
            alert('Nie masz wystarczających zasobów!');
        }
    }
    
    // Funkcja rozpoczynająca badania
    function startResearch(techId, tech, username) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userData = users[username].gameData;
        
        // Sprawdź czy stać użytkownika
        let canAfford = true;
        for (const [resource, amount] of Object.entries(tech.cost)) {
            if (userData.resources[resource] < amount) {
                canAfford = false;
                break;
            }
        }
        
        if (canAfford) {
            // Odejmij koszty
            for (const [resource, amount] of Object.entries(tech.cost)) {
                userData.resources[resource] -= amount;
            }
            
            // Dodaj zadanie do kolejki
            if (!userData.buildQueue) userData.buildQueue = [];
            
            userData.buildQueue.push({
                type: 'research',
                techId: tech.id,
                tech: tech,
                startTime: Date.now(),
                completionTime: Date.now() + tech.time
            });
            
            // Zapisz zmiany
            users[username].gameData = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Odśwież UI
            updateResourcesDisplay(userData.resources);
            alert(`Rozpoczęto badania nad ${tech.name}!`);
        } else {
            alert('Nie masz wystarczających zasobów!');
        }
    }
    
    // Funkcja pomocnicza - ikony zasobów
    function getResourceIcon(resource) {
        switch(resource) {
            case 'food': return 'apple-alt';
            case 'water': return 'tint';
            case 'energy': return 'bolt';
            case 'scrap': return 'cog';
            case 'tech': return 'microchip';
            case 'gold': return 'coins';
            default: return 'question';
        }
    }
});