import React, { useState, useEffect } from 'react';
import { getAllReports, updateReportStatus } from '../services/api';
import { toast } from 'react-toastify';
import { Flag, User, Building, Calendar, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getAllReports();
      
      if (response.success) {
        setReports(response.reports);
      }
    } catch (error) {
      toast.error('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus, notes = '') => {
    try {
      const response = await updateReportStatus(reportId, newStatus, notes);
      if (response.success) {
        toast.success(`Report ${newStatus} successfully`);
        fetchReports();
        setSelectedReport(null);
        setAdminNotes('');
      }
    } catch (error) {
      toast.error('Error updating report status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'inappropriate_content': 'bg-red-100 text-red-800',
      'spam': 'bg-orange-100 text-orange-800',
      'fraud': 'bg-red-200 text-red-900',
      'misleading_info': 'bg-yellow-100 text-yellow-800',
      'duplicate_listing': 'bg-blue-100 text-blue-800',
      'wrong_category': 'bg-purple-100 text-purple-800',
      'poor_quality': 'bg-gray-100 text-gray-800',
      'harassment': 'bg-red-100 text-red-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatCategoryName = (category) => {
    if (!category) return 'Unknown';
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const statusCounts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
        <div className="text-sm text-gray-500">
          Total: {reports.length} reports
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'resolved', label: 'Resolved', count: statusCounts.resolved },
            { key: 'dismissed', label: 'Dismissed', count: statusCounts.dismissed },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No reports found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <div key={report._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(report.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                              {report.status?.charAt(0).toUpperCase() + report.status?.slice(1) || 'Pending'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                              {formatCategoryName(report.category)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Reporter Info */}
                          <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">Reporter Information</h3>
                            {report.reporterId ? (
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <User className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{report.reporterId.name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-gray-600">{report.reporterId.email}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Reporter information not available</p>
                            )}
                          </div>

                          {/* Property Info */}
                          <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">Reported Property</h3>
                            {report.propertyId ? (
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="font-medium">{report.propertyId.title}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <span>{report.propertyId.location}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Property information not available</p>
                            )}
                          </div>
                        </div>

                        {/* Report Details */}
                        {report.description && (
                          <div className="space-y-2">
                            <h3 className="font-medium text-gray-900">Report Description</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              {report.description}
                            </p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {report.adminNotes && (
                          <div className="space-y-2">
                            <h3 className="font-medium text-gray-900">Admin Notes</h3>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                              {report.adminNotes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {report.status === 'pending' && (
                          <div className="flex space-x-3 pt-4">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(report._id, 'resolved')}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                            >
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Report
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add notes about your decision..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleStatusUpdate(selectedReport._id, 'resolved', adminNotes)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedReport._id, 'dismissed', adminNotes)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
              
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNotes('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;