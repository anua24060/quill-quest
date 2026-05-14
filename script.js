window.addEventListener("DOMContentLoaded", function () {

    // ELEMENTS
    const editor = document.getElementById("editor");

    const startBtn =
        document.getElementById("startBtn");

    const sessionDuration =
        document.getElementById("sessionDuration");

    const dangerDelay =
        document.getElementById("dangerDelay");

    const ambientSelect =
        document.getElementById("ambientSelect");

    const timerDisplay =
        document.getElementById("timerDisplay");

    const wordCount =
        document.getElementById("wordCount");

    const sessionStatus =
        document.getElementById("sessionStatus");

    const quoteBox =
        document.getElementById("quoteBox");

    const alarmSound =
        document.getElementById("alarmSound");

    const ambientAudio =
        document.getElementById("ambientAudio");

    // VARIABLES
    let lastTypedTime = Date.now();

    let sessionTimer = null;

    let dangerChecker = null;

    let deletionInterval = null;

    let remainingSeconds = 0;

    let sessionCompleted = false;

    let sessionStarted = false;

    let alarmPlaying = false;

    let lastQuoteCheckpoint = 0;

    // LOCK EDITOR INITIALLY
    editor.contentEditable = false;

    editor.innerHTML =
        "<p style='color:#999;'>Click Start Session to begin writing...</p>";

    // QUOTES
    const quotes = [

        "Amazing work. Keep going.",

        "Your story matters.",

        "Momentum creates magic.",

        "Keep writing. The world needs this.",

        "Every sentence builds your universe.",

        "You are in the flow now.",

        "Your imagination is powerful.",

        "This session is becoming legendary."

    ];

    // UPDATE WORD COUNT
    function updateWordCount() {

        const text =
            editor.innerText.trim();

        if (
            text === "" ||
            text === "Click Start Session to begin writing..."
        ) {

            wordCount.innerText = "0";

            return;
        }

        const words =
            text.split(/\s+/).length;

        wordCount.innerText = words;

        // QUOTES EVERY 50 WORDS
        if (
            words >= lastQuoteCheckpoint + 50
        ) {

            lastQuoteCheckpoint = words;

            const randomQuote =
                quotes[
                    Math.floor(
                        Math.random() * quotes.length
                    )
                ];

            quoteBox.innerText =
                `✨ ${randomQuote}`;

            // POP EFFECT
            quoteBox.classList.remove("quote-pop");

            void quoteBox.offsetWidth;

            quoteBox.classList.add("quote-pop");
        }
    }

    // CLEAR EDITOR
    function clearEditor() {

        editor.innerHTML = "";

        updateWordCount();
    }

    // DELETE LAST WORD
    function deleteLastWord() {

        let text =
            editor.innerText.trim();

        if (text === "") {
            return;
        }

        let words =
            text.split(/\s+/);

        words.pop();

        editor.innerText =
            words.join(" ");

        updateWordCount();
    }

    // PLAY ALARM
    function playAlarm() {

        if (alarmPlaying) {
            return;
        }

        alarmPlaying = true;

        alarmSound.currentTime = 0;

        alarmSound.loop = true;

        alarmSound.play();
    }

    // STOP ALARM
    function stopAlarm() {

        alarmSound.pause();

        alarmSound.currentTime = 0;

        alarmPlaying = false;
    }

    // START AMBIENT SOUND
    function startAmbientSound() {

        const selected =
            ambientSelect.value;

        ambientAudio.pause();

        ambientAudio.currentTime = 0;

        if (selected === "none") {
            return;
        }

        ambientAudio.src =
            `audio/${selected}.mp3`;

        ambientAudio.volume = 0.5;

        ambientAudio.play();
    }

    // TIMER DISPLAY
    function updateTimerDisplay() {

        const minutes =
            Math.floor(remainingSeconds / 60);

        const seconds =
            remainingSeconds % 60;

        timerDisplay.innerText =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    // COMPLETE SESSION
    function completeSession() {

        clearInterval(sessionTimer);

        clearInterval(dangerChecker);

        clearInterval(deletionInterval);

        sessionCompleted = true;

        sessionStarted = false;

        stopAlarm();

        ambientAudio.pause();

        editor.classList.remove("warning");

        editor.classList.remove("danger");

        editor.contentEditable = false;

        sessionStatus.innerText =
            "Completed";

        quoteBox.innerText =
            "🏆 Session complete! Your words survived.";

        alert(
            "Session complete! Your words are safe."
        );
    }

    // DELETE WORDS
    function startDeletingWords() {

        if (deletionInterval) {
            return;
        }

        deletionInterval = setInterval(function () {

            if (sessionCompleted) {

                clearInterval(deletionInterval);

                return;
            }

            const idleTime =
                Date.now() - lastTypedTime;

            const delay =
                parseInt(dangerDelay.value) * 1000;

            // USER RESUMED WRITING
            if (idleTime < delay) {

                clearInterval(deletionInterval);

                deletionInterval = null;

                stopAlarm();

                editor.classList.remove("danger");

                return;
            }

            deleteLastWord();

        }, 1000);
    }

    // DANGER MODE
    function startDangerChecker() {

        const delay =
            parseInt(dangerDelay.value) * 1000;

        dangerChecker = setInterval(function () {

            if (!sessionStarted) {
                return;
            }

            if (sessionCompleted) {
                return;
            }

            const idleTime =
                Date.now() - lastTypedTime;

            // WARNING
            if (
                idleTime > delay &&
                idleTime < delay + 3000
            ) {

                editor.classList.add("warning");
            }

            // DANGER
            if (idleTime > delay + 3000) {

                editor.classList.add("danger");

                playAlarm();

                startDeletingWords();
            }

        }, 1000);
    }

    // START SESSION
    function startSession() {

        clearInterval(sessionTimer);

        clearInterval(dangerChecker);

        clearInterval(deletionInterval);

        stopAlarm();

        clearEditor();

        sessionCompleted = false;

        sessionStarted = true;

        lastQuoteCheckpoint = 0;

        quoteBox.innerText =
            "✨ Your writing journey begins.";

        remainingSeconds =
            parseInt(sessionDuration.value) * 60;

        lastTypedTime = Date.now();

        sessionStatus.innerText =
            "Active";

        updateTimerDisplay();

        // UNLOCK EDITOR
        editor.contentEditable = true;

        editor.focus();

        // START AMBIENCE
        startAmbientSound();

        // TIMER
        sessionTimer = setInterval(function () {

            remainingSeconds--;

            updateTimerDisplay();

            if (remainingSeconds <= 0) {

                completeSession();
            }

        }, 1000);

        // START DANGER MODE
        startDangerChecker();
    }

    // USER TYPING
    editor.addEventListener("input", function () {

        if (!sessionStarted) {
            return;
        }

        stopAlarm();

        lastTypedTime = Date.now();

        editor.classList.remove("warning");

        editor.classList.remove("danger");

        clearInterval(deletionInterval);

        deletionInterval = null;

        updateWordCount();
    });

    // SWITCH AMBIENCE
    ambientSelect.addEventListener("change", function () {

        if (sessionStarted) {

            startAmbientSound();
        }
    });

    // START BUTTON
    startBtn.addEventListener("click", function () {

        startSession();
    });

});