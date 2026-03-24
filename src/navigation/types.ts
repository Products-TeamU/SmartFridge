export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: { token: string };
  Home: undefined;
  AddProduct: undefined;
  ProductDetail: { productId: string };
  EditProduct: { product: any };
  // добавьте другие экраны по необходимости
};