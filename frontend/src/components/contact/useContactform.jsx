import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import { Backendurl } from '../../App';

export default function useContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact_form.name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact_form.email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contact_form.email_invalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact_form.message_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(`${Backendurl}/api/forms/submit`, formData);
        toast.success(t('contact_form.submit_success'));
        // Reset form
        setFormData({ name: '', email: '', phone: '', message: '' });
      } catch (error) {
        toast.error(t('contact_form.submit_error'));
        console.error('Error submitting form:', error);
      }
    } else {
      console.log('Validation errors:', errors); // Debugging log
    }
  };

  return { formData, errors, handleChange, handleSubmit };
}