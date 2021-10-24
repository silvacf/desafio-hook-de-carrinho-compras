import React, { useState, useEffect } from "react";
import { MdAddShoppingCart } from "react-icons/md";

import { ProductList } from "./styles";
import { api } from "../../services/api";
import { formatPrice } from "../../util/format";
import { useCart } from "../../hooks/useCart";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce(
    (sumAmount, product) => {
      let updatedAmount = {...sumAmount}
      switch (product.id) {
        case 1:
          updatedAmount[1] = product.amount;
          break;
        case 2:
          updatedAmount[2] = product.amount;
          break;
        case 3:
          updatedAmount[3] = product.amount;
          break;
        case 4:
          updatedAmount[4] = product.amount;
          break;
        case 5:
          updatedAmount[5] = product.amount;
          break;
        case 6:
          updatedAmount[6] = product.amount;
          break;
      }
      return updatedAmount;
    },
    {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    } as CartItemsAmount
  );

  useEffect(() => {
    async function loadProducts() {
      let response = await api.get<Product[]>("/products");
      let result = response.data.map(
        (product) => ({...product, priceFormatted: formatPrice(product.price)})
      );
      setProducts(result);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map((product) => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0} 
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
