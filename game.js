document.addEventListener('DOMContentLoaded', () => {
    const farmArea = document.getElementById('farm-area');
    const clearBtn = document.getElementById('clear-btn');

    if (!farmArea) {
        console.error("Farm area not found!");
        return;
    }

    const animals = [
        'images/animal-cat.png',
        'images/animal-dog.png',
        'images/animal-sheep.png',
        'images/animal-fox.png'
    ];
    let activeAnimals = [];

    // Spawn animal on click
    farmArea.addEventListener('click', (e) => {
        const rect = farmArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        spawnAnimal(x, y);
    });

    function spawnAnimal(x, y) {
        const src = animals[Math.floor(Math.random() * animals.length)];
        const animalEl = document.createElement('img');
        animalEl.src = src;
        animalEl.classList.add('animal');

        // Initial Position
        animalEl.style.left = x + 'px';
        animalEl.style.top = y + 'px';

        // Add animation class for visual feedback
        animalEl.classList.add('bounce');
        setTimeout(() => animalEl.classList.remove('bounce'), 500);

        farmArea.appendChild(animalEl);

        const animalObj = {
            el: animalEl,
            width: 80,
            height: 80
        };

        activeAnimals.push(animalObj);

        // Start wandering behavior
        startWandering(animalObj);
    }

    function startWandering(animal) {
        // Random movement loop
        const move = () => {
            // Check if animal still exists
            if (!animal.el.isConnected) return;

            // Pick random destination within bounds
            const padding = 40;
            const maxX = farmArea.clientWidth - padding;
            const maxY = farmArea.clientHeight - padding;

            const nextX = Math.max(padding, Math.random() * maxX);
            const nextY = Math.max(padding, Math.random() * maxY);

            const duration = 2000 + Math.random() * 3000;

            animal.el.style.transition = `top ${duration}ms linear, left ${duration}ms linear`;
            animal.el.style.left = nextX + 'px';
            animal.el.style.top = nextY + 'px';

            // Face the direction
            const currentX = parseFloat(animal.el.style.left) || 0;
            if (nextX < currentX) {
                animal.el.style.transform = 'translate(-50%, -50%) scaleX(-1)'; // Face left
            } else {
                animal.el.style.transform = 'translate(-50%, -50%) scaleX(1)'; // Face right
            }

            // Wait for move to finish + random pause
            setTimeout(move, duration + Math.random() * 2000);
        };

        // Initial slight delay before first move
        setTimeout(move, 500 + Math.random() * 1000);
    }

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const allAnimals = document.querySelectorAll('.animal');
            allAnimals.forEach(el => el.remove());
            activeAnimals = [];
        });
    }
});
