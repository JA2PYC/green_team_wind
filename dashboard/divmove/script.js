const sessions = document.querySelectorAll('.session');
let currentSession = 0;

document.getElementById('prev').addEventListener('click', () => {
    if (currentSession > 0) {
        toggleSession(currentSession, currentSession - 1);
        currentSession--;
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (currentSession < sessions.length - 1) {
        toggleSession(currentSession, currentSession + 1);
        currentSession++;
    }
});

function toggleSession(from, to) {
    sessions[from].classList.remove('active');
    sessions[to].classList.add('active');
}
