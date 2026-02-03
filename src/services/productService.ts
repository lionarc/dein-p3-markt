import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Product } from '../types';

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  // Add a new product
  async addProduct(
    name: string,
    description: string,
    price: number,
    qrCode: string,
    imageUrl: string
  ): Promise<string> {
    try {
      // Add product to Firestore
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        name,
        description,
        price,
        qrCode,
        imageUrl,
        createdAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          qrCode: data.qrCode,
          createdAt: data.createdAt.toDate(),
        });
      });

      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Get product by QR code
  async getProductByQRCode(qrCode: string): Promise<Product | null> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('qrCode', '==', qrCode)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        qrCode: data.qrCode,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Error getting product by QR code:', error);
      throw error;
    }
  },

  // Delete a product
  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};
