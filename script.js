let activeMenu = null;

function toggleMenu(menuName) {
  const allMenus = {
    planering: ['planering-ny', 'planering-lista'],
    order: ['order-ny', 'order-lista'],
    artiklar: ['artiklar-ny', 'artiklar-lista'],
    resurser: ['resurser-ny', 'resurser-lista'],
    operationer: ['operationer-ny', 'operationer-lista'],
    kalender: []
  };

  Object.values(allMenus).flat().forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (activeMenu === menuName) {
    activeMenu = null;
  } else {
    activeMenu = menuName;
    allMenus[menuName].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
  }

  document.getElementById('operationer-sektion').style.display = 'none';
  document.getElementById('resurser-sektion').style.display = 'none';
}

// ✅ Supabase-initiering
const { createClient } = supabase;
const supabaseClient = createClient(
  'https://qblqdqcxgodsmsufsxxh.supabase.co',
  'sb_publishable_9Ke621LZrFwngLMm2OheKw_dUhWZNP5'
);

// 🛠 Operationer
function visaOperationFormulär() {
  document.getElementById('operationer-sektion').style.display = 'block';
  document.getElementById('operation-lista').innerHTML = '';
  document.getElementById('operation-formulär').style.display = 'block';
}

async function visaOperationer() {
  document.getElementById('operationer-sektion').style.display = 'block';
  document.getElementById('operation-formulär').style.display = 'none';

  const { data, error } = await supabaseClient
    .from('operationer')
    .select('*');

  if (error) {
    console.error('Fel vid hämtning:', error);
    alert('Kunde inte hämta operationer.');
    return;
  }

  data.sort((a, b) => a.namn.localeCompare(b.namn));

  const lista = document.getElementById('operation-lista');
  lista.innerHTML = '';

  data.forEach(op => {
    const li = document.createElement('li');
    li.textContent = `${op.namn} – ${op.info || ''} `;

    const knapp = document.createElement('button');
    knapp.textContent = 'Ta bort';
    knapp.onclick = () => taBortOperation(op.id);

    li.appendChild(knapp);
    lista.appendChild(li);
  });
}

async function läggTillOperation() {
  const namn = document.getElementById('ny-operation-namn').value;
  const info = document.getElementById('ny-operation-info').value;

  if (!namn) {
    alert('Fyll i ett namn!');
    return;
  }

  const { error } = await supabaseClient
    .from('operationer')
    .insert([{ namn, info }]);

  if (error) {
    console.error('Fel vid insättning:', error);
    alert('Det gick inte att spara operationen.');
  } else {
    alert('Operation tillagd!');
    document.getElementById('ny-operation-namn').value = '';
    document.getElementById('ny-operation-info').value = '';
    visaOperationer();
  }
}

async function taBortOperation(id) {
  const bekräfta = confirm('Ta bort operation?');
  if (!bekräfta) return;

  const { error } = await supabaseClient
    .from('operationer')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Fel vid borttagning:', error);
    alert('Det gick inte att ta bort operationen.');
  } else {
    alert('Operation borttagen!');
    visaOperationer();
  }
}

// 🛠 Resurser
function visaResursFormulär() {
  document.getElementById('resurser-sektion').style.display = 'block';
  document.getElementById('resurs-lista').innerHTML = '';
  document.getElementById('resurs-formulär').style.display = 'block';
}

async function visaResurser() {
  document.getElementById('resurser-sektion').style.display = 'block';
  document.getElementById('resurs-formulär').style.display = 'none';

  const { data, error } = await supabaseClient
    .from('resurser')
    .select('*');

  if (error) {
    console.error('Fel vid hämtning av resurser:', error);
    alert('Kunde inte hämta resurser.');
    return;
  }

  data.sort((a, b) => a.namn.localeCompare(b.namn));

  const lista = document.getElementById('resurs-lista');
  lista.innerHTML = '';

  data.forEach(resurs => {
    const li = document.createElement('li');
    li.textContent = `${resurs.namn} – ${resurs.typ} – ${resurs.kapacitet} `;

    const knapp = document.createElement('button');
    knapp.textContent = 'Ta bort';
    knapp.onclick = () => taBortResurs(resurs.id);

    li.appendChild(knapp);
    lista.appendChild(li);
  });
}

async function läggTillResurs() {
  const namn = document.getElementById('resurs-namn').value;
  const typ = document.getElementById('resurs-typ').value;
  const procent = parseInt(document.getElementById('resurs-procent').value);
  const kapacitet = procent ? Math.round(procent * 40 / 100) : null;
  const aktiv = document.getElementById('resurs-aktiv').checked;

  const arbetsdagar = Array.from(document.querySelectorAll('input[type="checkbox"][value]'))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (!namn || !typ || !procent || arbetsdagar.length === 0) {
    alert('Fyll i alla fält och välj arbetsdagar!');
    return;
  }

  const { error } = await supabaseClient
    .from('resurser')
    .insert([{ namn, typ, procent, kapacitet, arbetsdagar, aktiv }]);

  if (error) {
    console.error('Fel vid insättning:', error);
    alert('Det gick inte att spara resursen.');
  } else {
    alert('Resurs tillagd!');
    visaResurser();
  }
}

async function taBortResurs(id) {
  const bekräfta = confirm('Ta bort resurs?');
  if (!bekräfta) return;

  const { error } = await supabaseClient
    .from('resurser')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Fel vid borttagning:', error);
    alert('Det gick inte att ta bort resursen.');
  } else {
    alert('Resurs borttagen!');
    visaResurser();
  }
}

function markeraAllaDagar() {
  const allaMarkerad = document.getElementById('resurs-alla-dagar').checked;
  const dagar = ['mån', 'tis', 'ons', 'tors', 'fre'];

  dagar.forEach(dag => {
    const checkbox = document.querySelector(`input[type="checkbox"][value="${dag}"]`);
    if (checkbox) checkbox.checked = allaMarkerad;
  });
}


