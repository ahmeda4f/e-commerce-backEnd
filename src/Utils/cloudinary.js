import { v2 as cloudinary } from "cloudinary";

const cloudinaryConnection = () => {
  cloudinary.config({
    cloud_name: "depqeosdl",
    api_key: "416997362355451",
    api_secret: "MWg_IGdQFicXQ6uYNqqb27z9_74",
  });
  return cloudinary;
};

export default cloudinaryConnection;
