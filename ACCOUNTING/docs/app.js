// اتصال به Supabase به عنوان منبع اصلی داده + Realtime
const SUPABASE_URL = 'https://xhjxhbmlzznyadygpgqx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoanhoYm1senpueWFkeWdwZ3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE1MDQsImV4cCI6MjA3MTQ1NzUwNH0.OGYeqZTnqzVwGm5Ptg_jyVvF5gljS_a0fjtLHa3Nai4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let persons = [];
let records = [];

// تبدیل تاریخ میلادی به شمسی (Jalali)
function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return [jy, jm, jd];
}

function getJalaliToday() {
    const now = new Date();
    const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const mm = jm.toString().padStart(2, '0');
    const dd = jd.toString().padStart(2, '0');
    return `${jy}-${mm}-${dd}`;
}

const tabs = document.getElementById('tabs');
const tabPersons = document.getElementById('tab-persons');
const tabRecords = document.getElementById('tab-records');
const personSection = document.getElementById('person-section');
const recordsSection = document.getElementById('records-section');
const personList = document.getElementById('person-list');
const addPersonBtn = document.getElementById('add-person');
const personNameInput = document.getElementById('person-name');
const personDateInput = document.getElementById('person-date');
const personSelect = document.getElementById('person-select');
const recordForm = document.getElementById('record-form');
const recordDescInput = document.getElementById('record-desc');
const recordAmountInput = document.getElementById('record-amount');
const recordDateInput = document.getElementById('record-date');
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

// تنظیم پیش‌فرض تاریخ شمسی امروز روی input
const todayJalali = getJalaliToday();
if (personDateInput) personDateInput.value = todayJalali;
if (recordDateInput) recordDateInput.placeholder = `تاریخ شمسی: ${todayJalali}`;

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
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.textContent = person.name;
        const tdDate = document.createElement('td');
        tdDate.textContent = person.jalali_date || '-';
        const tdActions = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.textContent = 'حذف';
        delBtn.onclick = () => {
            if (confirm('آیا مطمئن هستید؟')) deletePerson(person.id);
        };
        tdActions.appendChild(delBtn);
        tr.appendChild(tdName);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);
        personList.appendChild(tr);
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
    let selectedJalali = todayJalali;
    if (personDateInput && /^\d{4}-\d{2}-\d{2}$/.test(personDateInput.value)) {
        selectedJalali = personDateInput.value;
    }
    const { error } = await supabase.from('persons').insert([{ name, jalali_date: selectedJalali }]);
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
        return;
    }
    records.forEach(record => {
        const tr = document.createElement('tr');
        const tdDesc = document.createElement('td');
        tdDesc.textContent = record.desc;
        const tdAmount = document.createElement('td');
        tdAmount.textContent = `${record.amount} تومان`;
        const tdDate = document.createElement('td');
        tdDate.textContent = record.jalali_date || '-';
        const tdActions = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.textContent = 'حذف';
        delBtn.onclick = () => deleteRecord(record.id);
        const editBtn = document.createElement('button');
        editBtn.textContent = 'ویرایش';
        editBtn.className = 'edit';
        editBtn.onclick = () => editRecordPrompt(record);
        tdActions.appendChild(delBtn);
        tdActions.appendChild(editBtn);
        tr.appendChild(tdDesc);
        tr.appendChild(tdAmount);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);
        recordList.appendChild(tr);
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
    let selectedJalali = todayJalali;
    if (recordDateInput && /^\d{4}-\d{2}-\d{2}$/.test(recordDateInput.value)) {
        selectedJalali = recordDateInput.value;
    }
    const { error } = await supabase.from('records').insert([{ person_id: personId, desc, amount, jalali_date: selectedJalali }]);
    if (error) {
        alert('خطا در افزودن رکورد: ' + error.message);
        return;
    }
    recordDescInput.value = '';
    recordAmountInput.value = '';
    if (recordDateInput) recordDateInput.value = todayJalali;
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


