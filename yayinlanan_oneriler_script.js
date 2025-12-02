// yayinlanan_oneriler_script.js

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
// ----------------------------------------------------------------

const onerilerListesi = document.getElementById('onerilerListesi');

function onerileriGetir() {
    // Sadece herkeseGozuksun: true olan önerileri çekiyoruz ve tarihe göre en yeniyi üste alıyoruz
    db.collection("oneriler")
        .where("herkeseGozuksun", "==", true)
        .orderBy("tarih", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                onerilerListesi.innerHTML = '<p style="text-align: center; padding: 20px; font-weight: 500;">Şu anda yayınlanmış öğrenci önerisi bulunmamaktadır.</p>';
                return;
            }

            onerilerListesi.innerHTML = ''; // Yükleniyor mesajını temizle

            querySnapshot.forEach((doc) => {
                const oner = doc.data();
                // Tarih alanının varlığını kontrol ederek düzgün formatlama
                const tarihStr = oner.tarih && oner.tarih.seconds
                    ? new Date(oner.tarih.seconds * 1000).toLocaleDateString("tr-TR")
                    : 'Bilinmiyor';

                const onerCard = `
                    <div class="oner-card">
                        <div class="oner-header">
                            <span class="oner-tur ${oner.tur.toLowerCase()}">${oner.tur}</span>
                            <span class="oner-konu">${oner.konu}</span>
                        </div>
                        <h3 class="oner-baslik">${oner.baslik}</h3>
                        <p class="oner-aciklama">${oner.aciklama}</p>
                        <div class="oner-footer">
                            <span class="oner-gonderen">Gönderen: ${oner.anonim ? 'Anonim Öğrenci' : oner.gonderen}</span>
                            <span class="oner-tarih">Tarih: ${tarihStr}</span>
                        </div>
                    </div>
                `;
                onerilerListesi.innerHTML += onerCard;
            });
        })
        .catch((error) => {
            console.error("Öneriler çekilirken hata oluştu: ", error);
            onerilerListesi.innerHTML = '<p style="color: red; text-align: center;">Öneriler yüklenirken bir hata oluştu.</p>';
        });
}

// Sayfa yüklendiğinde önerileri getir
onerileriGetir();