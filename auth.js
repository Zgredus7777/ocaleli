// Obsługa rejestracji i logowania
document.addEventListener('DOMContentLoaded', function() {
    // Rejestracja
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Walidacja
            if (password !== confirmPassword) {
                alert('Hasła nie są identyczne!');
                return;
            }
            
            if (password.length < 6) {
                alert('Hasło musi mieć co najmniej 6 znaków!');
                return;
            }
            
            // Sprawdź, czy użytkownik już istnieje
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[username]) {
                alert('Nazwa użytkownika jest już zajęta!');
                return;
            }
            
            // Stwórz nowego użytkownika
            users[username] = {
                email: email,
                password: password,
                gameData: {
                    level: 1,
                    rank: 'Nowicjusz',
                    resources: {
                        food: 1000,
                        water: 800,
                        energy: 500,
                        scrap: 600,
                        tech: 100,
                        gold: 0
                    },
                    buildings: {
                        waterIntake: { level: 1 },
                        hydroponics: { level: 1 },
                        solarPanels: { level: 1 },
                        defenseTower: { level: 0 },
                        scrapyard: { level: 1 } // Nowy budynek: złomowisko
                    },
                    units: {
                        scouts: 5,
                        hunters: 0,
                        guards: 0,
                        transporters: 0
                    },
                    inventory: {
                        medkit: {
                            id: 'medkit',
                            name: 'Apteczka',
                            type: 'Specjalny',
                            icon: 'fas fa-first-aid',
                            price: 250,
                            description: 'Leczy wszystkich mieszkańców',
                            effect: { health: 'full' },
                            quantity: 1
                        }
                    },
                    position: { x: 50, y: 50 },
                    lastLogin: new Date().getTime(),
                    daysSurvived: 1,
                    buildQueue: []
                }
            };
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', username);
            alert('Rejestracja udana! Witamy w postapokaliptycznym świecie.');
            window.location.href = 'game.html';
        });
    }
    
    // Logowanie
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (!users[username] || users[username].password !== password) {
                alert('Nieprawidłowa nazwa użytkownika lub hasło!');
                return;
            }
            
            localStorage.setItem('currentUser', username);
            window.location.href = 'game.html';
        });
    }
    
    // Wylogowanie
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Sprawdź, czy użytkownik jest zalogowany
    if (window.location.pathname.includes('game.html')) {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }
});