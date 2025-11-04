import fs from "fs";
import imagekit from "../config/imagekit.js";
import Property from "../models/propertymodel.js";
import neighborhoodService from "../services/neighborhoodService.js";

const addproperty = async (req, res) => {
    try {
        const { title, location, latitude, longitude, price, beds, baths, sqft, type, availability, description, amenities, phone } = req.body;
        const amenitiesArray = amenities ? amenities.split(',') : [];

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        const imageUrls = await Promise.all(
            images.map(async (item) => {
                const result = await imagekit.upload({
                    file: fs.readFileSync(item.path),
                    fileName: item.originalname,
                    folder: "Property",
                });
                fs.unlink(item.path, (err) => {
                    if (err) console.log("Error deleting the file: ", err);
                });
                return result.url;
            })
        );

        const product = new Property({
            title,
            location,
            latitude,
            longitude,
            price,
            beds,
            baths,
            sqft,
            type,
            availability,
            description,
            amenities: amenitiesArray,
            image: imageUrls,
            phone,
            user: req.user._id
        });

        await product.save();

        // Trigger neighborhood analysis in background
        if (latitude && longitude) {
            neighborhoodService.analyzeNeighborhood(
                product._id, 
                location, 
                { lat: parseFloat(latitude), lng: parseFloat(longitude) }
            ).catch(err => console.log('Background neighborhood analysis failed:', err));
        }

        res.json({ message: "Product added successfully", success: true });
    } catch (error) {
        console.log("Error adding product: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const listproperty = async (req, res) => {
    try {
        const property = await Property.find();
        res.json({ property, success: true });
    } catch (error) {
        console.log("Error listing products: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const removeproperty = async (req, res) => {
    try {
        const property = await Property.findById(req.body.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        // Check if the user owns the property
        if (property.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to remove this property", success: false });
        }

        await Property.findByIdAndDelete(req.body.id);

        return res.json({ message: "Property removed successfully", success: true });
    } catch (error) {
        console.log("Error removing product: ", error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

const updateproperty = async (req, res) => {
    try {
        const { id, title, location, latitude, longitude, price, beds, baths, sqft, type, availability, description, amenities, phone, existingImages: existingImagesString } = req.body;
        const amenitiesArray = amenities ? amenities.split(',') : [];
        const existingImages = JSON.parse(existingImagesString || '[]');

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        if (property.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this property", success: false });
        }

        let newImageUrls = [];
        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files.image1 && req.files.image1[0];
            const image2 = req.files.image2 && req.files.image2[0];
            const image3 = req.files.image3 && req.files.image3[0];
            const image4 = req.files.image4 && req.files.image4[0];

            const imagesToUpload = [image1, image2, image3, image4].filter((item) => item !== undefined);

            newImageUrls = await Promise.all(
                imagesToUpload.map(async (item) => {
                    const result = await imagekit.upload({
                        file: fs.readFileSync(item.path),
                        fileName: item.originalname,
                        folder: "Property",
                    });
                    fs.unlink(item.path, (err) => {
                        if (err) console.log("Error deleting the file: ", err);
                    });
                    return result.url;
                })
            );
        }

        const finalImageUrls = [...existingImages, ...newImageUrls].slice(0, 4);

        property.title = title;
        property.location = location;
        property.latitude = latitude;
        property.longitude = longitude;
        property.price = price;
        property.beds = beds;
        property.baths = baths;
        property.sqft = sqft;
        property.type = type;
        property.availability = availability;
        property.description = description;
        property.amenities = amenitiesArray;
        property.image = finalImageUrls;
        property.phone = phone;

        await property.save();

        // Trigger neighborhood analysis if coordinates changed
        if (latitude && longitude) {
            neighborhoodService.analyzeNeighborhood(
                property._id, 
                location, 
                { lat: parseFloat(latitude), lng: parseFloat(longitude) }
            ).catch(err => console.log('Background neighborhood analysis failed:', err));
        }

        res.json({ message: "Property updated successfully", success: true });
    } catch (error) {
        console.log("Error updating product: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const singleproperty = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid property ID format", success: false });
        }
        
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        if (property.views < 1500) {
            property.views += Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        } else {
            property.views += 1;
        }
        await property.save();
        
        // Check if user is authenticated and get their like/dislike status
        let userLiked = false;
        let userDisliked = false;
        
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;
                
                userLiked = property.likedBy.includes(userId);
                userDisliked = property.dislikedBy.includes(userId);
            } catch (authError) {
                // User not authenticated, keep defaults
            }
        }
        
        res.json({ 
            property, 
            userLiked, 
            userDisliked, 
            success: true 
        });
    } catch (error) {
        console.log("Error fetching property:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const userlistproperty = async (req, res) => {
    try {
        const property = await Property.find({ user: req.user._id })
            .select('-likedBy -dislikedBy') // Exclude large arrays for better performance
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean(); // Return plain objects for better performance
        
        res.json({ property, success: true });
    } catch (error) {
        console.log("Error listing user products: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const getNeighborhoodAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid property ID format", success: false });
        }
        
        const property = await Property.findById(id);
        
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        try {
            const amenities = await neighborhoodService.analyzeNeighborhood(
                property._id,
                property.location,
                property.latitude && property.longitude ? 
                    { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) } : null
            );
            res.json({ amenities: amenities || [], success: true });
        } catch (analysisError) {
            console.log("Neighborhood analysis failed:", analysisError);
            // Return empty amenities instead of error to not break the UI
            res.json({ amenities: [], success: true });
        }
    } catch (error) {
        console.log("Error getting neighborhood analysis:", error);
        res.json({ amenities: [], success: true }); // Return empty instead of error
    }
};

const likeProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid property ID format", success: false });
        }
        
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        const hasLiked = property.likedBy.includes(userId);
        const hasDisliked = property.dislikedBy.includes(userId);

        if (hasLiked) {
            // Unlike
            property.likedBy.pull(userId);
            property.likes = Math.max(0, property.likes - 1);
        } else {
            // Like
            property.likedBy.push(userId);
            property.likes += 1;
            
            // Remove from dislikes if previously disliked
            if (hasDisliked) {
                property.dislikedBy.pull(userId);
                property.dislikes = Math.max(0, property.dislikes - 1);
            }
        }

        await property.save();
        
        res.json({ 
            success: true, 
            likes: property.likes, 
            dislikes: property.dislikes,
            userLiked: !hasLiked,
            userDisliked: false
        });
    } catch (error) {
        console.log("Error liking property:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const dislikeProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid property ID format", success: false });
        }
        
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        const hasLiked = property.likedBy.includes(userId);
        const hasDisliked = property.dislikedBy.includes(userId);

        if (hasDisliked) {
            // Remove dislike
            property.dislikedBy.pull(userId);
            property.dislikes = Math.max(0, property.dislikes - 1);
        } else {
            // Dislike
            property.dislikedBy.push(userId);
            property.dislikes += 1;
            
            // Remove from likes if previously liked
            if (hasLiked) {
                property.likedBy.pull(userId);
                property.likes = Math.max(0, property.likes - 1);
            }
        }

        await property.save();
        
        res.json({ 
            success: true, 
            likes: property.likes, 
            dislikes: property.dislikes,
            userLiked: false,
            userDisliked: !hasDisliked
        });
    } catch (error) {
        console.log("Error disliking property:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

export { addproperty, listproperty, removeproperty, updateproperty , singleproperty, userlistproperty, getNeighborhoodAnalysis, likeProperty, dislikeProperty};