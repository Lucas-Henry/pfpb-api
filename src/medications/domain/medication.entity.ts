export interface Medication {
  product: string;
  indication: string;
  /** Sempre string, para preservar zeros a esquerda do EAN. */
  ean: string;
  /** "YYYY-MM" do PDF de origem. */
  sourceMonth: string;
}
