require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dcudtw6eq",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

(async function() {
    try {
        const results = await cloudinary.uploader.upload("./uploads/uploaded_file-1779084796546-702402815.png");
        console.log("Upload Success:", results);
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
    }
})();
