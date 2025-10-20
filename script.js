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
  }
}

const supabase = supabase.createClient(
  'https://qblqdqcxgodsmsufsxxh.supabase.co',
  'sb_publishable_9Ke621LZrFwngLMm2OheKw_dUhWZNP5'
);

function visaOperationFormulär() {
  document.getElementById('operationer-sektion').style.display = 'block';
  document.getElementById('operation-lista').innerHTML = '';
}

async function visaOperationer() {
  document.getElementById('operationer-sektion').style.display = 'block';

  const { data, error } = await supabase
    .from('operationer')
    .select('namn');

  if (error) {
    console.error('Fel vid hämtning:', error);
    return;
  }

  data.sort((a, b) => a.namn.localeCompare(b.namn));

  const lista = document.getElementById('operation-lista');
  lista.innerHTML = '';
  data.forEach(op => {
    const li = document.createElement('li');
    li.textContent = op.namn;
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

  const { error } = await supabase
    .from('operationer')
    .insert([{ namn, info }]);

  if (error) {
    console.error('Fel vid insättning:', error);
  } else {
    document.getElementById('ny-operation-namn').value = '';
    document.getElementById('ny-operation-info').value = '';
    alert('Operation tillagd!');
    visaOperationer(); // 👈 Lägg till detta för att uppdatera listan direkt
  }
}

function visaResursFormulär() {
  document.getElementById('resurser-sektion').style.display = 'block';
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

  const { error } = await supabase
    .from('resurser')
    .insert([{ namn, typ, procent, kapacitet, arbetsdagar }]);

  if (error) {
    console.error('Fel vid insättning:', error);
  } else {
    alert('Resurs tillagd!');
    document.getElementById('resurser-sektion').style.display = 'none';
  }
}
