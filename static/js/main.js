// main.js — students will add JavaScript here as features are built

// ------------------------------------------------------------------ //
// "See how it works" video modal                                      //
// ------------------------------------------------------------------ //

(function () {
    var trigger = document.getElementById('how-it-works-trigger');
    var modal = document.getElementById('video-modal');

    if (!trigger || !modal) return;

    var closeBtn = document.getElementById('video-modal-close');
    var iframe = document.getElementById('video-modal-iframe');
    var videoSrc = iframe.getAttribute('data-src');

    function openModal(event) {
        event.preventDefault();
        iframe.setAttribute('src', videoSrc + '?autoplay=1&rel=0');
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        iframe.setAttribute('src', ''); // stops playback — reloading a blank src halts the video
        document.body.style.overflow = '';
    }

    trigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    // Close when clicking the overlay itself, but not the modal box within it.
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
})();
