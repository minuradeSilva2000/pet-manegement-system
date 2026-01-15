import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String 
        },
        category: { 
            type: String, 
            required: true, 
            enum: ['Accessories', 'Toys', 'Housing', 'Food', 'Health', 'Others'] 
        },
        price: { 
            type: Number, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true 
        },
        imageUrl: { 
            type: String, 
        }, 
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
