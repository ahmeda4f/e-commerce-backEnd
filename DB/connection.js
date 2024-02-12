import mongoose from "mongoose";

const db_connection = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/eCommerce")
    .then((res) => {
      console.log("connected");
    })
    .catch((err) => console.log("error: ", err));
};

export default db_connection;
