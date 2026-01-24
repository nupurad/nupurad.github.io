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
        farmArea.appendChild(animalEl);

        // Add animation class for visual feedback
        animalEl.classList.add('bounce');
        setTimeout(() => animalEl.classList.remove('bounce'), 500);

        const animalObj = {
            el: animalEl,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: 40, // Collision radius
            targetX: x,
            targetY: y,
            state: 'IDLE', // IDLE, WALK, WAIT
            stateTimer: 0,
            speed: 0.8 + Math.random() * 0.5 // Random speed
        };

        activeAnimals.push(animalObj);
    }

    // Game Loop
    let lastTime = 0;
    function update(time) {
        const dt = time - lastTime;
        lastTime = time;

        // Clean up removed animals
        activeAnimals = activeAnimals.filter(a => a.el.isConnected);

        activeAnimals.forEach(animal => {
            // Update State Logic
            if (animal.state === 'IDLE') {
                animal.stateTimer -= dt;
                if (animal.stateTimer <= 0) {
                    // Pick new target
                    const padding = 50;
                    const maxX = farmArea.clientWidth - padding;
                    const maxY = farmArea.clientHeight - padding;
                    animal.targetX = padding + Math.random() * (maxX - padding);
                    animal.targetY = padding + Math.random() * (maxY - padding);
                    animal.state = 'WALK';

                    // Face direction
                    if (animal.targetX < animal.x) {
                        animal.el.style.transform = 'translate(-50%, -50%) scaleX(-1)';
                    } else {
                        animal.el.style.transform = 'translate(-50%, -50%) scaleX(1)';
                    }
                }
            } else if (animal.state === 'WALK') {
                // Move towards target
                const dx = animal.targetX - animal.x;
                const dy = animal.targetY - animal.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 5) {
                    animal.state = 'IDLE';
                    animal.stateTimer = 1000 + Math.random() * 2000;
                    animal.vx = 0;
                    animal.vy = 0;
                } else {
                    // Normalize velocity
                    animal.vx = (dx / dist) * animal.speed;
                    animal.vy = (dy / dist) * animal.speed;

                    // COLLISION AVOIDANCE
                    let separationX = 0;
                    let separationY = 0;
                    let neighbors = 0;

                    activeAnimals.forEach(other => {
                        if (animal === other) return;

                        const odx = animal.x - other.x;
                        const ody = animal.y - other.y;
                        const odist = Math.sqrt(odx * odx + ody * ody);

                        // Check collision radius (approx 80px distance threshold)
                        if (odist < 80) {
                            // "Wait till other passes" - logic:
                            // If very close and moving towards each other, stop briefly?
                            // Or simpler: Separation force

                            // Separation
                            const force = (80 - odist) / 80; // stronger closer
                            separationX += (odx / odist) * force * 2.0; // weighting
                            separationY += (ody / odist) * force * 2.0;
                            neighbors++;

                            // If dangerously close, switch to WAIT state
                            if (odist < 50 && animal.state !== 'WAIT') {
                                // 50% chance to wait, 50% chance to redirect?
                                // Let's make one wait
                                if (Math.random() > 0.5) {
                                    animal.state = 'WAIT';
                                    animal.stateTimer = 500 + Math.random() * 1000;
                                }
                            }
                        }
                    });

                    // Apply movement
                    animal.x += animal.vx + separationX;
                    animal.y += animal.vy + separationY;

                    // Face direction update
                    if (animal.vx + separationX < -0.1) {
                        animal.el.style.transform = 'translate(-50%, -50%) scaleX(-1)';
                    } else if (animal.vx + separationX > 0.1) {
                        animal.el.style.transform = 'translate(-50%, -50%) scaleX(1)';
                    }
                }
            } else if (animal.state === 'WAIT') {
                animal.stateTimer -= dt;
                if (animal.stateTimer <= 0) {
                    animal.state = 'WALK'; // Resume
                }
            }

            // Boundary checks
            const padding = 30;
            if (animal.x < padding) animal.x = padding;
            if (animal.x > farmArea.clientWidth - padding) animal.x = farmArea.clientWidth - padding;
            if (animal.y < padding) animal.y = padding;
            if (animal.y > farmArea.clientHeight - padding) animal.y = farmArea.clientHeight - padding;

            // Render
            animal.el.style.left = animal.x + 'px';
            animal.el.style.top = animal.y + 'px';
        });

        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const allAnimals = document.querySelectorAll('.animal');
            allAnimals.forEach(el => el.remove());
            activeAnimals = [];
        });
    }

    // Window resize handling
    window.addEventListener('resize', () => {
    });
});
