import React from 'react';
import { useTranslation } from 'react-i18next';
import useContactForm from './useContactform';

const ContactForm = () => {
  const { t } = useTranslation();
  const { formData, errors, handleChange, handleSubmit } = useContactForm();
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name">{t('contact_form.name')} *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email">{t('contact_form.email')} *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone">{t('contact_form.phone')}</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="message">{t('contact_form.message')} *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
        />
        {errors.message && <p>{errors.message}</p>}
      </div>

      <button type="submit">{t('contact_form.send_message')}</button>
    </form>
  );
};

export default ContactForm;