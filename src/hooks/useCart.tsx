import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      let productInCart = updatedCart.find(
        (product) => product.id === productId
      );
      let productQuantityInCart = productInCart ? productInCart.amount : 0;
      let productsQuantityInStockResponse = await api.get(`stock/${productId}`);
      let productsQuantityInStock = productsQuantityInStockResponse.data.amount;
      if (productQuantityInCart < productsQuantityInStock) {
        if (productInCart) {
          productInCart.amount += 1;
        } else {
          let response = await api.get(`products/${productId}`);
          let newProduct = {
            ...response.data,
            amount: 1,
          };
          updatedCart.push(newProduct);
        }
      } else {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let updatedCart = [...cart];
      let productInCart = updatedCart.findIndex(
        (product) => product.id === productId
      );
      if (productInCart !== -1) {
        updatedCart = [
          ...updatedCart.slice(0, productInCart),
          ...updatedCart.slice(productInCart, updatedCart.length - 1),
        ];
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }
      const updatedCart = [...cart];
      let productInCart = updatedCart.find(
        (product) => product.id === productId
      );
      if (productInCart) {
        let productsQuantityInStockResponse = await api.get(
          `stock/${productId}`
        );
        let productsQuantityInStock =
          productsQuantityInStockResponse.data.amount;
        if (amount > productsQuantityInStock) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        } else {
          productInCart.amount = amount;
          setCart(updatedCart);
          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify(updatedCart)
          );
        }
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
