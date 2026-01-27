function toArray(maybeArray) {
  if (!maybeArray) return [];
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

function mapCustomers(tallyJson) {
  const ledgers =
    tallyJson?.ENVELOPE?.BODY?.DATA?.COLLECTION?.LEDGER ||
    tallyJson?.ENVELOPE?.BODY?.DATA?.LEDGER ||
    [];

  return toArray(ledgers).map((l) => ({
    code: l?.NAME || '',
    name: l?.NAME || '',
    phone: l?.LEDGERPHONE || l?.PARENT || '',
    email: l?.EMAIL || '',
    gst: l?.GSTREGISTRATIONNUMBER || '',
    address: toArray(l?.ADDRESSLIST?.ADDRESS).join(', '),
  }));
}

function mapInvoices(tallyJson) {
  const vouchers =
    tallyJson?.ENVELOPE?.BODY?.DATA?.COLLECTION?.VOUCHER ||
    tallyJson?.ENVELOPE?.BODY?.DATA?.VOUCHER ||
    [];

  return toArray(vouchers).map((v) => {
    const inventory = toArray(v?.INVENTORYENTRIES?.INVENTORYENTRY);
    const items = inventory.map((i) => ({
      name: i?.STOCKITEMNAME || '',
      quantity: i?.BILLEDQTY || i?.ACTUALQTY || '',
      rate: i?.RATE || '',
      amount: i?.AMOUNT || '',
    }));

    return {
      invoiceNo: v?.VOUCHERNUMBER || '',
      date: v?.DATE || '',
      customerName: v?.PARTYLEDGERNAME || '',
      items,
      totalAmount: v?.AMOUNT || v?.VOUCHERTOTAL || '',
    };
  });
}

module.exports = {
  mapCustomers,
  mapInvoices,
  toArray,
};
