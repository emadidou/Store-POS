import type { StoreSettings } from '../../api/types';
import { money } from '../../utils/format';

type LegalStoreSettings = StoreSettings & {
  company_name?: string | null;
  legal_name?: string | null;
  legal_form?: string | null;
  share_capital?: number | null;
  ice?: string | null;
  siren?: string | null;
  siret?: string | null;
  ape_code?: string | null;
  rc?: string | null;
  rcs_city?: string | null;
  vat_number?: string | null;
  tva?: string | null;
};

export function InvoiceFooter({ settings }: { settings: StoreSettings }) {
  const legalSettings = settings as LegalStoreSettings;
  const companyName = legalSettings.company_name ?? legalSettings.legal_name ?? legalSettings.store_name;
  const legalForm = legalSettings.legal_form;
  const vatNumber = legalSettings.vat_number ?? legalSettings.tva;
  const identifiers = [
    legalSettings.siren ? `SIREN : ${legalSettings.siren}` : null,
    legalSettings.ice ? `ICE : ${legalSettings.ice}` : null,
    legalSettings.siret ? `SIRET : ${legalSettings.siret}` : null,
    legalSettings.ape_code ? `APE/NAF : ${legalSettings.ape_code}` : null,
    legalSettings.rc ? `RCS${legalSettings.rcs_city ? ` ${legalSettings.rcs_city}` : ''} : ${legalSettings.rc}` : null,
    vatNumber ? `TVA intracommunautaire : ${vatNumber}` : null,
  ].filter(Boolean);

  return (
    <footer className="invoice-legal-footer">
      <p className="invoice-legal-company">
        {companyName}
        {legalForm ? ` ${legalForm}` : ''}
        {legalSettings.share_capital ? ` - Capital social : ${money(legalSettings.share_capital, legalSettings.currency)}` : ''}
      </p>
      <p>
        {[legalSettings.address, legalSettings.phone ? `Tel : ${legalSettings.phone}` : null, legalSettings.email ? `Email : ${legalSettings.email}` : null]
          .filter(Boolean)
          .join(' - ')}
      </p>
      {identifiers.length > 0 && <p>{identifiers.join(' - ')}</p>}
    </footer>
  );
}
