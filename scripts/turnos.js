/* Calendario y reserva de turnos publicos (index.html) */

const TURNOS_KEY = 'vetrincon-turnos-publicos';

/* Horarios de atencion por dia (0 = domingo ... 6 = sabado) */
const HORARIOS_ATENCION = {
  1: [['09:00', '12:00'], ['16:00', '19:00']],
  2: [['09:00', '12:00'], ['16:00', '19:00']],
  3: [['09:00', '12:00'], ['16:00', '19:00']],
  4: [['09:00', '12:00'], ['16:00', '19:00']],
  5: [['09:00', '12:00'], ['16:00', '19:00']],
  6: [['10:00', '13:00']],
};

const DURACION_TURNO_MIN = 30;

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_LARGO = [
  'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado',
];

function loadTurnosPublicos() {
  const raw = localStorage.getItem(TURNOS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveTurnosPublicos(list) {
  localStorage.setItem(TURNOS_KEY, JSON.stringify(list));
}

function pad2(n) { return String(n).padStart(2, '0'); }

function dateToStr(date) {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
}

function strToDate(str) {
  return new Date(str + 'T00:00:00');
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(mins) {
  return pad2(Math.floor(mins / 60)) + ':' + pad2(mins % 60);
}

function getSlotsForDate(dateStr) {
  const date = strToDate(dateStr);
  const dow = date.getDay();
  const rangos = HORARIOS_ATENCION[dow];
  if (!rangos) return [];

  let slots = [];
  rangos.forEach(function (rango) {
    let cursor = timeToMinutes(rango[0]);
    const fin = timeToMinutes(rango[1]);
    while (cursor + DURACION_TURNO_MIN <= fin) {
      slots.push(minutesToTime(cursor));
      cursor += DURACION_TURNO_MIN;
    }
  });

  const hoy = startOfDay(new Date());
  if (startOfDay(date).getTime() === hoy.getTime()) {
    const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
    slots = slots.filter(function (t) { return timeToMinutes(t) > ahoraMin; });
  }

  const ocupados = loadTurnosPublicos()
    .filter(function (t) { return t.fecha === dateStr; })
    .map(function (t) { return t.hora; });
  slots = slots.filter(function (t) { return ocupados.indexOf(t) === -1; });

  return slots;
}

(function initBooking() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const monthLabel = document.getElementById('cal-month-label');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const dateLabel = document.getElementById('booking-date-label');
  const slotsGrid = document.getElementById('slots-grid');
  const form = document.getElementById('booking-form');
  const slotsBlock = document.getElementById('booking-slots-block');
  const summary = document.getElementById('booking-summary');
  const successBlock = document.getElementById('booking-success');
  const successText = document.getElementById('booking-success-text');
  const cancelBtn = document.getElementById('booking-cancel');
  const newBtn = document.getElementById('booking-new');
  const paisInput = document.getElementById('b-pais');
  const numeroInput = document.getElementById('b-numero');

  numeroInput.addEventListener('input', function () {
    const digits = numeroInput.value.replace(/\D/g, '').slice(0, 10);
    const area = digits.slice(0, 2);
    const resto = digits.slice(2);
    const local = resto.length > 4 ? resto.slice(0, 4) + '-' + resto.slice(4) : resto;
    numeroInput.value = local ? area + ' ' + local : area;
  });

  const hoy = startOfDay(new Date());
  let mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let fechaSeleccionada = null;
  let horaSeleccionada = null;

  function esDiaAbierto(date) {
    return !!HORARIOS_ATENCION[date.getDay()];
  }

  function renderCalendar() {
    monthLabel.textContent = MESES[mesActual.getMonth()] + ' ' + mesActual.getFullYear();
    grid.innerHTML = '';

    const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const offset = (primerDiaMes.getDay() + 6) % 7; // lunes = 0
    const diasEnMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();

    for (let i = 0; i < offset; i++) {
      const filler = document.createElement('span');
      filler.className = 'cal-day filler';
      grid.appendChild(filler);
    }

    for (let d = 1; d <= diasEnMes; d++) {
      const date = new Date(mesActual.getFullYear(), mesActual.getMonth(), d);
      const dateStr = dateToStr(date);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = d;

      const esPasado = date.getTime() < hoy.getTime();
      const abierto = esDiaAbierto(date);

      if (esPasado || !abierto) {
        btn.classList.add(esPasado ? 'past' : 'closed');
        btn.disabled = true;
      } else {
        btn.classList.add('open');
        if (dateStr === fechaSeleccionada) btn.classList.add('selected');
        btn.addEventListener('click', function () { seleccionarFecha(dateStr); });
      }

      grid.appendChild(btn);
    }

    prevBtn.disabled = mesActual.getFullYear() === hoy.getFullYear() && mesActual.getMonth() === hoy.getMonth();
  }

  function seleccionarFecha(dateStr) {
    fechaSeleccionada = dateStr;
    horaSeleccionada = null;
    renderCalendar();
    renderSlots();
    resetFormView();
  }

  function renderSlots() {
    if (!fechaSeleccionada) {
      dateLabel.textContent = 'Elegí una fecha';
      slotsGrid.innerHTML = '<p class="slots-empty">Seleccioná un dia disponible en el calendario para ver los horarios.</p>';
      return;
    }

    const date = strToDate(fechaSeleccionada);
    dateLabel.textContent = 'Horarios para el ' + date.getDate() + ' de ' + MESES[date.getMonth()].toLowerCase();

    const slots = getSlotsForDate(fechaSeleccionada);
    slotsGrid.innerHTML = '';

    if (!slots.length) {
      slotsGrid.innerHTML = '<p class="slots-empty">No quedan horarios disponibles ese dia. Probá con otra fecha.</p>';
      return;
    }

    slots.forEach(function (t) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-btn';
      btn.textContent = t;
      if (t === horaSeleccionada) btn.classList.add('selected');
      btn.addEventListener('click', function () { seleccionarHora(t); });
      slotsGrid.appendChild(btn);
    });
  }

  function seleccionarHora(t) {
    horaSeleccionada = t;
    renderSlots();

    const date = strToDate(fechaSeleccionada);
    summary.textContent = DIAS_LARGO[date.getDay()].replace(/^./, function (c) { return c.toUpperCase(); }) +
      ' ' + date.getDate() + ' de ' + MESES[date.getMonth()] + ' de ' + date.getFullYear() + ' · ' + t + ' hs';

    slotsBlock.hidden = true;
    successBlock.hidden = true;
    form.hidden = false;
  }

  function resetFormView() {
    form.hidden = true;
    successBlock.hidden = true;
    slotsBlock.hidden = false;
    form.reset();
  }

  prevBtn.addEventListener('click', function () {
    mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1);
    renderCalendar();
  });
  nextBtn.addEventListener('click', function () {
    mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1);
    renderCalendar();
  });

  cancelBtn.addEventListener('click', function () {
    horaSeleccionada = null;
    resetFormView();
    renderSlots();
  });

  newBtn.addEventListener('click', function () {
    fechaSeleccionada = null;
    horaSeleccionada = null;
    renderCalendar();
    renderSlots();
    resetFormView();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!fechaSeleccionada || !horaSeleccionada) return;

    const telefono = paisInput.value + ' ' + numeroInput.value.trim();

    const turno = {
      id: 'turno-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
      nombre: document.getElementById('b-nombre').value.trim(),
      telefono: telefono,
      mascota: document.getElementById('b-mascota').value.trim(),
      motivo: document.getElementById('b-motivo').value,
      creadoEn: new Date().toISOString(),
    };

    const turnos = loadTurnosPublicos();
    turnos.push(turno);
    saveTurnosPublicos(turnos);

    const date = strToDate(fechaSeleccionada);
    successText.textContent = 'Te esperamos el ' + date.getDate() + ' de ' + MESES[date.getMonth()].toLowerCase() +
      ' a las ' + horaSeleccionada + ' hs. Te contactaremos al ' + turno.telefono + ' si necesitamos confirmar algun dato.';

    form.hidden = true;
    successBlock.hidden = false;
  });

  renderCalendar();
})();
