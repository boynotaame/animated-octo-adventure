document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // NEW AUDIO FADE HELPER FUNCTIONS
    // ==========================================
    function fadeAudioIn(audio, duration = 1500, maxVolume= 0.4) {
        clearInterval(audio.fadeInterval); // Stop any existing fades
        audio.volume = 0; // Start at 0 volume
        audio.play().catch(err => console.log("Audio play prevented:", err));
        
        let step = 50; 
        let increment = 1 / (duration / step);
        
        audio.fadeInterval = setInterval(() => {
            if (audio.volume < 1 - increment) {
                audio.volume += increment;
            } else {
                audio.volume = maxVolume; // Cap at max volume
                clearInterval(audio.fadeInterval);
            }
        }, step);
    }

    function fadeAudioOut(audio, duration = 1000) {
        clearInterval(audio.fadeInterval);
        let step = 50;
        // Avoid dividing by zero if volume is already 0
        if (audio.volume === 0) {
            audio.pause();
            audio.currentTime = 0;
            return;
        }
        
        let decrement = audio.volume / (duration / step);
        
        audio.fadeInterval = setInterval(() => {
            if (audio.volume > decrement) {
                audio.volume -= decrement;
            } else {
                audio.volume = 0; // Hit 0 volume
                clearInterval(audio.fadeInterval);
                audio.pause(); // Physically pause the track
                audio.currentTime = 0; // Rewind to the start for next time
            }
        }, step);
    }

    const audioRock = document.getElementById('audio-rock');

    // ==========================================
    // 1. APPLE INTRO LOGIC
    // ==========================================
    fadeAudioIn(audioRock, 2000, 0.5);

    setTimeout(() => document.getElementById('text-sound').classList.add('visible'), 200); 

    setTimeout(() => document.getElementById('text1').classList.add('visible'), 500);
    setTimeout(() => document.getElementById('text2').classList.add('visible'), 3000);
    setTimeout(() => document.getElementById('text3').classList.add('visible'), 5000);
    setTimeout(() => document.getElementById('text4').classList.add('visible'), 6500);

    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        const gameScreen = document.getElementById('game-screen');
        gameScreen.style.display = 'flex';
        setTimeout(() => gameScreen.style.opacity = '1', 50);
    }, 9000); 

    // ==========================================
    // 2. TRUE 3D INTERACTIVE PULL LEVER LOGIC
    // ==========================================
    const lever = document.getElementById('lever');
    const leverKnob = document.querySelector('.lever-knob');
    let isDragging = false;
    let startY = 0;
    let currentRotation = 0;
    let canSpin = true;
    let spinCount = 0;

    const startDrag = (y) => {
      if (audioRock.paused || audioRock.volume === 0) fadeAudioIn(audioRock, 500, 0.5);

      if (!canSpin) return;
      isDragging = true;
      startY = y;
      lever.style.transition = 'none'; 
      leverKnob.style.transition = 'none'; 
    };

    const drag = (y) => {
        if (!isDragging) return;
        const deltaY = y - startY;
        if (deltaY > 0) {
            currentRotation = Math.min(110, deltaY * 0.7); 
            lever.style.transform = `translateZ(15px) rotateX(${-currentRotation}deg)`;
            const shadowOffset = 15 + (currentRotation * 0.3);
            const shadowBlur = 15 + (currentRotation * 0.15);
            leverKnob.style.boxShadow = `-5px ${shadowOffset}px ${shadowBlur}px rgba(0,0,0,0.8), inset 0 0 6px rgba(28,107,122,0.8)`;
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        
        lever.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        leverKnob.style.transition = 'box-shadow 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        lever.style.transform = `translateZ(15px) rotateX(0deg)`; 
        leverKnob.style.boxShadow = `-5px 15px 15px rgba(0,0,0,0.8), inset 0 0 6px rgba(28,107,122,0.8)`;

        if (currentRotation > 60 && canSpin) {
            spinMachine();
        }
        currentRotation = 0;
    };

    lever.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.clientY); });
    window.addEventListener('mousemove', (e) => drag(e.clientY));
    window.addEventListener('mouseup', endDrag);

    lever.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0].clientY); }, {passive: false});
    window.addEventListener('touchmove', (e) => drag(e.touches[0].clientY), {passive: false});
    window.addEventListener('touchend', endDrag);


    // ==========================================
    // 3. DRAMATIC SLOT MACHINE LOGIC
    // ==========================================
    const slotsText =[document.getElementById('s1-txt'), document.getElementById('s2-txt'), document.getElementById('s3-txt')];
    const slotsImg =[document.getElementById('s1-img'), document.getElementById('s2-img'), document.getElementById('s3-img')];
    const spinsLeftText = document.getElementById('spins-left');
    const cabinet = document.querySelector('.hsr-cabinet');

    const audioKnee = document.getElementById('audio-knee');
    const audioWonder = document.getElementById('audio-wonder');

    const spinImages =['meowl.png', 'kanye.png', 'stickman-item.png'];

    function spinMachine() {
        if (spinCount >= 3) return; 
        spinCount++;
        canSpin = false;
        
        // Safety check to ensure all audio is completely stopped when spinning
        clearInterval(audioKnee.fadeInterval);
        clearInterval(audioWonder.fadeInterval);
        audioKnee.pause(); audioKnee.currentTime = 0;
        audioWonder.pause(); audioWonder.currentTime = 0;

        slotsText.forEach(txt => txt.style.display = 'none');
        slotsImg.forEach(img => {
            img.style.display = 'block';
            img.classList.add('dramatic-spin'); 
        });
        cabinet.classList.add('machine-shake'); 

        let spins = 0;
        let interval = setInterval(() => {
            slotsImg.forEach(img => {
                img.src = spinImages[Math.floor(Math.random() * spinImages.length)];
            });
            spins++;

            if (spins > 15) { 
                clearInterval(interval);
                cabinet.classList.remove('machine-shake');
                slotsImg.forEach(img => img.classList.remove('dramatic-spin'));
                lockResults();
            }
        }, 100);
    }

    function lockResults() {
        let imgSrc = '';
        if (spinCount === 1) imgSrc = 'meowl.png'; 
        if (spinCount === 2) imgSrc = 'kanye.png';
        if (spinCount === 3) imgSrc = 'stickman-item.png';

        slotsImg.forEach(img => { img.src = imgSrc; });
        spinsLeftText.innerText = `SPINS LEFT: ${3 - spinCount}`;

        setTimeout(() => { doDropAndTransition(imgSrc); }, 1000);
    }

    // ==========================================
    // 4. THE DROP & EXPAND TRANSITION
    // ==========================================
    function doDropAndTransition(imgSrc) {
      fadeAudioOut(audioRock, 800);
      
        const transItem = document.getElementById('transition-item');
        transItem.src = imgSrc;
        transItem.style.display = 'block';
        transItem.classList.remove('drop-anim', 'expand-anim');
        void transItem.offsetWidth; 
        
        transItem.classList.add('drop-anim');
        
        setTimeout(() => {
            transItem.classList.remove('drop-anim');
            transItem.classList.add('expand-anim');
            
            setTimeout(() => {
                document.getElementById('game-screen').style.opacity = '0';
                
                setTimeout(() => {
                    document.getElementById('game-screen').style.display = 'none';
                    transItem.style.display = 'none'; 
                    showResultPage(imgSrc);
                }, 500); 
            }, 300); 
        }, 600); 
    }

    // ==========================================
    // 5. RESULT PAGES
    // ==========================================
    function showResultPage(imgSrc) {
        const resultPage = document.getElementById('result-page');
        const resultContent = document.getElementById('result-content');
        const returnBtn = document.getElementById('return-btn');
        
        resultPage.style.display = 'flex';
        
        const spinsLeftStr = `<div class="spins-badge">Spins remaining: ${3 - spinCount}</div>`;

        let songName = "";
        if (spinCount === 1) songName = "hows ur knee";
        else if (spinCount === 2) songName = "I wonder by kanye";
        else if (spinCount === 3) songName = "I thought i saw ur face today";
        
        const playingHTML = `<div class="now-playing">Now playing: ${songName}</div>`;

        // ======================= SPIN 1 =======================
        if (spinCount === 1) {
            // SMOOTH FADE IN OVER 1.5 SECONDS!
            fadeAudioIn(audioKnee, 1500); 
            
            resultPage.style.backgroundImage = "url('meowl-bg.png')";
            resultPage.style.backgroundSize = "cover";
            resultPage.style.backgroundPosition = "center";

            resultContent.innerHTML = `
                ${spinsLeftStr}
                ${playingHTML}
                <div class="meme-layout">
                    <div class="meme-image-container">
                        <img src="meowl.png" class="bouncing-meowl" alt="Meowl">
                    </div>
                    <div class="meme-text-container">
                        <div class="meme-text">meowl wishes you a<br>happy birthday</div>
                        <div class="meme-text">you are meowl's<br>favorite human<br>
                        <div class="meme-text">hows ur knee</div>
                    </div>
                </div>
            `;
            returnBtn.style.display = 'block';
            returnBtn.innerText = 'Next Spin';
        } 
        
        // ======================= SPIN 2 =======================
        else if (spinCount === 2) {
            // SMOOTH FADE IN OVER 1.5 SECONDS!
            fadeAudioIn(audioWonder, 1500);
            
            resultPage.style.backgroundImage = "url('kanye-bg.png')";
            resultPage.style.backgroundSize = "cover";
            resultPage.style.backgroundPosition = "center";

            resultContent.innerHTML = `
                ${spinsLeftStr}
                ${playingHTML}
                
                <!-- Added the 'kanye-float' class right here! -->
                <img src="kanye.png" class="kanye-float" style="width: 250px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 15px 30px rgba(0,0,0,0.8);">
                
                <div class="result-text" style="font-size: 1.5rem; text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 5px 15px rgba(0,0,0,0.8);">
                    you're goated like kanye<br><br>
                    don't ever doubt urself<br><br>
                    may you have a happy birthday
                </div>
            `;
            returnBtn.style.display = 'block';
            returnBtn.innerText = 'Final Spin';
        }
        
        // ======================= SPIN 3 =======================
        // ======================= SPIN 3 =======================
        else if (spinCount === 3) {
            
            const audioStickman = document.getElementById('audio-stickman');
            if (audioStickman) fadeAudioIn(audioStickman, 1500);

            // PERFECT CSS RECREATION OF YOUR MESH GRADIENT IMAGE
            resultPage.style.background = `
                radial-gradient(circle at 0% 0%, #4aff60 0%, transparent 45%),
                radial-gradient(circle at 100% 0%, #00d2ff 0%, transparent 50%),
                radial-gradient(circle at 0% 50%, #ffaa00 0%, transparent 50%),
                radial-gradient(circle at 0% 100%, #ff0055 0%, transparent 55%),
                radial-gradient(circle at 100% 100%, #8a2be2 0%, transparent 55%),
                #ff7b00
            `;

            resultContent.innerHTML = `
                ${playingHTML}
                
                <div class="stickman-party-layout">
                    <!-- Left dancing stickmen -->
                    <img src="stickman.png" class="stickman-cluster stickman-left" alt="dancing stickmen">
                    
                    <div class="twin-text-container">
                        <div class="twin-line">happy birthday twin</div>
                        <div class="twin-line">sorry if its not ur<br>birthday</div>
                        <div class="twin-line" style="margin-bottom: 0;">still happy birthday twin</div>
                    </div>
                    
                    <!-- Right dancing stickmen -->
                    <img src="stickman.png" class="stickman-cluster stickman-right" alt="dancing stickmen">
                </div>
                
                
                <div id="2nd-msg" class="close-website-msg">i remembered to send you this reel</div>
                <div id="close-msg" class="close-website-msg">you can close the website now lol</div>
            `;
            returnBtn.style.display = 'none'; 

            setTimeout(() => {
                const closeMsg = document.getElementById('2nd-msg');
                if (closeMsg) closeMsg.style.opacity = '1';
            }, 2300);
            
            setTimeout(() => {
                const closeMsg = document.getElementById('close-msg');
                if (closeMsg) closeMsg.style.opacity = '1';
            }, 3500);
        }
        
        setTimeout(() => resultPage.style.opacity = '1', 50);
    }

    // ==========================================
    // 6. RETURN TO MACHINE LOGIC
    // ==========================================
    window.returnToMachine = function() {
        const resultPage = document.getElementById('result-page');
        resultPage.style.opacity = '0'; 
        
        // SMOOTH FADE OUT CURRENT MEME MUSIC OVER 1 SECOND
        if (!audioKnee.paused) fadeAudioOut(audioKnee, 1000);
        if (!audioWonder.paused) fadeAudioOut(audioWonder, 1000);

        // FADE THE ROCK MUSIC BACK IN FOR THE NEXT SPIN!
        fadeAudioIn(audioRock, 1500, 0.5);

        setTimeout(() => {
            resultPage.style.display = 'none';
            resultPage.style.background = '';
            resultPage.style.backgroundImage = 'none'; 
            
            const gameScreen = document.getElementById('game-screen');
            gameScreen.style.display = 'flex';
            
            slotsImg.forEach(img => img.style.display = 'none');
            slotsText.forEach(txt => {
                txt.style.display = 'inline';
                txt.innerText = '❓';
            });
            
            canSpin = true; 
            setTimeout(() => gameScreen.style.opacity = '1', 50);
        }, 1000); 
    }
});
