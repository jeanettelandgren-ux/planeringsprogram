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
}

async function visaOperationer() {
  console.log('Visar operationer');
  document.getElementById('operationer-sektion').style.display = 'block';

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
async function taBortOperation(id) {
  const { error } = await supabaseClient
    .from('operationer')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Fel vid borttagning:', error);
    alert('Det gick inte att ta bort operationen.');
  } else {
    alert('Operation borttagen!');
    visaOperationer(); // Uppdatera listan direkt
  }
}


async function läggTillOperation() {
  const namn = document.getElementById('ny-operation-namn').value;
  const info = document.getElementById('ny-operation-info').value;

  if (!namn) {
    alert('Fyll i ett namn!');
    return;
  }

  const { data, error } = await supabaseClient
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

// 🛠 Resurser
function visaResursFormulär() {
  document.getElementById('resurser-sektion').style.display = 'block';
}

async function visaResurser() {
  console.log('Visar resurser');
  document.getElementById('resurser-sektion').style.display = 'block';

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
    li.textContent = `${resurs.namn} – ${resurs.typ} – ${resurs.kapacitet}`;
    lista.appendChild(li);
  });
}

function beräknaKapacitet() {
  const procent = parseInt(document.getElementById('resurs-procent').value);
  let kapacitet = '–';
  if (procent === 100) kapacitet = 36.25;
  if (procent === 75) kapacitet = 26.25;
  if (procent === 50) kapacitet = 16.25;
  document.getElementById('resurs-kapacitet').textContent = kapacitet;
}

async function läggTillResurs() {
  const namn = document.getElementById('resurs-namn').value;
  const typ = document.getElementById('resurs-typ').value;
  const procent = parseInt(document.getElementById('resurs-procent').value);
  const kapacitet = parseFloat(document.getElementById('resurs-kapacitet').textContent);
  const arbetsdagar = Array.from(document.querySelectorAll('#resurser-sektion input[type="checkbox"]:checked')).map(cb => cb.value);

  if (!namn || !typ || isNaN(procent) || isNaN(kapacitet)) {
    alert('Fyll i alla fält!');
    return;
  }

  const { error } = await supabaseClient
    .from('resurser')
    .insert([{ namn, typ, procent, kapacitet, arbetsdagar }]);

  if (error) {
    console.error('Fel vid insättning:', error);
    alert('Det gick inte att spara resursen.');
  } else {
    alert('Resurs tillagd!');
    visaResurser();
    document.getElementById('resurser-sektion').style.display = 'none';
  }
}
