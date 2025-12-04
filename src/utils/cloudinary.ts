import { v2 as cloudinary, UploadApiResponse } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



export const cloudinaryUploadImage = async (
    fileToUpload: string
): Promise<UploadApiResponse> => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resource_type: "auto",
        });

        return data;
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        throw new Error("Internal Server Error! (cloudinary upload)");
    }
};


export const cloudinaryRemoveImage = async (
    imagePublicId: string
): Promise<{ result: string }> => {
    try {
        const result = await cloudinary.uploader.destroy(imagePublicId);
        return result;
    } catch (err) {
        console.error("Cloudinary delete error:", err);
        throw new Error("Internal Server Error! (cloudinary delete)");
    }
};


export const cloudinaryRemoveImages = async (
    publicIds: string[]
): Promise<any> => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (err) {
        console.error("Cloudinary multiple delete error:", err);
        throw new Error("Internal Server Error! (cloudinary delete many)");
    }
};
