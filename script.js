let activeMenu = null;
let aktuellArtikelId = null;

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
  document.getElementById('artiklar-sektion').style.display = 'none';
}

// ✅ Supabase-initiering
const { createClient } = supabase;
const supabaseClient = createClient(
  'https://qblqdqcxgodsmsufsxxh.supabase.co',
  'sb_publishable_9Ke621LZrFwngLMm2OheKw_dUhWZNP5'
);

// 🛠 Artiklar
function visaArtikelFormulär() {
  document.getElementById('artiklar-sektion').style.display = 'block';
  document.getElementById('artikel-lista').innerHTML = '';
  document.getElementById('artikel-formulär').style.display = 'block';
  document.getElementById('artikel-redigera-formulär').style.display = 'none';
}

async function visaArtiklar() {
  document.getElementById('artiklar-sektion').style.display = 'block';
  document.getElementById('artikel-formulär').style.display = 'none';
  document.getElementById('artikel-redigera-formulär').style.display = 'none';

  const { data, error } = await supabaseClient
    .from('artiklar')
    .select('*');

  if (error) {
    console.error('Fel vid hämtning av artiklar:', error);
    alert('Kunde inte hämta artiklar.');
    return;
  }

  data.sort((a, b) => a.namn.localeCompare(b.namn));

  const lista = document.getElementById('artikel-lista');
  lista.innerHTML = '';

  data.forEach(artikel => {
    const li = document.createElement('li');
    li.textContent = `${artikel.namn} – ${artikel.artikelnummer} – ${artikel.info || ''}`;

    if (artikel.mall) {
      li.style.fontWeight = 'bold';
      li.style.color = '#0055aa';
    }

    const redigeraKnapp = document.createElement('button');
    redigeraKnapp.textContent = 'Redigera';
    redigeraKnapp.onclick = () => visaRedigeraArtikel(artikel);

    const taBortKnapp = document.createElement('button');
    taBortKnapp.textContent = 'Ta bort';
    taBortKnapp.onclick = () => taBortArtikel(artikel.id);

    li.appendChild(redigeraKnapp);
    li.appendChild(taBortKnapp);
    lista.appendChild(li);
  });
}

async function läggTillArtikel() {
  const namn = document.getElementById('artikel-namn').value;
  const artikelnummer = document.getElementById('artikel-nummer').value;
  const info = document.getElementById('artikel-info').value;
  const mall = document.getElementById('artikel-mall').checked;

  if (!namn || !artikelnummer) {
    alert('Fyll i både namn och artikelnummer!');
    return;
  }

  const { error } = await supabaseClient
    .from('artiklar')
    .insert([{ namn, artikelnummer, info, mall }]);

  if (error) {
    console.error('Fel vid insättning:', error);
    alert('Det gick inte att spara artikeln.');
  } else {
    alert('Artikel tillagd!');
    visaArtiklar();
  }
}

function visaRedigeraArtikel(artikel) {
  aktuellArtikelId = artikel.id;
  document.getElementById('artikel-redigera-formulär').style.display = 'block';

  document.getElementById('redigera-artikel-namn').value = artikel.namn;
  document.getElementById('redigera-artikel-nummer').value = artikel.artikelnummer;
  document.getElementById('redigera-artikel-info').value = artikel.info || '';
  document.getElementById('redigera-artikel-mall').checked = artikel.mall;
}

async function sparaArtikelÄndring() {
  const namn = document.getElementById('redigera-artikel-namn').value;
  const artikelnummer = document.getElementById('redigera-artikel-nummer').value;
  const info = document.getElementById('redigera-artikel-info').value;
  const mall = document.getElementById('redigera-artikel-mall').checked;

  if (!namn || !artikelnummer) {
    alert('Fyll i både namn och artikelnummer!');
    return;
  }

  const { error } = await supabaseClient
    .from('artiklar')
    .update({ namn, artikelnummer, info, mall })
    .eq('id', aktuellArtikelId);

  if (error) {
    console.error('Fel vid uppdatering:', error);
    alert('Det gick inte att uppdatera artikeln.');
  } else {
    alert('Artikel uppdaterad!');
    document.getElementById('artikel-redigera-formulär').style.display = 'none';
    visaArtiklar();
  }
}

async function taBortArtikel(id) {
  const bekräfta = confirm('Ta bort artikel?');
  if (!bekräfta) return;

  const { error } = await supabaseClient
    .from('artiklar')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Fel vid borttagning:', error);
    alert('Det gick inte att ta bort artikeln.');
  } else {
    alert('Artikel borttagen!');
    visaArtiklar();
  }
}
