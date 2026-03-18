document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Hero Animations
    const heroTitle = document.querySelector('.hero-title');
    const heroTagline = document.querySelector('.hero-tagline');
    const ctaButton = document.querySelector('.cta-button');

    if (heroTitle) {
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 300);
    }

    if (heroTagline) {
        setTimeout(() => {
            heroTagline.style.opacity = '1';
            heroTagline.style.transform = 'translateY(0)';
        }, 600);
    }

    if (ctaButton) {
        setTimeout(() => {
            ctaButton.style.opacity = '1';
            ctaButton.style.transform = 'translateY(0)';
        }, 900);
    }

    // 2. Intersection Observer for Reveal Elements
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));

    // 3. Particle Background System
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; // Gold particles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    init();
    animate();

    // 5. Hero Mouse Parallax
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const moveX = (clientX - innerWidth / 2) / 30;
            const moveY = (clientY - innerHeight / 2) / 30;

            if (heroTitle) heroTitle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            if (heroTagline) heroTagline.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
        });
    }
    // 6. Administrative Tools (Integrated)
    const staffAccessLink = document.getElementById('staff-access-link');
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authPass = document.getElementById('auth-pass');
    const authError = document.getElementById('auth-error');
    const closeAuth = document.getElementById('close-auth');
    
    const addMemberBtn = document.getElementById('add-member-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const personnelModal = document.getElementById('personnel-modal');
    const closePersonnelModal = document.getElementById('close-personnel-modal');
    const addPersonnelForm = document.getElementById('add-personnel-form');
    const teamGrid = document.getElementById('team-grid');

    const ADMIN_PASS = "190472";

    function updateAdminUI(isActive) {
        if (addMemberBtn) addMemberBtn.style.display = isActive ? 'block' : 'none';
        if (logoutBtn) logoutBtn.style.display = isActive ? 'block' : 'none';
    }

    // Check session
    if (sessionStorage.getItem('unga_admin_active') === 'true') {
        updateAdminUI(true);
    }

    // Auth Modal Controls
    if (staffAccessLink) {
        staffAccessLink.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
        });
    }

    if (closeAuth) {
        closeAuth.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (authPass.value === ADMIN_PASS) {
                sessionStorage.setItem('unga_admin_active', 'true');
                authModal.style.display = 'none';
                updateAdminUI(true);
                authPass.value = '';
                window.location.reload(); // Refresh to show edit/delete buttons
            } else {
                authError.textContent = "Invalid Authorization Code";
                setTimeout(() => authError.textContent = "", 2000);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('unga_admin_active');
            window.location.reload();
        });
    }


    let editingIndex = -1;

    // Personnel Modal Controls
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            editingIndex = -1;
            addPersonnelForm.reset();
            personnelModal.querySelector('h3').textContent = "Add Assembly Personnel";
            personnelModal.style.display = 'flex';
        });
    }

    if (closePersonnelModal) {
        closePersonnelModal.addEventListener('click', () => {
            personnelModal.style.display = 'none';
        });
    }

    // Personnel Deployment
    // Change this to your Render URL once deployed (e.g. https://unga-bot.onrender.com)
    const BOT_SERVER = 'http://localhost:3000';
    let manualPfpUrl = '';
    let allMembers = []; // Cache of server members

    if (addPersonnelForm) {
        addPersonnelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const discId = document.getElementById('new-id').value.trim();
            let pfpUrl = manualPfpUrl;

            if (!pfpUrl) {
                try {
                    const res = await fetch(`${BOT_SERVER}/avatar/${discId}`);
                    const data = await res.json();
                    pfpUrl = data.pfp || '';
                } catch (err) {}
            }

            if (!pfpUrl) {
                pfpUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(document.getElementById('new-name').value)}&background=004b87&color=d4af37&size=512`;
            }

            const memberData = {
                id: discId,
                name: document.getElementById('new-name').value,
                role: document.getElementById('new-role').value,
                pfp: pfpUrl,
                desc: 'Official UNGA Personnel'
            };

            const pass = ADMIN_PASS;
            try {
                if (editingIndex > -1) {
                    await fetch(`${BOT_SERVER}/members/${editingIndex}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pass, member: memberData })
                    });
                } else {
                    await fetch(`${BOT_SERVER}/members`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pass, member: memberData })
                    });
                }
            } catch (err) {
                alert('Error saving personnel. Is the bot server running?');
                return;
            }

            window.location.reload();
        });
    }

    function renderMember(member, index) {
        if (!teamGrid) return;
        const isAdmin = sessionStorage.getItem('unga_admin_active') === 'true';
        const card = document.createElement('div');
        card.className = 'team-card reveal active';
        card.style.position = 'relative';
        
        let adminControls = '';
        if (isAdmin) {
            adminControls = `
                <div style="position: absolute; top: 15px; right: 15px; display: flex; gap: 8px; z-index: 10;">
                    <button onclick="editPersonnel(${index})" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: var(--accent-gold); padding: 5px 8px; border-radius: 5px; cursor: pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="removePersonnel(${index})" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: #ff4d4d; padding: 5px 8px; border-radius: 5px; cursor: pointer;"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }

        card.innerHTML = `
            ${adminControls}
            <div class="member-avatar" style="background: none; overflow: hidden; border: 2px solid var(--accent-gold);">
                <img src="${member.pfp}" alt="${member.name} PFP" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span class="member-role">${member.role}</span>
            <h3 class="member-name">${member.name}</h3>
            <p style="color: var(--text-gray); margin-bottom: 25px;">${member.desc}</p>
            <a href="https://discord.com/users/${member.id}" target="_blank" class="dm-button">
                <i class="fab fa-discord"></i>
                Send MD
            </a>
        `;
        teamGrid.appendChild(card);
    }

    window.removePersonnel = async (index) => {
        if (confirm('Are you sure you want to remove this official?')) {
            await fetch(`${BOT_SERVER}/members/${index}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pass: ADMIN_PASS })
            });
            window.location.reload();
        }
    };

    window.editPersonnel = (index) => {
        const member = allMembers[index];
        editingIndex = index;
        document.getElementById('new-id').value = member.id;
        document.getElementById('new-name').value = member.name;
        document.getElementById('new-role').value = member.role;
        manualPfpUrl = member.pfp;
        personnelModal.querySelector('h3').textContent = "Update Personnel Profile";
        updatePfpPreview(member.pfp);
        personnelModal.style.display = 'flex';
    };

    // Auto-fetch PFP from Bot Server when ID is typed
    const idInput = document.getElementById('new-id');
    const nameInput = document.getElementById('new-name');
    const pfpPreviewContainer = document.getElementById('pfp-preview-container');

    if (idInput) {
        idInput.addEventListener('input', async () => {
            if (manualPfpUrl) return;
            const discId = idInput.value.trim();
            if (discId.length >= 17 && discId.length <= 19) {
                try {
                    const res = await fetch(`${BOT_SERVER}/avatar/${discId}`);
                    const data = await res.json();
                    if (data.pfp) updatePfpPreview(data.pfp);
                } catch(e) {}
            } else {
                updatePfpPreview('');
            }
        });
    }

    // Manual override: click circle to paste a URL directly
    if (pfpPreviewContainer) {
        pfpPreviewContainer.addEventListener('click', () => {
            const url = prompt("Paste a direct image URL to override the avatar:", manualPfpUrl);
            if (url !== null && url.trim() !== '') {
                manualPfpUrl = url.trim();
                updatePfpPreview(manualPfpUrl);
            }
        });
    }

    function updatePfpPreview(url) {
        const pfpPreviewImg = document.getElementById('pfp-preview-img');
        const pfpPlaceholder = document.getElementById('pfp-placeholder-icon');
        if (url && url.length > 5) {
            pfpPreviewImg.src = url;
            pfpPreviewImg.style.display = 'block';
            pfpPlaceholder.style.display = 'none';
        } else {
            pfpPreviewImg.style.display = 'none';
            pfpPlaceholder.style.display = 'block';
        }
    }

    // Modal Reset on close
    if (closePersonnelModal) {
        closePersonnelModal.addEventListener('click', () => {
            manualPfpUrl = '';
            updatePfpPreview('');
        });
    }

    // Load members from server (visible to ALL visitors)
    (async () => {
        try {
            const res = await fetch(`${BOT_SERVER}/members`);
            allMembers = await res.json();
            allMembers.forEach((m, i) => renderMember(m, i));
        } catch(e) {
            // Server offline fallback: load from localStorage
            allMembers = JSON.parse(localStorage.getItem('unga_personnel') || '[]');
            allMembers.forEach((m, i) => renderMember(m, i));
        }
    })();
});


