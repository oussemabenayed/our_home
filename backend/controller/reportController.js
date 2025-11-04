import Report from "../models/reportModel.js";
import Property from "../models/propertymodel.js";

const createReport = async (req, res) => {
    try {
        const { propertyId, category, description } = req.body;
        const reporterId = req.user._id;

        // Validate property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ 
                message: "Property not found", 
                success: false 
            });
        }

        // Check if user already reported this property
        const existingReport = await Report.findOne({ 
            propertyId, 
            reporterId 
        });
        
        if (existingReport) {
            return res.status(400).json({ 
                message: "You have already reported this property", 
                success: false 
            });
        }

        // Create new report
        const report = new Report({
            propertyId,
            reporterId,
            category,
            description: description.trim()
        });

        await report.save();

        res.status(201).json({ 
            message: "Report submitted successfully", 
            success: true,
            reportId: report._id
        });

    } catch (error) {
        console.log("Error creating report:", error);
        res.status(500).json({ 
            message: "Server Error", 
            success: false 
        });
    }
};

const getUserReports = async (req, res) => {
    try {
        const reports = await Report.find({ reporterId: req.user._id })
            .populate('propertyId', 'title location price')
            .sort({ createdAt: -1 });

        res.json({ 
            reports, 
            success: true 
        });

    } catch (error) {
        console.log("Error fetching user reports:", error);
        res.status(500).json({ 
            message: "Server Error", 
            success: false 
        });
    }
};

// Admin functions for future admin panel
const getAllReports = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        const reports = await Report.find(query)
            .populate('propertyId', 'title location price user')
            .populate('reporterId', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Report.countDocuments(query);

        res.json({ 
            reports, 
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            success: true 
        });

    } catch (error) {
        console.log("Error fetching all reports:", error);
        res.status(500).json({ 
            message: "Server Error", 
            success: false 
        });
    }
};

const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const report = await Report.findByIdAndUpdate(
            id,
            {
                status,
                adminNotes,
                reviewedBy: req.user._id,
                reviewedAt: new Date()
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ 
                message: "Report not found", 
                success: false 
            });
        }

        res.json({ 
            message: "Report updated successfully", 
            report,
            success: true 
        });

    } catch (error) {
        console.log("Error updating report:", error);
        res.status(500).json({ 
            message: "Server Error", 
            success: false 
        });
    }
};

export { createReport, getUserReports, getAllReports, updateReportStatus };