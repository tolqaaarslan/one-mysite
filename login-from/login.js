document.addEventListener('DOMContentLoaded', () => {
    // Sayfadaki tüm giriş formlarını seçiyoruz (.login-form class'ına sahip olanları)
    const loginForms = document.querySelectorAll('.login-form');

    // Cloudflare Worker adresiniz. Lütfen kendi URL'niz ile güncelleyin.
    const workerUrl = 'https://friends-login.tolqaarslan.workers.dev/';

    // Bulunan her bir form için ayrı bir olay dinleyici kuruyoruz
    loginForms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Formun sayfayı yenilemesini engelle

            // Sadece tıklanan forma ait buton ve hata mesajı alanını buluyoruz
            const submitBtn = form.querySelector('.submit-btn');
            const errorMessage = form.querySelector('.error-message');

            errorMessage.textContent = ''; // Eski hata mesajını temizle
            submitBtn.disabled = true;
            submitBtn.textContent = 'Kontrol ediliyor...';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(workerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (result.success) {
                    // Giriş başarılıysa, Worker'dan gelen yönlendirme adresini kullan.
                    // Örneğin: '../ahmet.html' veya '../ayse.html'
                    window.location.href = result.redirectUrl;
                } else {
                    // Giriş başarısızsa ilgili formun altına hata mesajı yaz
                    errorMessage.textContent = result.message || 'Girilen bilgiler hatalı. Lütfen tekrar dene.';
                }

            } catch (error) {
                console.error('Giriş sırasında bir hata oluştu:', error);
                errorMessage.textContent = 'Bir sunucu hatası oluştu. Lütfen daha sonra tekrar dene.';
            } finally {
                // İşlem bitince butonu tekrar aktif hale getir
                submitBtn.disabled = false;
                submitBtn.textContent = 'Giriş Yap';
            }
        });
    });
});