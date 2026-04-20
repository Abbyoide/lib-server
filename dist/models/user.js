import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    borrowedBooks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
}, { timestamps: true });
export const User = mongoose.model("User", userSchema);
//# sourceMappingURL=user.js.map