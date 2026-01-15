
// ====== CONFIGURACIÓN ======
// Fecha/hora exacta (ajusta la hora real si difiere). Viernes 1 mayo 2026, 5:00pm (hora local)
const WEDDING_ISO = "2026-05-01T17:00:00";

// Maps del Club Campestre Pinula (ajusta con tu link real)
const MAPS_URL = "https://maps.app.goo.gl/pm6p61FHQidm5iiN7"; 
const MAP_EMBED_SRC = "https://maps.google.com/maps?q=Club+Campestre+Pinula&z=15&output=embed";

// Endpoint Google Apps Script o Google Forms:
const RSVP_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXX/exec";

const EVENT_TITLE = "Boda — Ana & José";
const EVENT_LOCATION = "Hacienda Nueva Country Club San José Pinula, Guatemala";
const EVENT_DESCRIPTION = "¡Te esperamos para celebrar con nosotros!";
// ===========================

// Crossfade del HERO (cada 6s)
const heroImgs = document.querySelectorAll('.hero .bg');
let heroIdx = 0;
if (heroImgs.length > 1) {
  setInterval(() => {
    heroImgs[heroIdx].classList.remove('active');
    heroIdx = (heroIdx + 1) % heroImgs.length;
    heroImgs[heroIdx].classList.add('active');
  }, 6000);
}

// Cuenta regresiva
const target = new Date(WEDDING_ISO).getTime();
const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMins = document.getElementById("cd-mins");
const cdSecs = document.getElementById("cd-secs");
function updateCountdown(){
  const now = Date.now();
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / (1000*60*60*24)); diff -= d*24*60*60*1000;
  const h = Math.floor(diff / (1000*60*60));     diff -= h*60*60*1000;
  const m = Math.floor(diff / (1000*60));        diff -= m*60*1000;
  const s = Math.floor(diff / 1000);
  cdDays.textContent  = String(d);
  cdHours.textContent = String(h).padStart(2,'0');
  cdMins.textContent  = String(m).padStart(2,'0');
  cdSecs.textContent  = String(s).padStart(2,'0');
}
updateCountdown(); setInterval(updateCountdown, 1000);

// Animaciones al hacer scroll
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries,obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, {threshold:.18, rootMargin:"0px 0px -10% 0px"});
  document.querySelectorAll('[data-animate]').forEach(el=> observer.observe(el));
} else {
  document.querySelectorAll('[data-animate]').forEach(el=> el.classList.add('in-view'));
}

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
document.querySelectorAll('[data-lightbox]').forEach(a=>{
  a.addEventListener('click', (ev)=>{
    ev.preventDefault();
    lbImg.src = a.href;
    lb.showModal();
  });
});
lb.addEventListener('click', ()=> lb.close());

// Mapa
document.getElementById('mapLink').href = MAPS_URL;
document.getElementById('mapEmbed').src = MAP_EMBED_SRC;

// Agregar al calendario (.ics)
document.getElementById('addToCalendarBtn').addEventListener('click', ()=>{
  const start = new Date(WEDDING_ISO);
  const end   = new Date(start.getTime() + 6*60*60*1000);
  const toICS = (d)=> d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wedding//RSVP//ES","BEGIN:VEVENT",
    `DTSTAMP:${toICS(new Date())}`,
    `DTSTART:${toICS(start)}`,
    `DTEND:${toICS(end)}`,
    `SUMMARY:${EVENT_TITLE}`,
    `LOCATION:${EVENT_LOCATION}`,
    `DESCRIPTION:${EVENT_DESCRIPTION}`,
    "END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([ics], {type: "text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = "boda.ics"; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
});

// Envío RSVP
const form = document.getElementById('rsvpForm');
const status = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  status.textContent = "";
  if(!form.checkValidity()){
    status.textContent = "Por favor completa los campos obligatorios.";
    form.reportValidity();
    return;
  }
  submitBtn.disabled = true; submitBtn.textContent = "Enviando…";

  const data = new URLSearchParams({
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    invitados: form.invitados.value,
    comentario: form.comentario.value.trim(),
    confirmacion: form.confirmacion.value
  });

  try{
    const res = await fetch(RSVP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: data.toString(),
      mode: "cors"
    });
    if(res.ok){
      status.textContent = "¡Gracias! Tu confirmación fue recibida.";
      form.reset();
    }else{
      status.textContent = "Hubo un problema al enviar. Intenta nuevamente.";
    }
  }catch(err){
    console.error(err);
    status.textContent = "No se pudo conectar. Revisa tu internet o el endpoint.";
  }finally{
    submitBtn.disabled = false; submitBtn.textContent = "Enviar confirmación";
  }
});

function copyToClipboard() {
const accountNumber = document.getElementById("account-number").textContent;
navigator.clipboard.writeText(accountNumber).then(function() {
  alert("Número de cuenta copiado: " + accountNumber);
}, function(err) {
  alert("Error al copiar el número de cuenta: " + err);
});
}
// Botón volver arriba
const scrollTopBtn = document.getElementById('scrollToTop');

// Mostrar/ocultar botón según scroll
window.addEventListener('scroll', () => {
if (window.pageYOffset > 300) {
scrollTopBtn.classList.add('visible');
} else {
scrollTopBtn.classList.remove('visible');
}
});

// Scroll al inicio al hacer clic
scrollTopBtn.addEventListener('click', () => {
window.scrollTo({
top: 0,
behavior: 'smooth'
});
});

// Manejo del formulario RSVP mejorado
const confirmacionRadios = document.querySelectorAll('input[name="confirmacion"]');
const guestCountGroup = document.getElementById('guestCountGroup');
const commentGroup = document.getElementById('commentGroup');
const invitadosInput = document.getElementById('invitados');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');

// Mostrar/ocultar campos según respuesta
confirmacionRadios.forEach(radio => {
radio.addEventListener('change', (e) => {
if (e.target.value === 'Sí') {
  guestCountGroup.style.display = 'block';
  commentGroup.style.display = 'block';
  invitadosInput.required = true;
} else {
  guestCountGroup.style.display = 'none';
  commentGroup.style.display = 'none';
  invitadosInput.required = false;
}
});
});

// Botones de incremento/decremento
decreaseBtn.addEventListener('click', () => {
const current = parseInt(invitadosInput.value);
if (current > 1) {
invitadosInput.value = current - 1;
}
});

increaseBtn.addEventListener('click', () => {
const current = parseInt(invitadosInput.value);
if (current < 10) {
invitadosInput.value = current + 1;
}
});