let activeMenu = null;

function toggleMenu(menuName) {
  const allMenus = {
    planering: ['planering', 'planering2'],
    order: ['order', 'order2'],
    artiklar: ['artiklar', 'artiklar2'],
    resurser: ['resurser', 'resurser2'],
    operationer: ['operationer', 'operationer2'],
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

  if (menuName === 'operationer') {
    document.getElementById('operationer').onclick = visaOperationFormulär;
    document.getElementById('operationer2').onclick = visaOperationer;
  }

  if (menuName === 'resurser') {
    document.getElementById('resurser').onclick = visaResursFormulär;
    document.getElementById('resurser2').onclick = visaResurser;
  }
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
    li.textContent = `${op.namn} – ${op.info || ''}`;
    lista.appendChild(li);
  });
}

async function läggTillOperation() {
  const namn = document.getElementById('ny-operation-namn').value;
  const info = document.getElementById('ny-operation-info').value;

  console.log('Försöker lägga till:', { namn, info });

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
    console.log('Resultat från Supabase:', data);
    document.getElementById('ny-operation-namn').value = '';
    document.getElementById('ny-operation-info').value = '';
    alert('Operation tillagd!');
    visaOperationer();
  }
}

// 🛠 Resurser
function visaResursFormulär() {
  document.getElementById('resurser-sektion').style.display = 'block';
}

async function visaResurser() {
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
