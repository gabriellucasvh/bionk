// src/types/mercadopago.ts

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MercadoPagoItem {
  id: string;
  title: string;
  description: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

export interface MercadoPagoPayerPhone {
  area_code: string;
  number: string;
}

export interface MercadoPagoPayerIdentification {
  type: string;
  number: string;
}

export interface MercadoPagoPayer {
  name?: string;
  surname?: string;
  email: string;
  phone?: MercadoPagoPayerPhone;
  identification?: MercadoPagoPayerIdentification;
}

export interface MercadoPagoBackUrls {
  success: string;
  failure: string;
  pending: string;
}

export interface MercadoPagoPaymentMethods {
  excluded_payment_methods?: { id: string }[];
  excluded_payment_types?: { id: string }[];
  installments?: number;
}

export interface MercadoPagoPreferenceRequest {
  items: MercadoPagoItem[];
  payer?: MercadoPagoPayer;
  back_urls?: MercadoPagoBackUrls;
  auto_return?: string;
  payment_methods?: MercadoPagoPaymentMethods;
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

export interface MercadoPagoPaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  external_reference: string;
}