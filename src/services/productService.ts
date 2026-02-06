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
import type { Product, ProductsConfig } from '../types';

const PRODUCTS_COLLECTION = 'products';

// Cache for products config
let productsConfigCache: ProductsConfig | null = null;

export const productService = {
  // Load products config from JSON
  async loadProductsConfig(): Promise<ProductsConfig> {
    if (productsConfigCache) return productsConfigCache;
    
    try {
      const response = await fetch('/products.json');
      productsConfigCache = await response.json();
      return productsConfigCache!;
    } catch (error) {
      console.error('Error loading products config:', error);
      return { products: [], instructions: '' };
    }
  },

  // Add a new product
  async addProduct(
    name: string,
    description: string,
    price: number,
    barcode: string,
    imageUrl: string
  ): Promise<string> {
    try {
      // Add product to Firestore
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        name,
        description,
        price,
        barcode,
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
          barcode: data.barcode,
          createdAt: data.createdAt.toDate(),
        });
      });

      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Get product by barcode
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('barcode', '==', barcode)
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
        barcode: data.barcode,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Error getting product by barcode:', error);
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

  // Delete all products
  async deleteAllProducts(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      let deletedCount = 0;
      
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, docSnapshot.id));
        deletedCount++;
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Error deleting all products:', error);
      throw error;
    }
  },
};
