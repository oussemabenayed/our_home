import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Flag, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Backendurl } from '../App';

const ReportProperty = ({ propertyId, propertyTitle, onClose }) => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    {
      value: 'misleading_images',
      label: t('report.types.misleading_images'),
      description: t('report.descriptions.misleading_images')
    },
    {
      value: 'incorrect_price',
      label: t('report.types.incorrect_price'),
      description: t('report.descriptions.incorrect_price')
    },
    {
      value: 'misleading_description',
      label: t('report.types.misleading_description'),
      description: t('report.descriptions.misleading_description')
    },
    {
      value: 'fake_listing',
      label: t('report.types.fake_listing'),
      description: t('report.descriptions.fake_listing')
    },
    {
      value: 'inappropriate_content',
      label: t('report.types.inappropriate_content'),
      description: t('report.descriptions.inappropriate_content')
    },
    {
      value: 'duplicate_listing',
      label: t('report.types.duplicate_listing'),
      description: t('report.descriptions.duplicate_listing')
    },
    {
      value: 'property_unavailable',
      label: t('report.types.property_unavailable'),
      description: t('report.descriptions.property_unavailable')
    },
    {
      value: 'spam',
      label: t('report.types.spam'),
      description: t('report.descriptions.spam')
    },
    {
      value: 'other',
      label: t('report.types.other'),
      description: t('report.descriptions.other')
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType || !description.trim()) {
      setError(t('report.validation.required_fields'));
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('report.validation.login_required'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(
        `${Backendurl}/api/reports/create`,
        {
          propertyId,
          category: reportType,
          description: description.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || t('report.error.submit_failed'));
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      if (error.response?.status === 400) {
        setError(error.response.data.message || t('report.error.already_reported'));
      } else {
        setError(t('report.error.network_error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-8 max-w-md w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('report.success.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('report.success.message')}
          </p>
          <p className="text-sm text-gray-500">
            {t('report.success.auto_close')}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('report.title')}
              </h2>
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {propertyTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('report.select_reason')}
              </label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      reportType === type.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={reportType === type.value}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mt-1 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {type.label}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('report.additional_details')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('report.description_placeholder')}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {t('report.description_help')}
                </p>
                <span className="text-xs text-gray-400">
                  {description.length}/500
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reportType || !description.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('report.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('report.submit')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportProperty;