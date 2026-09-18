/* =========================================================
   SIMMA. — Scripts del sitio
   - EmailJS para envío del formulario de contacto
   - Validación cliente
   - Reveal on scroll
   - Nav con cambio en scroll
   ========================================================= */

/* -----------------------------------------------------------
   ⚠️  CONFIGURACIÓN EMAILJS — REEMPLAZÁ ESTOS 3 VALORES
   -----------------------------------------------------------
   Pasos:
   1) Crear cuenta gratuita en https://www.emailjs.com
   2) Add Email Service → conectar Gmail/Outlook → copiar SERVICE_ID
   3) Email Templates → crear plantilla → copiar TEMPLATE_ID
      En la plantilla podés usar las variables del form:
        {{from_name}}  {{reply_to}}  {{organization}}
        {{service}}    {{message}}
   4) Account → API Keys → copiar Public Key

   Luego pegá los valores acá abajo:
   ----------------------------------------------------------- */
const EMAILJS_CONFIG = {
  PUBLIC_KEY:  "nUvwnLv3NJnDRE8ef",   // 👈 reemplazar
  SERVICE_ID:  "service_wzuv3ny",   // 👈 reemplazar
  TEMPLATE_ID: "template_j87j74l",  // 👈 reemplazar
};

/* ---------- Inicialización EmailJS ---------- */
(function initEmailJS() {
  if (typeof emailjs === "undefined") {
    console.warn("[SIMMA] EmailJS SDK no cargó.");
    return;
  }
  emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
})();

/* ---------- Año dinámico en footer ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Nav con efecto al hacer scroll ---------- */
const nav = document.getElementById("nav");
let lastY = 0;
const handleNavScroll = () => {
  const y = window.scrollY;
  if (y > 30) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
  lastY = y;
};
window.addEventListener("scroll", handleNavScroll, { passive: true });
handleNavScroll();

/* ---------- Reveal on scroll (IntersectionObserver) ---------- */
const revealEls = document.querySelectorAll(
  ".intro__title, .intro__col--text, .service, .custom-cta, .direction__media, .direction__text, .contact-card, .form-wrap"
);
revealEls.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);
revealEls.forEach((el) => io.observe(el));

/* ---------- Smooth scroll con offset por nav fijo ---------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    // Cerrar menú mobile si estaba abierto
    closeMobileMenu();
    const navH = nav.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ---------- Menú mobile ---------- */
const navToggle = document.getElementById("nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.hidden = false;
  // Forzar reflow antes de la animación
  requestAnimationFrame(() => {
    mobileMenu.dataset.open = "true";
  });
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Cerrar menú de navegación");
  document.body.classList.add("menu-open");
}

function closeMobileMenu() {
  if (!mobileMenu || mobileMenu.hidden) return;
  mobileMenu.dataset.open = "false";
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú de navegación");
  document.body.classList.remove("menu-open");
  // Esperar que termine la animación antes de ocultarlo del flujo
  setTimeout(() => {
    if (navToggle.getAttribute("aria-expanded") === "false") {
      mobileMenu.hidden = true;
    }
  }, 300);
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  });
}

// Cerrar con tecla Escape (accesibilidad)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navToggle?.getAttribute("aria-expanded") === "true") {
    closeMobileMenu();
    navToggle.focus();
  }
});

// Cerrar al cambiar a desktop
window.addEventListener("resize", () => {
  if (window.innerWidth > 820 && navToggle?.getAttribute("aria-expanded") === "true") {
    closeMobileMenu();
  }
});

/* ---------- Acordeón de servicios ---------- */
const servicesList = document.querySelector(".services__list");
if (servicesList) {
  const services = Array.from(servicesList.querySelectorAll(".service"));

  services.forEach((service, i) => {
    const head = service.querySelector(".service__head");
    const panel = service.querySelector(".service__panel");
    if (!head || !panel) return;

    // Estado inicial: solo el primero abierto
    const startClosed = i !== 0;
    service.classList.toggle("is-closed", startClosed);
    if (!panel.id) panel.id = "service-panel-" + (i + 1);
    head.setAttribute("aria-expanded", String(!startClosed));
    head.setAttribute("aria-controls", panel.id);

    head.addEventListener("click", () => {
      const willOpen = service.classList.contains("is-closed");
      // Cerrar los demás (comportamiento acordeón: uno a la vez)
      services.forEach((other) => {
        if (other !== service) {
          other.classList.add("is-closed");
          other.querySelector(".service__head")?.setAttribute("aria-expanded", "false");
        }
      });
      service.classList.toggle("is-closed", !willOpen);
      head.setAttribute("aria-expanded", String(willOpen));
    });
  });

  // Habilitar transiciones después del primer frame (evita el flash de colapso)
  requestAnimationFrame(() => servicesList.classList.add("services--ready"));
}

/* ---------- Pestañas de Planes ---------- */
const planTabs = document.querySelectorAll(".plans__tab");
const planPanels = document.querySelectorAll(".plans__panel");
planTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    planTabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    planPanels.forEach((panel) => {
      const show = panel.dataset.panel === target;
      panel.classList.toggle("is-active", show);
      panel.hidden = !show;
    });
  });
});

/* ---------- Formulario de contacto ---------- */
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = form?.querySelector(".form__submit");
const submitLabel = submitBtn?.querySelector(".form__submit-label");

function setStatus(msg, type) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.classList.remove("success", "error");
  if (type) statusEl.classList.add(type);
}

function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  if (field.required && !value) valid = false;
  if (field.type === "email" && value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) valid = false;
  }

  field.classList.toggle("invalid", !valid);
  return valid;
}

function validateForm() {
  const fields = form.querySelectorAll("input, textarea, select");
  let allValid = true;
  fields.forEach((f) => {
    if (!validateField(f)) allValid = false;
  });
  return allValid;
}

if (form) {
  // Validación en blur (mejor UX que en cada keystroke)
  form.querySelectorAll("input, textarea, select").forEach((f) => {
    f.addEventListener("blur", () => validateField(f));
    f.addEventListener("input", () => {
      if (f.classList.contains("invalid")) validateField(f);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus("Revisá los campos marcados antes de enviar.", "error");
      return;
    }

    // Verificar configuración
    if (
      EMAILJS_CONFIG.PUBLIC_KEY.startsWith("TU_") ||
      EMAILJS_CONFIG.SERVICE_ID.startsWith("TU_") ||
      EMAILJS_CONFIG.TEMPLATE_ID.startsWith("TU_")
    ) {
      setStatus(
        "EmailJS aún no está configurado. Completá las claves en script.js.",
        "error"
      );
      return;
    }

    submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = "Enviando…";
    setStatus("", null);

    try {
      await emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        form
      );
      setStatus(
        "¡Mensaje enviado! Te respondemos a la brevedad.",
        "success"
      );
      form.reset();
    } catch (err) {
      console.error("[SIMMA] Error al enviar:", err);
      setStatus(
        "Hubo un error al enviar. Probá de nuevo o escribinos por WhatsApp.",
        "error"
      );
    } finally {
      submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = "Enviar mensaje";
    }
  });
}
