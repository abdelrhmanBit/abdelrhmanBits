'use strict';


document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('route-request-form');
  if (!form) {
    console.warn('route-request-form not found');
    return;
  }

  const submitBtn = form.querySelector('input[type="submit"]');

  const SERVICE_ID = 'service_tm8y57n';
  const TEMPLATE_ID = 'template_znauj6f';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!window.emailjs) {
      console.error('EmailJS library not loaded.');
      alert('خطأ: مكتبة EmailJS غير محمّلة. افتح Console للمزيد.');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;


    const from = (form.elements['from-station'] && form.elements['from-station'].value.trim()) || '-';
    const to = (form.elements['to-station'] && form.elements['to-station'].value.trim()) || '-';
    const price = (form.elements['price'] && form.elements['price'].value.trim()) || '-';
    const transport = (form.elements['transport'] && form.elements['transport'].value.trim()) || '-';
    const senderEmail = (form.elements['sender_email'] && form.elements['sender_email'].value.trim()) || '-';

    const nameField = senderEmail !== '-' ? senderEmail : `${from} → ${to}`;
    const timeField = new Date().toLocaleString('ar-EG', { hour12: false });


    const plainMessage = `
طلب إضافة مسار جديد:

نقطة الانطلاق: ${from}
نقطة الوصول: ${to}
السعر: ${price} جنيه
وسيلة المواصلات: ${transport}
بريد المرسل: ${senderEmail}
وقت الطلب: ${timeField}

---
تم إرسال هذا الطلب من موقع وصال
`;

    const params = {
      name: nameField,
      time: timeField,
      message: plainMessage
    };

    console.log('emailjs.send params:', { SERVICE_ID, TEMPLATE_ID, params });

    emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
      .then(function (response) {
        console.log('EmailJS success:', response);
        showSuccessMessage();
        form.reset();
      })
      .catch(function (err) {
        console.error('EmailJS error:', err);
        alert('حدث خطأ أثناء الإرسال. افتح Console للمزيد.');
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showSuccessMessage() {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.style.position = 'fixed';
  successDiv.style.left = '50%';
  successDiv.style.top = '20px';
  successDiv.style.transform = 'translateX(-50%)';
  successDiv.style.background = '#2ecc71';
  successDiv.style.color = '#fff';
  successDiv.style.padding = '10px 16px';
  successDiv.style.borderRadius = '6px';
  successDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  successDiv.style.zIndex = '9999';
  successDiv.textContent = 'تم إرسال الطلب بنجاح!';
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}