// Firebase Yapılandırması (Önceki dosyalarla aynı)
const firebaseConfig = {
    apiKey: "AIzaSyAocItCw7LViRH9M00zY7foqVGkt2q3Lng",
    authDomain: "tal-istekdilek.firebaseapp.com",
    projectId: "tal-istekdilek",
    storageBucket: "tal-istekdilek.firebasestorage.app",
    messagingSenderId: "413848547594",
    appId: "1:413848547594:web:fdefe4470c94aa0bb48af3",
    measurementId: "G-XRJLZPG28D"
};

// Firebase servislerini başlat
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();
const onerilerRef = db.collection("oneriler");

const tableBody = document.getElementById('onerilerTableBody');
const loadingStatus = document.getElementById('loadingStatus');
const panelMesaj = document.getElementById('panelMesaj');
const logoutButton = document.getElementById('logoutButton');

// Modal Elementleri
const detailModal = document.getElementById('detailModal');
const closeBtn = document.querySelector('.close-btn');

// Oturumu Kontrol Et ve Verileri Yükle
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("Yönetici oturumu açık. Veriler yükleniyor...");
        loadOneriler();
    } else {
        alert("Lütfen yönetici olarak giriş yapın.");
        window.location.href = 'admin_login.html';
    }
});

// Çıkış Yapma Fonksiyonu
logoutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'admin_login.html';
    } catch (error) {
        console.error("Çıkış yapılırken hata oluştu: ", error);
        alert("Çıkış yapılırken bir hata oluştu.");
    }
});

// Firestore'dan Veri Çekme Fonksiyonu
async function loadOneriler() {
    try {
        const snapshot = await onerilerRef.orderBy('tarih', 'desc').get();

        loadingStatus.style.display = 'none';
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            panelMesaj.textContent = "Henüz gönderilmiş istek, dilek veya öneri bulunmamaktadır.";
            panelMesaj.className = 'mesaj show success';
            return;
        }

        snapshot.forEach(doc => {
            renderRow(doc);
        });

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu: ", error);
        panelMesaj.textContent = `❌ Veri yüklenirken hata oluştu: ${error.message}`;
        panelMesaj.className = 'mesaj show error';
        loadingStatus.style.display = 'none';
    }
}

// Tabloya Tek Bir Satır Ekleme Fonksiyonu
function renderRow(doc) {
    const data = doc.data();
    const id = doc.id;

    // Tarihi okunabilir formata çevirme
    const tarih = data.tarih ? new Date(data.tarih.seconds * 1000).toLocaleString('tr-TR') : 'Bilinmiyor';

    const row = tableBody.insertRow();
    row.dataset.id = id;

    // Satırın tüm detaylarını JSON olarak sakla (Popup için lazım)
    row.dataset.detay = JSON.stringify({ ...data, id, tarih });

    // 1. Tarih
    row.insertCell().textContent = tarih;

    // 2. Tür (İstek/Dilek/Öneri)
    row.insertCell().textContent = data.tur;

    // 3. Konu
    row.insertCell().textContent = data.konu;

    // 4. Başlık
    row.insertCell().textContent = data.baslik;

    // 5. Gönderen (Anonimlik kontrolü)
    row.insertCell().textContent = data.anonim ? 'Anonim' : (data.gonderenAd || 'Bilinmiyor');

    // 6. Açıklama (Detay Gör butonu)
    const aciklamaCell = row.insertCell();
    aciklamaCell.innerHTML = `<button class="detail-btn" data-id="${id}">Detayları Gör</button>`;

    // 7. Durum (Dropdown ile)
    const durumCell = row.insertCell();
    durumCell.innerHTML = `
        <select class="durum-select" data-id="${id}">
            <option value="Yeni" ${data.durum === 'Yeni' ? 'selected' : ''}>Yeni (🔔)</option>
            <option value="İnceleniyor" ${data.durum === 'İnceleniyor' ? 'selected' : ''}>İnceleniyor (👀)</option>
            <option value="Tamamlandı" ${data.durum === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı (✅)</option>
        </select>
    `;

    // 8. İşlem (Sil butonu)
    const islemCell = row.insertCell();
    islemCell.innerHTML = `<button class="delete-btn" data-id="${id}"><i class="fas fa-trash"></i> Sil</button>`;
}

// MODAL (AÇILIR PENCERE) İŞLEMLERİ
function showDetails(detayData) {
    const data = JSON.parse(detayData);

    document.getElementById('modalTur').textContent = data.tur;
    document.getElementById('modalKonu').textContent = data.konu;
    document.getElementById('modalBaslik').textContent = data.baslik;
    document.getElementById('modalGonderen').textContent = data.anonim ? 'Anonim' : (data.gonderenAd || 'Bilinmiyor');
    document.getElementById('modalTarih').textContent = data.tarih;
    document.getElementById('modalAciklama').textContent = data.aciklama;

    detailModal.style.display = 'block';
}

// Modal Kapatma
closeBtn.onclick = function() {
    detailModal.style.display = 'none';
}

// Modal dışına tıklayınca kapatma
window.onclick = function(event) {
    if (event.target == detailModal) {
        detailModal.style.display = 'none';
    }
}

// Durum Güncelleme, Silme ve Detay Görme İşlemleri için Tek Listener
tableBody.addEventListener('click', (e) => {
    // 1. Durum Değiştirme (Change olayını dinlemeye devam edebiliriz ama click ile de yönetebiliriz)
    if (e.target.classList.contains('durum-select')) {
        const docId = e.target.dataset.id;
        const yeniDurum = e.target.value;
        updateDurum(docId, yeniDurum);
    }

    // 2. Silme
    if (e.target.closest('.delete-btn')) {
        const docId = e.target.closest('.delete-btn').dataset.id;
        if (confirm("Bu öneriyi silmek istediğinizden emin misiniz?")) {
            deleteOneri(docId);
        }
    }

    // 3. Detay Gör
    if (e.target.classList.contains('detail-btn')) {
        const row = e.target.closest('tr');
        const detayData = row.dataset.detay;
        showDetails(detayData);
    }
});

// Durumu Firestore'da Güncelleme
async function updateDurum(id, durum) {
    try {
        await onerilerRef.doc(id).update({ durum: durum });
        panelMesaj.textContent = `Durum başarıyla "${durum}" olarak güncellendi!`;
        panelMesaj.className = 'mesaj show success';
        setTimeout(() => panelMesaj.classList.remove('show'), 3000);
    } catch (error) {
        console.error("Durum güncellenirken hata:", error);
        panelMesaj.textContent = "❌ Durum güncellenemedi.";
        panelMesaj.className = 'mesaj show error';
    }
}

// Öneriyi Firestore'dan Silme
async function deleteOneri(id) {
    try {
        await onerilerRef.doc(id).delete();
        document.querySelector(`tr[data-id="${id}"]`).remove();
        panelMesaj.textContent = "Öneri başarıyla silindi.";
        panelMesaj.className = 'mesaj show success';
        setTimeout(() => panelMesaj.classList.remove('show'), 3000);
    } catch (error) {
        console.error("Silme işleminde hata:", error);
        panelMesaj.textContent = "❌ Silme işlemi başarısız oldu.";
        panelMesaj.className = 'mesaj show error';
    }
}