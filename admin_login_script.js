// Firebase Yapılandırması (index.html'dekiyle aynı)
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
const auth = app.auth(); // Authentication servisini al


// SADECE DOMContentLoaded İÇİNDE ÇALIŞAN KOD BLOKU
document.addEventListener('DOMContentLoaded', () => {

    // HTML elementlerini sadece sayfa tamamen yüklendikten sonra yakalıyoruz
    const loginForm = document.getElementById('adminLoginForm');
    const mesajP = document.getElementById('mesajAdmin');
    const loginButton = document.getElementById('loginButton');

    // Eğer form bulunamazsa, hata veririz (güvenlik için)
    if (!loginForm) {
        console.error("HATA: adminLoginForm elementi bulunamadı. ID'yi kontrol edin!");
        return; // Kodu durdur
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        mesajP.textContent = "Giriş yapılıyor...";
        mesajP.className = 'mesaj show';
        loginButton.disabled = true;
        loginButton.textContent = 'Kontrol Ediliyor...';

        try {
            // Firebase Authentication ile giriş yapma
            await auth.signInWithEmailAndPassword(email, password);

            // Başarılı giriş: Yönetici paneline yönlendir
            mesajP.textContent = "✅ Giriş Başarılı! Yönetici Paneline Yönlendiriliyorsunuz...";
            mesajP.className = 'mesaj success show';

            // ÖNEMLİ: YÖNLENDİRME YAPILACAK YER
            setTimeout(() => {
                window.location.href = 'admin_panel.html'; // YÖNETİCİ PANELİ DOSYASI
            }, 1500);

        } catch (error) {
            console.error("Giriş Hatası: ", error.code, error.message);

            let hataMesaji = "Giriş başarısız oldu. E-posta veya şifre hatalı.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                 hataMesaji = "Kullanıcı adı veya şifre yanlış.";
            }

            mesajP.textContent = `❌ ${hataMesaji}`;
            mesajP.className = 'mesaj error show';
            loginButton.disabled = false;
            loginButton.textContent = 'GİRİŞ YAP';
        }
    });
});