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
    // 6. Administrative Tools (Integrated with GitHub DB)
    const staffAccessLink = document.getElementById('staff-access-link');
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authPass = document.getElementById('auth-pass');
    const ghTokenInput = document.getElementById('gh-token'); // Added in HTML
    const authError = document.getElementById('auth-error');
    const closeAuth = document.getElementById('close-auth');
    
    const addMemberBtn = document.getElementById('add-member-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const personnelModal = document.getElementById('personnel-modal');
    const closePersonnelModal = document.getElementById('close-personnel-modal');
    const addPersonnelForm = document.getElementById('add-personnel-form');
    const teamGrid = document.getElementById('team-grid');

    const ADMIN_PASS = "190472";
    const GITHUB_REPO = "shahcaf/United-Nations-Global-Assembly";
    const DATA_PATH = "members.json";

    function updateAdminUI(isActive) {
        if (addMemberBtn) addMemberBtn.style.display = isActive ? 'block' : 'none';
        if (logoutBtn) logoutBtn.style.display = isActive ? 'block' : 'none';
    }

    // Check session
    if (sessionStorage.getItem('unga_admin_active') === 'true') {
        updateAdminUI(true);
    }

    // Auth Modal Controls
    if (staffAccessLink) staffAccessLink.addEventListener('click', (e) => (e.preventDefault(), authModal.style.display = 'flex'));
    if (closeAuth) closeAuth.addEventListener('click', () => (authModal.style.display = 'none'));

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (authPass.value === ADMIN_PASS) {
                sessionStorage.setItem('unga_admin_active', 'true');
                if (ghTokenInput.value) {
                    sessionStorage.setItem('unga_gh_token', ghTokenInput.value.trim());
                }
                authModal.style.display = 'none';
                updateAdminUI(true);
                authPass.value = '';
                window.location.reload();
            } else {
                authError.textContent = "Invalid Authorization Code";
                setTimeout(() => authError.textContent = "", 2000);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('unga_admin_active');
            sessionStorage.removeItem('unga_gh_token');
            window.location.reload();
        });
    }

    let editingIndex = -1;
    let ghFileSha = null; // Important for updating existing files

    // Personnel Modal Controls
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            editingIndex = -1;
            addPersonnelForm.reset();
            personnelModal.querySelector('h3').textContent = "Add Assembly Personnel";
            personnelModal.style.display = 'flex';
        });
    }

    if (closePersonnelModal) closePersonnelModal.addEventListener('click', () => (personnelModal.style.display = 'none'));

    let manualPfpUrl = '';
    let allMembers = [];

    // --- GitHub Persistence Core ---
    async function commitToGitHub(updatedMembers) {
        // Always save locally so the preview stays updated even without a token
        localStorage.setItem('unga_personnel', JSON.stringify(updatedMembers));
        
        const token = sessionStorage.getItem('unga_gh_token');
        if (!token) {
            alert("Changes saved locally! To make them global for all visitors, please provide your GitHub Token in the login menu.");
            return true; 
        }

        try {
            // 1. Get current SHA every time to prevent "Stale Data" errors
            const headRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!headRes.ok) {
                const errData = await headRes.json();
                throw new Error(`Auth Error: ${errData.message || 'Check your token permissions'}`);
            }

            const headData = await headRes.json();
            ghFileSha = headData.sha;

            // 2. Commit update
            const commitRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Personnel update via UNGA website`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(updatedMembers, null, 2)))),
                    sha: ghFileSha
                })
            });

            if (!commitRes.ok) {
                const errData = await commitRes.json();
                throw new Error(`Sync Error: ${errData.message}`);
            }
            
            const commitData = await commitRes.json();
            ghFileSha = commitData.content.sha;
            alert("Global Personnel Update Successful! Changes are live.");
            return true;
        } catch (err) {
            console.error(err);
            alert(`Sync Failed: ${err.message}\n\nMake sure your token has "Contents: Read & Write" permissions for this repo.`);
            return false;
        }
    }

    if (addPersonnelForm) {
        addPersonnelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const discId = document.getElementById('new-id').value.trim();
            let pfpUrl = manualPfpUrl;

            // Fetch avatar from reliable proxy (Lanyard fallback)
            if (!pfpUrl) {
                try {
                    const res = await fetch(`https://api.lanyard.rest/v1/users/${discId}`);
                    const data = await res.json();
                    if (data.success && data.data.discord_user.avatar) {
                        pfpUrl = `https://cdn.discordapp.com/avatars/${discId}/${data.data.discord_user.avatar}.png?size=512`;
                    }
                } catch(e) {}
            }

            if (!pfpUrl) pfpUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(document.getElementById('new-name').value)}&background=004b87&color=d4af37&size=512`;

            const memberData = {
                id: discId,
                name: document.getElementById('new-name').value,
                role: document.getElementById('new-role').value,
                pfp: pfpUrl,
                desc: 'Official UNGA Personnel'
            };

            if (editingIndex > -1) allMembers[editingIndex] = memberData;
            else allMembers.push(memberData);

            if (await commitToGitHub(allMembers)) window.location.reload();
        });
    }

    function renderMember(member, index) {
        if (!teamGrid) return;
        const isAdmin = sessionStorage.getItem('unga_admin_active') === 'true';
        const card = document.createElement('div');
        card.className = 'team-card reveal active';
        card.style.position = 'relative';
        
        const adminControls = isAdmin ? `
            <div style="position: absolute; top: 15px; right: 15px; display: flex; gap: 8px; z-index: 10;">
                <button onclick="editPersonnel(${index})" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: var(--accent-gold); padding: 5px 8px; border-radius: 5px; cursor: pointer;"><i class="fas fa-edit"></i></button>
                <button onclick="removePersonnel(${index})" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: #ff4d4d; padding: 5px 8px; border-radius: 5px; cursor: pointer;"><i class="fas fa-trash"></i></button>
            </div>
        ` : '';

        // Default PFP if the saved one is stale/broken
        const defaultPfp = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=004b87&color=d4af37&size=512`;

        card.innerHTML = `
            ${adminControls}
            <div class="member-avatar" style="background: none; overflow: hidden; border: 2px solid var(--accent-gold);">
                <img id="pfp-${member.id}" src="${member.pfp}" alt="${member.name} PFP" 
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=004b87&color=d4af37&size=512'" 
                     style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span class="member-role">${member.role}</span>
            <h3 class="member-name">${member.name}</h3>
            <p style="color: var(--text-gray); margin-bottom: 25px;">${member.desc}</p>
            <a href="https://discord.com/users/${member.id}" target="_blank" class="dm-button">
                <i class="fab fa-discord"></i> Send MD
            </a>
        `;
        teamGrid.appendChild(card);

        // --- Auto-Refresh Expired PFPs ---
        // Fetch fresh avatar from Lanyard in background every load
        (async () => {
             try {
                const res = await fetch(`https://api.lanyard.rest/v1/users/${member.id}`);
                const data = await res.json();
                if (data.success && data.data.discord_user.avatar) {
                    const freshUrl = `https://cdn.discordapp.com/avatars/${member.id}/${data.data.discord_user.avatar}.png?size=512`;
                    const imgEl = document.getElementById(`pfp-${member.id}`);
                    if (imgEl && imgEl.src !== freshUrl) imgEl.src = freshUrl;
                }
             } catch(e) {}
        })();
    }

    window.removePersonnel = async (index) => {
        if (confirm('Are you sure you want to remove this official?')) {
            allMembers.splice(index, 1);
            if (await commitToGitHub(allMembers)) window.location.reload();
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

    const pfpPreviewContainer = document.getElementById('pfp-preview-container');
    if (pfpPreviewContainer) {
        pfpPreviewContainer.addEventListener('click', () => {
            const url = prompt("Paste PFP URL override:", manualPfpUrl);
            if (url !== null) { manualPfpUrl = url; updatePfpPreview(url); }
        });
    }

    function updatePfpPreview(url) {
        const pfpPreviewImg = document.getElementById('pfp-preview-img');
        const pfpPlaceholder = document.getElementById('pfp-placeholder-icon');
        if (url && url.length > 5) {
            pfpPreviewImg.src = url; pfpPreviewImg.style.display = 'block'; pfpPlaceholder.style.display = 'none';
        } else {
            pfpPreviewImg.style.display = 'none'; pfpPlaceholder.style.display = 'block';
        }
    }

    if (closePersonnelModal) closePersonnelModal.addEventListener('click', () => updatePfpPreview(''));

    // --- Load members from GitHub (Global) ---
    (async () => {
        const hasToken = !!sessionStorage.getItem('unga_gh_token');
        const localData = JSON.parse(localStorage.getItem('unga_personnel'));

        try {
            // 1. Fetch from GitHub Repo directly (Cache Buster to ensure fresh data)
            const timestamp = new Date().getTime();
            const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/${DATA_PATH}?t=${timestamp}`);
            
            if (res.ok) {
                const cloudMembers = await res.json();
                allMembers = cloudMembers; // Always prioritize the global database
                
                // Sync local backup so the user's browser updates its "memory"
                localStorage.setItem('unga_personnel', JSON.stringify(allMembers));
            } else {
                throw new Error("Repo file missing");
            }
        } catch(e) {
            console.warn("Global load failed, using local backup.");
            allMembers = localData || [];
        }
        
        // Ensure team grid is clear before rendering
        if (teamGrid) teamGrid.innerHTML = '';
        allMembers.forEach((m, i) => renderMember(m, i));
    })();
});


