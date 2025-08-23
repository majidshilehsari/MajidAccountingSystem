// اتصال به Supabase به عنوان منبع اصلی داده + Realtime
const SUPABASE_URL = 'https://xhjxhbmlzznyadygpgqx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoanhoYm1senpueWFkeWdwZ3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE1MDQsImV4cCI6MjA3MTQ1NzUwNH0.OGYeqZTnqzVwGm5Ptg_jyVvF5gljS_a0fjtLHa3Nai4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let persons = [];
let records = [];

const tabs = document.getElementById('tabs');
const tabPersons = document.getElementById('tab-persons');
const tabRecords = document.getElementById('tab-records');
const personSection = document.getElementById('person-section');
const recordsSection = document.getElementById('records-section');
const personList = document.getElementById('person-list');
const addPersonBtn = document.getElementById('add-person');
const personNameInput = document.getElementById('person-name');
const personSelect = document.getElementById('person-select');
const recordForm = document.getElementById('record-form');
const recordDescInput = document.getElementById('record-desc');
const recordAmountInput = document.getElementById('record-amount');
const recordList = document.getElementById('record-list');

function showTab(tab) {
    if (tab === 'persons') {
        tabPersons.classList.add('active');
        tabRecords.classList.remove('active');
        personSection.style.display = 'block';
        recordsSection.style.display = 'none';
    } else {
        tabPersons.classList.remove('active');
        tabRecords.classList.add('active');
        personSection.style.display = 'none';
        recordsSection.style.display = 'block';
    }
}

tabPersons && tabPersons.addEventListener('click', () => showTab('persons'));
tabRecords && tabRecords.addEventListener('click', () => showTab('records'));

async function fetchPersons() {
    const { data, error } = await supabase
        .from('persons')
        .select('*')
        .order('id', { ascending: true });
    if (error) {
        alert('خطا در دریافت لیست افراد: ' + error.message);
        return;
    }
    persons = data || [];
    renderPersons();
}

function renderPersons() {
    personList.innerHTML = '';
    persons.forEach(person => {
        const li = document.createElement('li');
        li.textContent = person.name;
        const delBtn = document.createElement('button');
        delBtn.textContent = 'حذف';
        delBtn.onclick = () => {
            if (confirm('آیا مطمئن هستید؟')) deletePerson(person.id);
        };
        li.appendChild(delBtn);
        personList.appendChild(li);
    });
    personSelect.innerHTML = '';
    persons.forEach(person => {
        const opt = document.createElement('option');
        opt.value = person.id;
        opt.textContent = person.name;
        personSelect.appendChild(opt);
    });
    fetchRecords();
}

async function addPerson() {
    const name = personNameInput.value.trim();
    if (!name) {
        alert('لطفاً نام فرد را وارد کنید.');
        personNameInput.focus();
        return;
    }
    const { error } = await supabase.from('persons').insert([{ name }]);
    if (error) {
        alert('خطا در افزودن فرد: ' + error.message);
        return;
    }
    personNameInput.value = '';
    fetchPersons();
    personNameInput.focus();
}

async function deletePerson(id) {
    const { error } = await supabase.from('persons').delete().eq('id', id);
    if (error) alert('خطا در حذف فرد: ' + error.message);
    fetchPersons();
}

personNameInput && personNameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        addPerson();
    }
});
addPersonBtn && addPersonBtn.addEventListener('click', addPerson);

async function fetchRecords() {
    const personId = personSelect.value;
    if (!personId) {
        recordList.innerHTML = '<li>ابتدا فردی را انتخاب کنید.</li>';
        return;
    }
    const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('person_id', personId)
        .order('id', { ascending: true });
    if (error) {
        alert('خطا در دریافت رکوردها: ' + error.message);
        return;
    }
    records = data || [];
    renderRecords();
}

function renderRecords() {
    recordList.innerHTML = '';
    if (!records.length) {
        recordList.innerHTML = '<li>رکوردی ثبت نشده است.</li>';
        return;
    }
    records.forEach(record => {
        const li = document.createElement('li');
        li.textContent = `${record.desc} - ${record.amount} تومان`;
        const actions = document.createElement('span');
        actions.className = 'actions';
        const delBtn = document.createElement('button');
        delBtn.textContent = 'حذف';
        delBtn.onclick = () => deleteRecord(record.id);
        actions.appendChild(delBtn);
        const editBtn = document.createElement('button');
        editBtn.textContent = 'ویرایش';
        editBtn.className = 'edit';
        editBtn.onclick = () => editRecordPrompt(record);
        actions.appendChild(editBtn);
        li.appendChild(actions);
        recordList.appendChild(li);
    });
}

async function addRecord(e) {
    e.preventDefault();
    const personId = personSelect.value;
    const desc = recordDescInput.value.trim();
    const amount = parseInt(recordAmountInput.value, 10);
    if (!desc || isNaN(amount) || !personId) {
        alert('همه فیلدها را کامل کنید.');
        return;
    }
    const { error } = await supabase.from('records').insert([{ person_id: personId, desc, amount }]);
    if (error) {
        alert('خطا در افزودن رکورد: ' + error.message);
        return;
    }
    recordDescInput.value = '';
    recordAmountInput.value = '';
    fetchRecords();
}

async function deleteRecord(id) {
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (error) alert('خطا در حذف رکورد: ' + error.message);
    fetchRecords();
}

async function editRecordPrompt(record) {
    const newDesc = prompt('شرح جدید:', record.desc);
    if (newDesc === null) return;
    const newAmount = prompt('مبلغ جدید:', record.amount);
    if (newAmount === null) return;
    const { error } = await supabase
        .from('records')
        .update({ desc: newDesc, amount: parseInt(newAmount, 10) })
        .eq('id', record.id);
    if (error) alert('خطا در بروزرسانی رکورد: ' + error.message);
    fetchRecords();
}

personSelect && personSelect.addEventListener('change', fetchRecords);
recordForm && recordForm.addEventListener('submit', addRecord);

// Realtime: بروز رسانی زنده
function initRealtime() {
    supabase
        .channel('public:persons')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'persons' }, () => {
            fetchPersons();
        })
        .subscribe();

    supabase
        .channel('public:records')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, () => {
            fetchRecords();
        })
        .subscribe();
}

// بارگذاری اولیه
fetchPersons();
initRealtime();


