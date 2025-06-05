setTimeout(() => {
  document.getElementById('mensaje1').classList.add('visible');
}, 100);

setTimeout(() => {
  document.getElementById('mensaje2').classList.add('visible');
}, 4000);

setTimeout(() => {
  document.getElementById('mensaje3').classList.add('visible');
  spinner.style.display = 'none';
}, 5000);