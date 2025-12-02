// Adım 1: Firebase Yapılandırması ve Başlatma
const firebaseConfig = {
    apiKey: "AIzaSyAocItCw7LViRH9M00zY7foqVGkt2q3Lng",
    authDomain: "tal-istekdilek.firebaseapp.com",
    projectId: "tal-istekdilek",
    storageBucket: "tal-istekdilek.firebasestorage.app",
    messagingSenderId: "413848547594",
    appId: "1:413848547594:web:fdefe4470c94aa0bb48af3",
    measurementId: "G-XRJLZPG28D"
};

// Firebase uygulamasını başlat
const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();

// Form elementlerini seçme
const idoForm = document.getElementById('idoForm');
const mesajP = document.getElementById('mesaj');
const anonimCheckbox = document.getElementById('anonim');
const gonderenAdInput = document.getElementById('gonderenAd');
// 🔥 YENİ: Herkese Gözüksün checkbox'ını seçiyoruz
const herkeseGozuksunCheckbox = document.getElementById('herkeseGozuksun');


// === SPLASH SCREEN (Giriş Ekranı) Mantığı ===
document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');

    // 3 saniye sonra splash screen'i gizle ve ana içeriği göster
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
        if (mainContent) {
            // CSS'te visible class'ı yerine, opacity'yi 1'e ayarlayan bir stil kullanıyoruz
            // (HTML'deki content-wrapper'ın zaten opacity: 1 geçişi var)
            mainContent.style.opacity = 1;
        }

        // Ana içerik görünür hale geldikten sonra form elemanlarının animasyonunu başlat
        document.querySelectorAll('.form-group').forEach(el => {
            el.style.opacity = 1; // CSS'teki animasyonu başlatmak için gerekli (Eğer CSS'te animation-delay kullanılıyorsa, bu satır gerekli olmayabilir ama zarar vermez)
        });

    }, 3000); // 3000 milisaniye = 3 saniye
});
// ===========================================

// Anonimlik seçeneğine göre İsim alanını yönetme
anonimCheckbox.addEventListener('change', () => {
    if (anonimCheckbox.checked) {
        gonderenAdInput.value = '';
        gonderenAdInput.disabled = true;
        gonderenAdInput.placeholder = 'Anonim gönderim seçildi';
        gonderenAdInput.classList.remove('input-active');
    } else {
        gonderenAdInput.disabled = false;
        gonderenAdInput.placeholder = 'Adınız Soyadınız (İsteğe bağlı)';
        gonderenAdInput.focus();
        gonderenAdInput.classList.add('input-active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Sayfa yüklendiğinde anonim default seçiliyse, isim alanını pasif yap
    if (anonimCheckbox.checked) {
        gonderenAdInput.disabled = true;
        gonderenAdInput.placeholder = 'Anonim gönderim seçildi';
    }
});


// Form gönderildiğinde çalışacak fonksiyon
idoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Mesaj hazırlığı ve buton kilitleme
    mesajP.textContent = "Gönderiliyor...";
    mesajP.className = 'mesaj show';
    document.getElementById('gonderButton').disabled = true;
    document.getElementById('gonderButton').textContent = 'Gönderiliyor...';

    // Formdan verileri toplama
    const tur = document.getElementById('tur').value;
    const konu = document.getElementById('konu').value;
    const baslik = document.getElementById('baslik').value;
    const aciklama = document.getElementById('aciklama').value;

    const anonim = anonimCheckbox.checked;
    // 🔥 YENİ: Herkese Gözüksün değerini al
    const herkeseGozuksun = herkeseGozuksunCheckbox.checked;

    let gonderenAd = anonim ? "Anonim" : (gonderenAdInput.value.trim() || "Anonim");

    // Firestore'a gönderilecek veri yapısı
    const yeniOnveri = {
        gonderen: gonderenAd,
        tur: tur,
        konu: konu,
        baslik: baslik,
        aciklama: aciklama,
        anonim: anonim,
        herkeseGozuksun: herkeseGozuksun, // 🔥 Bu satır EKLENDİ!
        tarih: firebase.firestore.FieldValue.serverTimestamp(),
        durum: "Yeni"
    };

    try {
        await db.collection("oneriler").add(yeniOnveri);

        // Başarılı mesajı göster ve formu temizle
        mesajP.textContent = "✅ İstek/Öneriniz başarıyla alındı. Teşekkür ederiz!";
        mesajP.className = 'mesaj success show';
        idoForm.reset();

        // Form sıfırlandıktan sonra anonimliği ve isim alanını varsayılana getir
        anonimCheckbox.checked = true;
        herkeseGozuksunCheckbox.checked = false;
        gonderenAdInput.disabled = true;
        gonderenAdInput.placeholder = 'Anonim gönderim seçildi';

    } catch (error) {
        console.error("Veri gönderilirken bir hata oluştu: ", error);
        mesajP.textContent = "❌ Gönderim başarısız oldu. Lütfen tekrar deneyin.";
        mesajP.className = 'mesaj error show';

    } finally {
        document.getElementById('gonderButton').disabled = false;
        document.getElementById('gonderButton').textContent = 'GÖNDER';
    }
});